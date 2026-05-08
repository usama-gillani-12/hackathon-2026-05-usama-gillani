# TrendPro — Technical Decisions

**Hackathon:** Let's AI Hackathon · May 7–9 2026

Each entry follows the ADR (Architecture Decision Record) format: **Status → Context → Decision → Consequences**.

---

## ADR-001: React Native CLI (bare) over Expo Managed

**Status:** Decided  
**Date:** 2026-05-06

**Context:** The project required `react-native-linear-gradient`, `react-native-vector-icons`, and `react-native-reanimated` — all of which need native module linking. Expo managed workflow restricts arbitrary native modules to those pre-bundled in the Expo SDK.

**Decision:** Use bare React Native CLI (`react-native init`) so we have full control over the iOS/Android native layer and can link any package.

**Consequences:**
- `pod install` is required after adding packages with native code
- No Expo Go quick-scan — must run on simulator/device
- Full freedom to add any native library without SDK constraints

---

## ADR-002: Zustand over Redux for Global State

**Status:** Decided  
**Date:** 2026-05-06

**Context:** The app has 6 distinct state domains (auth, credits, watchlist, settings, products, notifications). Redux would require actions, reducers, selectors, and a provider for each domain — significant boilerplate for a 3-day hackathon.

**Decision:** Zustand with one store file per domain. Each store is a typed hook (`useAuthStore`, `useCreditStore`, etc.) with minimal boilerplate and `persist` middleware where needed.

**Consequences:**
- Store subscription is fine-grained — components only re-render on the slice they consume
- `persist` + AsyncStorage gives free hydration with a `hydrated` flag to gate rendering
- No Redux DevTools (acceptable for MVP; Zustand has its own middleware if needed later)

---

## ADR-003: React Query Wraps Zustand (not direct network calls)

**Status:** Decided  
**Date:** 2026-05-07

**Context:** The app's data (scored products) comes from `productService.ts` which is a module-level cache, not a REST endpoint. React Query's built-in cache would be redundant and create a two-cache problem.

**Decision:** React Query hooks (`useProductsQuery`, `useWatchlistQuery`, etc.) call into Zustand store methods, not fetch URLs. React Query provides: loading/error states, stale-while-revalidate semantics, and `queryClient.invalidateQueries()` for cache busting. Zustand holds the actual data.

**Consequences:**
- Single source of truth stays in Zustand; React Query is purely a UI orchestration layer
- Avoids the "double-cache" problem where RQ cache and Zustand diverge
- `invalidateQueries(['products'])` triggers `store.load()` which re-runs the scoring pipeline

---

## ADR-004: Mock Payment Service with Strategy Interface

**Status:** Decided  
**Date:** 2026-05-07

**Context:** Real USDC payment settlement (on Base or Polygon) requires a backend wallet watcher, which is out of scope for a 3-day hackathon. However, the payment flow (credit purchase, tx hash, confirmation) should be production-realistic.

**Decision:** Define a `PaymentService` interface with `createUsdcPaymentIntent` and `verifyUsdcPayment`. Register `MockPaymentService` at app start. The app calls `getPaymentService()` everywhere — never the concrete class directly. Swap in `LivePaymentService` post-hackathon with no screen changes.

**Consequences:**
- All UI code is payment-implementation-agnostic
- `isDemoPaymentMode()` drives the `DemoModeBanner` — honest disclosure to users
- The mock simulates realistic 1.4s latency so the UX is accurate

---

## ADR-005: Client-Side Pagination via `usePaginatedList`

**Status:** Decided  
**Date:** 2026-05-07

**Context:** Product lists can contain 50–200 items after blending 4 sources. Rendering all at once in a FlatList causes frame drops, especially with score badge animations.

**Decision:** Custom hook `usePaginatedList<T>(source, pageSize)` slices a memoised source array incrementally. `onEndReached` triggers `loadMore()` which appends the next page slice. This is client-side — all data is already in memory.

**Consequences:**
- First paint is fast (only 12–15 items rendered)
- No network round-trip for "load more" (data already scored and cached)
- Resets to page 1 automatically when the source reference changes (filter/sort applied upstream)
- Not suitable for truly infinite server-side datasets — acceptable for current data volume

---

## ADR-006: `ms()` (moderateScale) for All Sizing

**Status:** Decided  
**Date:** 2026-05-06

**Context:** React Native's `StyleSheet` uses logical pixels, but the actual pixel density varies widely across devices (iPhone SE 4" to iPad 12.9"). Raw `px` values cause either tiny text on large screens or overflow on small ones.

**Decision:** All font sizes, spacing, border radius, icon sizes, and component dimensions go through `ms()` from `react-native-size-matters`. The scale factor uses the device width as baseline with a moderate (0.5) factor — less aggressive than `scale()`, more than no scaling.

**Consequences:**
- Consistent visual proportions across iPhone SE, iPhone 15 Pro Max, and tablets
- Raw pixel values are a linting concern — flagged by the `/theme-audit` skill
- Typography and spacing tokens in `src/theme/` already return `ms()` values, so direct usage is correct

---

## ADR-007: Multi-Source Product Blending with Mock Heroes First

**Status:** Decided  
**Date:** 2026-05-07

**Context:** For demo reliability, the app must always show high-quality scored products regardless of whether API keys are present. Real APIs (Amazon, YouTube) may be slow or absent during judging.

**Decision:** `productService.ts` prepends `mockProducts` (bundled hero products with known scores) before blending live API results. The de-duplication step removes duplicates by product ID. This guarantees the demo hero products always appear at the top of the feed even in offline/no-key scenarios.

**Consequences:**
- Demo is always visually rich regardless of API availability
- Real API data enriches the feed when keys are present (Discover tab especially)
- The `clearProductCache()` function allows forced refresh during testing

---

## ADR-008: Supabase for Auth (not custom JWT)

**Status:** Decided  
**Date:** 2026-05-06

**Context:** Auth is a requirement (gated screens, user-specific watchlist) but building a custom auth server is out of scope.

**Decision:** Use Supabase Auth (email + password) via `@supabase/supabase-js`. Session is persisted via AsyncStorage through the Supabase client's built-in storage adapter. `useAuthStore` wraps `supabase.auth.onAuthStateChange` and exposes typed `session`, `user`, `login`, `signup`, and `logout` methods.

**Consequences:**
- Auth is production-grade with no backend work (Supabase handles JWTs, refresh tokens, email confirmation)
- If Supabase keys are absent from `.env`, the app shows a dev warning and disables auth screens
- Supabase free tier (50,000 MAU) is sufficient for hackathon + early launch
