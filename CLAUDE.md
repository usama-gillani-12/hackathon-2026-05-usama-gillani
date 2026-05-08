# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Skills (`/.claude/skills/`)

Invoke any skill with `/<skill-name>` in Claude Code. Project-level skills live in `.claude/skills/`; reusable ones are also mirrored to `~/.claude/skills/`.

### UI skills
| Skill | Invoke | Purpose |
|-------|--------|---------|
| `ui-review` | `/ui-review <file>` | Review a screen/component against TrendPro's design system and UX standards |
| `component-gen` | `/component-gen <description>` | Scaffold a new RN component following TrendPro conventions (theme, sizing, Reanimated rules) |
| `theme-audit` | `/theme-audit [file]` | Scan for raw px values, hardcoded hex colors, and `ms()` violations; offers auto-fix |
| `auth-form` | `/auth-form <login\|signup\|both>` | Audit or update auth form validation (react-hook-form + yup), field-level error UX, and Supabase error mapping |

### Backend / data skills
| Skill | Invoke | Purpose |
|-------|--------|---------|
| `score-tune` | `/score-tune` | Audit or rebalance the 7-dimension scoring engine; weight changes require approval |
| `api-debug` | `/api-debug [error or screen]` | Debug Amazon RapidAPI / DummyJSON / FakeStore / YouTube integration issues |
| `mock-data` | `/mock-data [count]` | Generate realistic mock `Product[]` entries for `src/mocks/mockProducts.ts` |

### Quality & planning skills
| Skill | Invoke | Purpose |
|-------|--------|---------|
| `perf-audit` | `/perf-audit <file>` | Audit re-renders, FlatList config, memoisation, and animation performance |
| `feature-plan` | `/feature-plan <description>` | Plan a new feature end-to-end (navigation → store → service → screen); produces step list before writing code |
| `code-review` | `/code-review <file or diff>` | Full review scored against hackathon rubric (functionality, UI quality, production-readiness, Claude Code usage) |

## Commands

```bash
# Install dependencies
yarn install

# Start Metro bundler (resets cache)
yarn start          # or: react-native start --reset-cache

# Run on simulator
yarn ios            # React Native CLI (not Expo)
yarn android

# iOS native deps (after adding/removing packages)
yarn pod-install    # runs: cd ios && pod install --repo-update

# Type check
yarn ts:check       # tsc --noEmit

# Lint
yarn lint           # eslint src --ext .ts,.tsx
```

> This is a **bare React Native CLI** project (not Expo managed), despite the README mentioning Expo. Use `react-native run-ios` / `react-native run-android`, not `npx expo start`.

There are no automated tests. TypeScript (`yarn ts:check`) is the primary correctness gate.

## Source directory structure

```
src/
  api/              # Raw fetch functions for each data source (Amazon, DummyJSON, FakeStore, YouTube)
  components/       # Shared reusable UI components
    drawer/         # CustomDrawerContent
    skeletons/      # Skeleton loading placeholders
  constants/        # App-wide magic numbers and string constants (import from here, never hardcode)
  hooks/            # Custom hooks
    queries/        # React Query hooks (useProductsQuery, useWatchlistQuery, etc.)
  lib/              # Third-party client singletons (supabase.ts)
  mocks/            # Bundled mock data (mockProducts.ts, mockSocialBuzz.ts)
  navigation/       # Navigator definitions (App, Auth, BottomTab, Drawer, RootStack)
  screens/          # One file per screen; auth screens under screens/auth/
  services/         # Business-logic services (productService, scoringService, paymentService, …)
  stores/           # Zustand stores (one file per domain)
  theme/            # Design tokens — import from here, never use raw values
  types/            # Global TypeScript types and declaration files
  utils/            # Pure utility functions (no side effects)
```

### Key module locations

| What | Where |
|------|-------|
| Color tokens | `src/theme/colors.ts` |
| Gradient presets | `src/theme/colors.ts` → `gradients` |
| Spacing / radius / shadow | `src/theme/spacing.ts` |
| Typography scale | `src/theme/typography.ts` |
| Responsive scale helpers (`ms`, `s`, `vs`) | `src/theme/responsive.ts` |
| Supabase client | `src/lib/supabase.ts` |
| Mock products | `src/mocks/mockProducts.ts` |
| Mock social buzz | `src/mocks/mockSocialBuzz.ts` |
| Query key factory | `src/hooks/queries/keys.ts` |
| App constants | `src/constants/index.ts` |

## Architecture

### Data flow

```
APIs (Amazon/DummyJSON/FakeStore/YouTube)
  └─▶ productService.ts       ← orchestrates sources, dedupes, caches in memory
        └─▶ scoringService.ts ← buildScore() produces ScoredProduct (pure function)
              └─▶ useProductStore (Zustand) ← holds [ScoredProduct[]] for screens
                    └─▶ useProductsQuery (React Query) ← wraps store.load() for screens
```

Persistent state lives in `AsyncStorage` via Zustand `persist` middleware: credits, transactions, unlocked product IDs, watchlist, and settings each have their own store (`src/stores/`). React Query is used only for reading these stores as query-cached values (not for network calls directly).

### Scoring engine (`src/services/scoringService.ts`)

`buildScore(product, { socialBuzz })` is the core pure function. It computes 7 dimensions then combines them with fixed weights (see `src/constants/index.ts` → `SCORE_WEIGHTS`):

| Dimension | Weight |
|---|---|
| Demand | 25% |
| Social Buzz | 20% |
| Profit Potential | 20% |
| Product Rating | 15% |
| Shipping Ease | 10% |
| Competition (inverted) | 5% |
| Risk (inverted) | 5% |

`rating10 >= PREMIUM_THRESHOLD (9)` → product is `isPremium`. Unlock costs: 9/10 = `UNLOCK_COST_9` (3 credits), 10/10 = `UNLOCK_COST_10` (5 credits).

### Payment system (`src/services/paymentService.ts`)

`PaymentService` is an interface. The running implementation is `MockPaymentService` (simulates ~1.4s latency, generates a `0x…` 64-char hex hash, marks tx `confirmed` on `mock` network). Swap in a real implementation via `setPaymentService(new LivePaymentService())` at app start — everything else in the app reads from the registered service.

### Product sources (priority order)

1. **Amazon** (`EXPO_PUBLIC_RAPIDAPI_KEY`) — Real-Time Amazon Data via RapidAPI
2. **DummyJSON** (`https://dummyjson.com/products`) — free, no key
3. **Fake Store** (`https://fakestoreapi.com/products`) — free, no key
4. **Bundled mock** (`src/mocks/mockProducts.ts`) — always blended in at the front so demo hero products always appear

`cachedResult` in `productService.ts` is a module-level variable; call `clearProductCache()` or `loadScoredProducts({ refresh: true })` to bust it.

### Navigation structure

```
AppNavigator (Stack)
  ├── Onboarding (shown until useSettingsStore.onboardingComplete = true)
  └── MainApp → RootStackNavigator (Stack)
        ├── DrawerRoot → DrawerNavigator
        │     ├── BottomTabNavigator (5 tabs: Dashboard, Trending, Discover, Watchlist, Credits)
        │     └── Analytics, Profile, Settings, Notifications (drawer items)
        ├── ProductDetail
        ├── ScoreBreakdown
        ├── CompareProducts
        ├── ProductTestPlan
        └── PaymentSuccess (modal)
```

### Theme system (`src/theme/`)

All sizing goes through `ms()` (moderateScale from `react-native-size-matters`) — never use raw pixel values. Spacing and border-radius tokens are in `spacing.ts`. Typography scale in `typography.ts`. Colors and gradients in `colors.ts`.

**Colors are organised in two layers:**
- `palette` — raw hex values (e.g. `palette.blue600`). Use only inside `colors.ts`.
- `colors` — semantic tokens (e.g. `colors.accent`, `colors.danger`). Import these everywhere.
- `gradients` — `[start, end]` tuples for `LinearGradient` (e.g. `gradients.heroDark`).
- `withOpacity(hex, 0–1)` — returns `#rrggbbaa` for one-off alpha variants.

Dark hero sections use `gradients.heroDark`; light content uses `colors.card` on `colors.background`.

Import pattern:
```ts
import { colors, gradients, withOpacity } from '../theme';
// or directly:
import { colors } from '../theme/colors';
```

### Authentication form validation pattern

Auth forms use **react-hook-form + yup** (`mode: 'onTouched'` — validates on first blur, then live on change).

```tsx
const schema = yup.object({
  email: yup.string().required('Email is required').email('Enter a valid email address'),
  password: yup.string().required('Password is required').min(6, '...'),
});

const { control, handleSubmit, formState: { errors } } = useForm({
  resolver: yupResolver(schema),
  mode: 'onTouched',
});

<Controller control={control} name="email" render={({ field: { onChange, onBlur, value } }) => (
  <View style={styles.field}>
    <TextInput value={value} onChangeText={onChange} onBlur={() => { onBlur(); setEmailFocused(false); }} />
    {errors.email && <Text style={styles.fieldError}>{errors.email.message}</Text>}
  </View>
)} />
```

- Field-level errors show as small red text **below** the input (not in a banner)
- Input border turns red (`inputRowError`) when invalid, blue on focus, green on success (confirm password)
- Supabase API errors are mapped to human-friendly messages in `mapAuthError()` in `src/stores/useAuthStore.ts` and shown in a red banner above the CTA button
- Server errors clear when the user types in any field

### Environment variables

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL — required for auth |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key — required for auth |
| `EXPO_PUBLIC_RAPIDAPI_KEY` | Real-Time Amazon Data API (RapidAPI) — unlocks Discover screen live data |
| `EXPO_PUBLIC_YOUTUBE_API_KEY` | YouTube Data API v3 — social buzz scoring; degrades gracefully to mock if absent |

Supabase keys are required for login/signup; the app shows a dev warning and disables auth if absent. RapidAPI/YouTube are optional — app falls back to mock data.

### Pagination pattern (`src/hooks/usePaginatedList.ts`)

All scrollable lists use `usePaginatedList<T>(source, pageSize)` for client-side pagination. The hook slices a memoised source array into pages and resets to page 1 automatically whenever the source reference changes (i.e. when a filter or sort is applied upstream).

**Standard page sizes (also defined in `src/constants/index.ts`):**
| List type | pageSize |
|---|---|
| Product cards (~110 px tall) | 15 |
| Watchlist entries (~200 px tall) | 10 |
| Transaction rows (small) | 20 |
| Discover best-sellers | 12 |

**Required pattern for every new FlatList over a large dataset:**

```tsx
// 1. Source array MUST be memoised so reference changes only on real data changes
const filtered = useMemo(() => source.filter(...).sort(...), [source, dep1, dep2]);

// 2. Plug into the hook
const { items, total, hasMore, isLoadingMore, loadMore } = usePaginatedList(filtered, PAGE_SIZE_PRODUCTS);

// 3. Wire FlatList
<FlatList
  data={items}
  onEndReached={loadMore}
  onEndReachedThreshold={0.3}
  ListFooterComponent={
    <ListFooterLoader
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      total={total}
      shown={items.length}
      label="products"
    />
  }
/>
```

`ListFooterLoader` (`src/components/ListFooterLoader.tsx`) renders an `ActivityIndicator` while loading more, then "All N items shown" once the list is exhausted, and nothing while there are more items yet to load.

## Things to Never Do

- **Never read environment variables at runtime** — `process.env.EXPO_PUBLIC_*` must be accessed only in files processed at bundle time (`src/api/`, `src/lib/`). They are inlined by `babel-plugin-transform-inline-environment-variables` and return `undefined` if read inside a dynamic expression.
- **Never use raw pixel values** — all sizes go through `ms()`, `s()`, or `vs()` from `react-native-size-matters`. Raw numbers for `width`, `height`, `fontSize`, `padding`, `margin`, or `borderRadius` are a hard violation of the theme system.
- **Never hardcode hex colors** — import from `src/theme/colors.ts` only. Use `colors.*` semantic tokens or `withOpacity()`. Never paste a hex value directly.
- **Never write to a Zustand store from inside a React Query `queryFn`** — the query layer is read-only; mutations go through store actions.
- **Never place a FlatList over 20 items without `usePaginatedList`** — client-side pagination is mandatory. See `src/hooks/usePaginatedList.ts`.
- **Never call Reanimated worklets on the JS thread** — use `useAnimatedStyle`, `useSharedValue`, and `withTiming`/`withSpring` only. Only use `runOnJS` when bridging a Reanimated callback to a store write.
- **Never skip TypeScript strict checks** — `yarn ts:check` must pass. No `@ts-ignore` or `as any` without an explicit comment explaining why.
- **Never leave `console.log` / `console.warn` in production paths** — wrap in `if (__DEV__)` inside services, stores, and screens.

## Known Weirdness & Open Questions

### Weirdness

- **`src/queries/` was a migration shim** (now deleted). Always import query hooks from `src/hooks/queries/`.
- **`src/data/` was a stale duplicate** (now deleted). Canonical mock data is `src/mocks/`.
- **`src/services/supabase.ts` was a re-export shim** (now deleted). Import the Supabase client from `src/lib/supabase.ts` only.
- **`app.json` references Expo** — this is a bare React Native CLI project. `app.json` is used by Metro for the app name and bundle ID only; `expo start` will not work correctly.
- **`geminiService.ts` in services/** — Gemini API integration exists but is not wired to a live key. Falls back to static AI summaries generated in `scoringService.ts`.
- **Notification store is local-only** — `useNotificationStore` persists to AsyncStorage but has no backend sync. Push notifications are out of scope for MVP.

### Open Questions

- Should `geminiService.ts` be connected to a live Gemini API key for the demo, or is the static fallback sufficient for hackathon judging?
- `docs/cost-log.md` Day 2 and Day 3 entries need to be filled in and final totals updated before submission.
