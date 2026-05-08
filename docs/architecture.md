# TrendPro — Architecture

**Hackathon:** Let's AI Hackathon · May 7–9 2026

---

## 1. High-Level Data Flow

```
┌──────────────────────────────────────────────────────────┐
│                    External APIs                         │
│  Amazon RapidAPI   DummyJSON   FakeStore   YouTube API   │
│  (real-time-amazon  (free,      (free,      (social buzz  │
│   -data.p.rapid)    no key)     no key)     scoring)      │
└──────────────┬───────────────────────────────────────────┘
               │  raw Product[]
               ▼
┌─────────────────────────────┐
│      productService.ts      │  ← orchestrates all 4 sources
│  loadScoredProducts()       │  ← dedupes by id, blends mock heroes first
│  cachedResult (module-level)│  ← 5-min TTL cache (PRODUCT_CACHE_TTL_MS)
│  clearProductCache()        │  ← call to force refresh
└──────────────┬──────────────┘
               │  Product[]
               ▼
┌─────────────────────────────┐
│      scoringService.ts      │  ← pure function, no side effects
│  buildScore(product, inputs)│  ← 7-dimension weighted formula
│  buildTestPlan(scored)      │  ← generates ad test plan
└──────────────┬──────────────┘
               │  ScoredProduct[]
               ▼
┌─────────────────────────────┐
│   useProductStore (Zustand) │  ← holds ScoredProduct[] in memory
│   persist: false            │  ← intentionally NOT persisted (fresh scores)
└──────────────┬──────────────┘
               │  via store.load()
               ▼
┌─────────────────────────────┐
│  useProductsQuery           │  ← React Query wrapper (queryKey: ['products'])
│  (React Query)              │  ← staleTime: 5 min, refetchOnMount: false
└──────────────┬──────────────┘
               │  { data, isLoading, error }
               ▼
         Screen Components
    (DashboardScreen, TrendingProductsScreen, DiscoverScreen, …)
```

---

## 2. Persisted State (Zustand + AsyncStorage)

Each domain has its own store with `persist` middleware:

| Store | File | Persisted Keys | Purpose |
|-------|------|----------------|---------|
| `useAuthStore` | `stores/useAuthStore.ts` | `session` | Supabase session |
| `useCreditStore` | `stores/useCreditStore.ts` | `balance`, `transactions` | Credit balance + purchase history |
| `useWatchlistStore` | `stores/useWatchlistStore.ts` | `items` | Saved products |
| `useSettingsStore` | `stores/useSettingsStore.ts` | `onboardingComplete`, `theme` | App preferences |
| `useProductStore` | `stores/useProductStore.ts` | — | In-memory only (scores) |
| `useNotificationStore` | `stores/useNotificationStore.ts` | `notifications` | Notification inbox |

---

## 3. Navigation Tree

```
AppNavigator (NavigationContainer)
  │
  ├── [if !onboardingComplete]
  │     OnboardingScreen
  │
  ├── [if !session]
  │     AuthNavigator (Stack)
  │       ├── LoginScreen
  │       └── SignupScreen
  │
  └── [if session] RootStackNavigator (Stack, headerShown: false)
        ├── DrawerRoot → DrawerNavigator
        │     ├── [Tab] BottomTabNavigator
        │     │     ├── Dashboard       (DashboardScreen)
        │     │     ├── Trending        (TrendingProductsScreen)
        │     │     ├── Discover        (DiscoverScreen)
        │     │     ├── Watchlist       (WatchlistScreen)
        │     │     └── Credits         (BuyCreditsScreen)
        │     │
        │     └── [Drawer items]
        │           ├── Analytics       (AnalyticsScreen)
        │           ├── Profile         (ProfileScreen)
        │           ├── Settings        (SettingsScreen)
        │           └── Notifications   (NotificationsScreen)
        │
        ├── ProductDetail               (ProductDetailScreen)
        ├── ScoreBreakdown              (ScoreBreakdownScreen)
        ├── CompareProducts             (CompareProductsScreen)
        ├── ProductTestPlan             (ProductTestPlanScreen)
        ├── TransactionHistory          (TransactionHistoryScreen)
        └── PaymentSuccess              (PaymentSuccessScreen)  ← modal
```

---

## 4. Scoring Engine Detail

**File:** `src/services/scoringService.ts`  
**Entry point:** `buildScore(product: Product, inputs: ScoreInputs): ScoredProduct`

```
Score = demand×0.25 + socialBuzz×0.20 + profitPotential×0.20
      + productRating×0.15 + shippingEase×0.10
      + (100−competition)×0.05 + (100−risk)×0.05
```

Dimension sources:
- `demand`: derived from `product.stock`, `product.rating`, `product.discountPercent`
- `socialBuzz`: fetched via `youtubeApi.ts` (YouTube Data API v3), degrades to mock
- `profitPotential`: `calculateMargin(price, category)` → `marginPercent × 1.4`
- `productRating`: `(rating / 5) × 100`
- `shippingEase`, `competition`, `risk`: lookup tables keyed by category string

**Output path:** `winningScore` → `scoreToRating10()` → `isPremium` (rating10 ≥ 9) → `unlockCost` (3 or 5 credits)

---

## 5. Payment Service Architecture

**Pattern:** Strategy / Service Locator

```typescript
// Interface (contracts/paymentService.ts)
interface PaymentService {
  mode: 'mock' | 'testnet' | 'mainnet';
  createUsdcPaymentIntent(pkg): Promise<UsdcPaymentIntent>;
  verifyUsdcPayment(intentId): Promise<UsdcPaymentResult>;
  addCredits(pkg, result): Promise<CreditTransaction>;
}

// Active implementation (swappable at runtime)
let activeService: PaymentService = MockPaymentService;
export const setPaymentService = (s: PaymentService) => { activeService = s; };
```

`MockPaymentService` simulates 1.4s latency and generates a 64-char hex tx hash. In production, replace with `LivePaymentService` that calls a backend `/payments/verify` endpoint — the mobile client never holds keys.

---

## 6. Theme System

**Files:** `src/theme/`

| Layer | File | Export |
|-------|------|--------|
| Raw palette | `colors.ts` | `palette` (never import directly) |
| Semantic tokens | `colors.ts` | `colors` (use everywhere) |
| Gradient tuples | `colors.ts` | `gradients` |
| Alpha helper | `colors.ts` | `withOpacity(hex, 0–1)` |
| Spacing / radius / shadow | `spacing.ts` | `spacing`, `radius`, `shadow` |
| Typography scale | `typography.ts` | `typography` |
| Scale helpers | `responsive.ts` | `ms`, `s`, `vs` (moderateScale wrappers) |

**Rule:** All pixel values go through `ms()`. Raw numbers are a linting violation.

---

## 7. Product Source Priority

1. **Bundled mock heroes** (`src/mocks/mockProducts.ts`) — always prepended, ensures demo products appear first
2. **Amazon RapidAPI** (`EXPO_PUBLIC_RAPIDAPI_KEY`) — real best-sellers if key present
3. **DummyJSON** (`https://dummyjson.com/products`) — free fallback, no key
4. **FakeStore** (`https://fakestoreapi.com/products`) — free secondary fallback

All sources normalised through `normalizeProduct()` (`src/utils/normalizeProduct.ts`) to a unified `Product` shape before scoring.

---

## 8. Pagination Architecture

**File:** `src/hooks/usePaginatedList.ts`

All FlatLists over large datasets use this hook instead of rendering full arrays:

```
Source array (memoised) → usePaginatedList(source, pageSize)
  → { items, total, hasMore, isLoadingMore, loadMore }
    → FlatList data={items} onEndReached={loadMore}
      → ListFooterLoader (ActivityIndicator / "All N shown")
```

Page sizes defined in `src/constants/index.ts`:
- `PAGE_SIZE_PRODUCTS = 15`
- `PAGE_SIZE_WATCHLIST = 10`
- `PAGE_SIZE_TRANSACTIONS = 20`
- `PAGE_SIZE_DISCOVER = 12`

---

## 9. Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | React Native (bare CLI) | 0.74.5 |
| Language | TypeScript | ~5.3.3 |
| Navigation | React Navigation | v6 |
| State (global) | Zustand | ^4.5.4 |
| State (async) | React Query (@tanstack) | ^5.56.2 |
| Auth | Supabase JS | ^2.105.3 |
| Forms | react-hook-form + yup | ^7 + ^1 |
| UI components | react-native-paper | ^5.12.3 |
| Animations | react-native-reanimated | ~3.10.1 |
| Gradients | react-native-linear-gradient | ^2.8.3 |
| Icons | react-native-vector-icons | ^10.3.0 |
| Responsive scale | react-native-size-matters | ^0.4.2 |
| Persistence | AsyncStorage | 1.23.1 |
