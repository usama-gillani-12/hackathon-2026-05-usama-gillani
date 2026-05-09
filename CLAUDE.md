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
plans/                  # Feature implementation plans (one .md per feature)
src/
  features/             # One folder per screen/feature; each follows the folder pattern:
    dashboard/          #   [Name]Screen.tsx  ← JSX only
    analytics/          #   [Name].hooks.ts   ← all state, effects, service calls
    trending/           #   [Name].styles.ts  ← StyleSheet.create only
    discover/           #   index.ts          ← re-exports the screen
    watchlist/
    product-detail/
    score-breakdown/
    compare-products/
    product-test-plan/
    profile/
    settings/
    notifications/
    investor-metrics/
    onboarding/
    auth/
      login/            #   LoginScreen.tsx + Login.hooks.ts + Login.styles.ts + index.ts
      signup/
    credits/
      buy-credits/
      transaction-history/
      payment-success/
  shared/               # Cross-feature reusable code
    components/         # UI atoms & molecules (each in its own kebab-case folder)
      app-button/       #   AppButton.tsx + AppButton.styles.ts + index.ts
      product-card/     #   ProductCard.tsx + ProductCard.styles.ts + index.ts
      search-bar/       #   SearchBar.tsx + SearchBar.styles.ts + index.ts
      drawer/           #   CustomDrawerContent.tsx + styles + index.ts
      skeletons/        #   Flat: *.tsx + *.styles.ts + barrel index.ts
      …                 #   (24 component folders total)
    hooks/              # Cross-feature hooks
      usePaginatedList.ts
      queries/          # React Query hooks (useProductsQuery, useWatchlistQuery, …)
  core/                 # App-level wiring & external integrations
    navigation/         # Navigator definitions (App, Auth, BottomTab, Drawer, RootStack)
    stores/             # Zustand stores (one file per domain)
    services/           # Business-logic services (productService, scoringService, …)
    api/                # Raw fetch functions for each data source
    lib/                # Third-party client singletons (supabase.ts)
    config/             # wagmi.ts and other config singletons
  theme/                # Design tokens — import via @theme/, never use raw values
  constants/            # App-wide magic numbers and string constants (@constants)
  types/                # Global TypeScript types and declaration files (@t/)
  mocks/                # Bundled mock data (@mocks/)
  utils/                # Pure utility functions (@utils/)
```

### Key module locations

| What | Where | Alias |
|------|-------|-------|
| Color tokens | `src/theme/colors.ts` | `@theme/colors` |
| Gradient presets | `src/theme/colors.ts` → `gradients` | `@theme/colors` |
| Spacing / radius / shadow | `src/theme/spacing.ts` | `@theme/spacing` |
| Typography scale | `src/theme/typography.ts` | `@theme/typography` |
| Responsive scale helpers (`ms`, `s`, `vs`) | `src/theme/responsive.ts` | `@theme/responsive` |
| Supabase client | `src/core/lib/supabase.ts` | `@core/lib/supabase` |
| Mock products | `src/mocks/mockProducts.ts` | `@mocks/mockProducts` |
| Mock social buzz | `src/mocks/mockSocialBuzz.ts` | `@mocks/mockSocialBuzz` |
| Query key factory | `src/shared/hooks/queries/keys.ts` | `@hooks/queries/keys` |
| App constants | `src/constants/index.ts` | `@constants` |
| Scoring service | `src/core/services/scoringService.ts` | `@core/services/scoringService` |
| Product service | `src/core/services/productService.ts` | `@core/services/productService` |
| Payment service | `src/core/services/paymentService.ts` | `@core/services/paymentService` |
| Auth store | `src/core/stores/useAuthStore.ts` | `@core/stores/useAuthStore` |
| Product store | `src/core/stores/useProductStore.ts` | `@core/stores/useProductStore` |

### Import alias reference

| Alias | Resolves to | Use for |
|-------|-------------|---------|
| `@features/*` | `src/features/*` | Screens (via their `index.ts`) |
| `@shared/*` | `src/shared/*` | Shared components and hooks |
| `@core/*` | `src/core/*` | Stores, services, API, navigation, lib |
| `@theme/*` | `src/theme/*` | All design tokens |
| `@utils/*` | `src/utils/*` | Pure utility functions |
| `@hooks/*` | `src/hooks/*` | Shared hooks and React Query hooks |
| `@mocks/*` | `src/mocks/*` | Bundled mock data |
| `@constants` | `src/constants/index.ts` | App-wide constants (single import) |
| `@t/*` | `src/types/*` | TypeScript interfaces and types |

## Architecture

### Data flow

```
APIs (Amazon/DummyJSON/FakeStore/YouTube)
  └─▶ productService.ts       ← orchestrates sources, dedupes, caches in memory
        └─▶ scoringService.ts ← buildScore() produces ScoredProduct (pure function)
              └─▶ useProductStore (Zustand) ← holds [ScoredProduct[]] for screens
                    └─▶ useProductsQuery (React Query) ← wraps store.load() for screens
```

Persistent state lives in `AsyncStorage` via Zustand `persist` middleware: credits, transactions, unlocked product IDs, watchlist, and settings each have their own store (`src/core/stores/`). React Query is used only for reading these stores as query-cached values (not for network calls directly).

### Scoring engine (`src/core/services/scoringService.ts`)

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

`rating10 >= PREMIUM_THRESHOLD (9)` → product is `isPremium`. Unlock costs: 9/10 = `UNLOCK_COST_9` (3 credits), 10/10 = `UNLOCK_COST_10` (5 credits). Constants live in `@constants`.

### Payment system (`src/core/services/paymentService.ts`)

`PaymentService` is an interface. The running implementation is `MockPaymentService` (simulates ~1.4s latency, generates a `0x…` 64-char hex hash, marks tx `confirmed` on `mock` network). Swap in a real implementation via `setPaymentService(new LivePaymentService())` at app start — everything else in the app reads from the registered service.

### Product sources (priority order)

1. **Amazon** (`EXPO_PUBLIC_RAPIDAPI_KEY`) — Real-Time Amazon Data via RapidAPI
2. **DummyJSON** (`https://dummyjson.com/products`) — free, no key
3. **Fake Store** (`https://fakestoreapi.com/products`) — free, no key
4. **Bundled mock** (`src/mocks/mockProducts.ts`) — always blended in at the front so demo hero products always appear

`cachedResult` in `src/core/services/productService.ts` is a module-level variable; call `clearProductCache()` or `loadScoredProducts({ refresh: true })` to bust it.

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
import { colors, gradients, withOpacity } from '@theme/colors';
import { spacing, radius, shadow } from '@theme/spacing';
import { ms, s, vs } from '@theme/responsive';
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
- Supabase API errors are mapped to human-friendly messages in `mapAuthError()` in `src/core/stores/useAuthStore.ts` and shown in a red banner above the CTA button
- Server errors clear when the user types in any field

### Environment variables

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL — required for auth |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key — required for auth |
| `EXPO_PUBLIC_RAPIDAPI_KEY` | Real-Time Amazon Data API (RapidAPI) — unlocks Discover screen live data |
| `EXPO_PUBLIC_YOUTUBE_API_KEY` | YouTube Data API v3 — social buzz scoring; degrades gracefully to mock if absent |

Supabase keys are required for login/signup; the app shows a dev warning and disables auth if absent. RapidAPI/YouTube are optional — app falls back to mock data.

### Pagination pattern (`src/shared/hooks/usePaginatedList.ts`)

All scrollable lists use `usePaginatedList<T>(source, pageSize)` for client-side pagination. The hook slices a memoised source array into pages and resets to page 1 automatically whenever the source reference changes (i.e. when a filter or sort is applied upstream).

**Standard page sizes (also defined in `@constants`):**
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

`ListFooterLoader` (`src/shared/components/list-footer-loader/`) renders an `ActivityIndicator` while loading more, then "All N items shown" once the list is exhausted, and nothing while there are more items yet to load. Import it via `@shared/components/list-footer-loader`.

## Feature Plans

Every non-trivial feature or multi-phase implementation **must** have a plan file at `plans/<feature-slug>.md` before or alongside the code. The plan is a permanent record — write it even if you implement the feature in the same session.

### Plan file structure

```markdown
# Feature Name — Feature Plan

## Why This Feature
<1–3 sentences on the problem and business value>

## Phases / Sections
<One section per phase. Each phase includes:>
- What it does (plain language)
- How it works (data flow, key logic decisions)
- API used and why chosen
- Files changed table

## Verification
<bash commands + test flow checklist>
```

### Rules
- **Always create a plan file** for any feature that touches ≥ 3 files or adds a new API integration.
- Mark phases as `✅ Done` as they complete — the file is living documentation.
- When choosing between free APIs, document **why** you picked one over alternatives (e.g. "Product Hunt requires OAuth, HN Algolia is zero-key").
- Plan files live at the repo root in `plans/`, not inside `src/`.
- Use the `/feature-plan` skill to scaffold a plan interactively before implementation.

---

## Things to Never Do

- **Never read environment variables at runtime** — `process.env.EXPO_PUBLIC_*` must be accessed only in files processed at bundle time (`src/core/api/`, `src/core/lib/`). They are inlined by `babel-plugin-transform-inline-environment-variables` and return `undefined` if read inside a dynamic expression.
- **Never use raw pixel values** — all sizes go through `ms()`, `s()`, or `vs()` from `react-native-size-matters`. Raw numbers for `width`, `height`, `fontSize`, `padding`, `margin`, or `borderRadius` are a hard violation of the theme system.
- **Never hardcode hex colors** — import from `@theme/colors` only. Use `colors.*` semantic tokens or `withOpacity()`. Never paste a hex value directly.
- **Never write to a Zustand store from inside a React Query `queryFn`** — the query layer is read-only; mutations go through store actions.
- **Never place a FlatList over 20 items without `usePaginatedList`** — client-side pagination is mandatory. See `@hooks/usePaginatedList`.
- **Never call Reanimated worklets on the JS thread** — use `useAnimatedStyle`, `useSharedValue`, and `withTiming`/`withSpring` only. Only use `runOnJS` when bridging a Reanimated callback to a store write.
- **Never skip TypeScript strict checks** — `yarn ts:check` must pass. No `@ts-ignore` or `as any` without an explicit comment explaining why.
- **Never leave `console.log` / `console.warn` in production paths** — wrap in `if (__DEV__)` inside services, stores, and screens.
- **Never use relative `../../` paths** — all cross-folder imports use the `@alias/` system (see alias table above). The only allowed relative imports are same-folder (`./`) ones, e.g. a screen importing its own `./[Name].hooks` or `./[Name].styles`.
- **Never put logic in a Screen file** — state, effects, store calls, and service calls belong in the screen's `.hooks.ts` file. The Screen file is JSX only.
- **Never put StyleSheet.create in a Screen or Component file** — styles belong in the sibling `.styles.ts` file.

## Known Weirdness & Open Questions

### Weirdness

- **`app.json` references Expo** — this is a bare React Native CLI project. `app.json` is used by Metro for the app name and bundle ID only; `expo start` will not work correctly.
- **`geminiService.ts` in `@core/services/`** — Gemini API integration exists but is not wired to a live key. Falls back to static AI summaries generated in `scoringService.ts`.
- **Notification store is local-only** — `useNotificationStore` persists to AsyncStorage but has no backend sync. Push notifications are out of scope for MVP.
- **`src/hooks/` vs `src/shared/hooks/`** — the query hooks live at `src/hooks/queries/` (not moved in the refactor). Import them via `@hooks/queries/...`.
- **Metro cache after alias changes** — if you add a new `@alias` to `babel.config.js`, always restart Metro with `yarn start` (cache reset) for the new alias to take effect.
- **Folder pattern for new screens** — every new screen must follow the four-file pattern: `[Name]Screen.tsx` + `[Name].hooks.ts` + `[Name].styles.ts` + `index.ts`. Register it in the appropriate navigator in `@core/navigation/`.

### Open Questions

- Should `geminiService.ts` be connected to a live Gemini API key for the demo, or is the static fallback sufficient for hackathon judging?
- `docs/cost-log.md` Day 2 and Day 3 entries need to be filled in and final totals updated before submission.
