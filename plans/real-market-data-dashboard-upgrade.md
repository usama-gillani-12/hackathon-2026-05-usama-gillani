# Real Market Data & Dashboard Upgrade — Feature Plan

## Why This Feature

The dashboard was showing entirely fake/static data:
- `MARKET_PULSE` was a hardcoded constant with made-up scores and trends
- Product catalogue came from DummyJSON/FakeStore (fake store fixtures)
- Social buzz score was mocked

The goal is to replace every static section with live, zero-key APIs so the dashboard reflects **real market signals** — making TrendPro credible as a product-research tool.

---

## Phases

### Phase 1 — Live Reddit Market Pulse ✅ Done

Replaces the 6 hardcoded `MARKET_PULSE` cards with real Reddit community engagement scores.

**How it works:**
- Each product category maps to a subreddit (Electronics→r/gadgets, Beauty→r/SkincareAddiction, etc.)
- Fetches the "hot" posts (top 10) from each subreddit in parallel
- Upvote scores of the top 5 posts → sparkline bars (normalized to 0–100 within the category)
- Log-normalized average score → 0–100 momentum score
- Upvote ratio of top post → trend % indicator
- `hot` flag fires at score ≥ 72 or upvote_ratio > 0.92
- 8-second timeout; per-slot graceful fallback to static data on failure

**API:** Reddit public JSON (`reddit.com/r/{sub}/hot.json`) — zero key, zero registration.

**Files changed:**
| File | Type |
|------|------|
| `src/constants/index.ts` | Modified — added `REDDIT_BASE_URL` |
| `src/types/market.ts` | **New** — `MarketPulseItem` type |
| `src/api/redditMarketApi.ts` | **New** — `fetchMarketPulse()` + `MARKET_PULSE_FALLBACK` |
| `src/screens/DashboardScreen.tsx` | Modified — replaced static const with live state, `loadPulse()`, LIVE/LOADING badge |

---

### Phase 2 — "What's Trending" Feed via HackerNews Show HN ✅ Done


Adds a new horizontal card strip between Market Pulse and Top Opportunity showing real product launches from the developer/entrepreneur community.

**Why HN instead of Product Hunt:** Product Hunt v2 API requires OAuth token registration. HackerNews Algolia search API is completely free, no key, same concept (real products with real upvote counts).

**How it works:**
- Fetches "Show HN" stories from the Algolia HN search API filtered to `points > 10`
- Auto-detects category from title keywords (AI/Tech, E-Commerce, SaaS, Mobile, Product Launch)
- Shows: title (2 lines), upvote count, comment count, time-ago, category chip
- "NEW" badge for posts < 24 hours old; "HOT" badge for > 100 points
- Tapping a card opens the HN story URL via `Linking.openURL`
- 8-second timeout with graceful fallback to empty (section hidden)

**API:** `https://hn.algolia.com/api/v1/search` — zero key, zero registration.

**Files changed:**
| File | Type |
|------|------|
| `src/constants/index.ts` | Modified — added `HN_ALGOLIA_URL` |
| `src/types/market.ts` | Modified — added `TrendingPost` type |
| `src/api/hackerNewsApi.ts` | **New** — `fetchTrendingPosts()` |
| `src/screens/DashboardScreen.tsx` | Modified — new section, state, `loadTrending()`, card UI + styles |

---

### Phase 3 — Reddit Social Buzz Signal ✅ Done

Replaces YouTube-only social buzz with a blended YouTube + Reddit signal.

**How it works:**
- `fetchRedditBuzzByCategory(category)` maps 20+ product categories to relevant subreddits (pets→r/Pets, beauty→r/SkincareAddiction, etc.), fetches hot posts, returns log-normalized 0–100 score
- Module-level `redditBuzzCache` avoids re-fetching the same subreddit per scoring run
- `productService.ts` fetches YouTube + Reddit in parallel (`Promise.all`) for each product
- `buildScore()` blends them: `round(youtube × 0.6 + reddit × 0.4)` → stored in `scoreBreakdown.socialBuzz`
- Raw source scores stored in `ScoredProduct.socialBuzzSources?: { youtube, reddit }` (optional, backwards-compatible)
- `ScoreBreakdown` screen shows a new "Social Buzz Sources" card with two colored bars (YouTube red, Reddit orange) + blended total

**Files changed:**
| File | Type |
|------|------|
| `src/types/product.ts` | Modified — `socialBuzzSources?` added to `ScoredProduct` |
| `src/api/redditMarketApi.ts` | Modified — `fetchRedditBuzzByCategory()` + `redditBuzzCache` added |
| `src/services/scoringService.ts` | Modified — `ScoreInputs.redditBuzz?`, blend logic, updated buzz explainer |
| `src/services/productService.ts` | Modified — parallel YouTube+Reddit fetch, passes both to `buildScore` |
| `src/screens/ScoreBreakdownScreen.tsx` | Modified — new "Social Buzz Sources" card with sub-bars |

---

### Phase 4 — UI: Animated AI Scoring Bars on Scroll ✅ Done

Animates the 7-dimension bar fills from 0 → full width as the section scrolls into view. Runs entirely on the UI thread via Reanimated worklets.

**How it works:**
- `AnimatedDimBar` sub-component: each bar has its own `containerW` SharedValue (measured via `onLayout`). `useAnimatedStyle` worklet interpolates pixel width based on `scrollY` relative to `aiSectionY`. Stagger of 25px × index offsets each bar slightly, creating a cascade effect.
- Trigger: when scroll position reaches `aiSectionY - SCREEN_H × 0.7 + stagger`, the bar animates from 0 → target px over 260px of scroll travel.
- Outer `ScrollView` → `Animated.ScrollView` from Reanimated; `useAnimatedScrollHandler` feeds scroll offset into `scrollY` SharedValue on the UI thread.
- `aiSectionY` captured via `onLayout` on the AI section wrapper (SharedValue assignment from JS thread is safe).
- Zero JS-thread involvement during scroll — smooth 60fps on all devices.

**Files changed:**
| File | Type |
|------|------|
| `src/screens/DashboardScreen.tsx` | Modified — `useAnimatedScrollHandler`, `SharedValue` type, `SCREEN_H`, `AnimatedDimBar` component, outer scroll view upgraded, `dimBarFillAnimated` style |

---

### Phase 5 — Best Buy Real Product Catalogue ✅ Done

Replaces DummyJSON/FakeStore with real retail product data from Best Buy's Open API.

**Why Best Buy, not eBay:**
- eBay Finding API (App ID–only) was **decommissioned February 5, 2025** — it no longer works.
- eBay Browse API (the replacement) requires OAuth 2.0 with a **client secret** — cannot be safely embedded in a mobile app without a backend token server.
- Best Buy Open API uses a **simple API key only** (no secret, no OAuth), identical to YouTube/RapidAPI usage in this codebase. Safe for client-side use.
- Walmart and Etsy both require client secrets or OAuth. Best Buy is the only major US retailer with a purely key-based public API.

**What the API returns (per product):**
`sku`, `name`, `salePrice`, `regularPrice`, `customerReviewAverage`, `customerReviewCount`, `manufacturer`, `department`, `class`, `image`, `onlineAvailability`, `shortDescription`

**How it works:**
- Searches 6 category keywords in parallel: `("fitness tracker" OR "smart home" OR "kitchen gadget" OR "beauty device" OR "pet tech" OR "laptop")`
- Each search returns up to 10 products → 60 products max per load
- Products are blended with mock products (mocks win deduplication, as with all other sources)
- Source priority: Amazon → **Best Buy** (new) → DummyJSON → FakeStore → Mock

**Normalization to `Product` interface:**
| Best Buy field | Product field | Notes |
|----------------|---------------|-------|
| `sku` | `id` (`bb-{sku}`) | Prefixed to avoid collisions |
| `name` | `title` | Direct |
| `salePrice \|\| regularPrice` | `price` | Prefer sale price |
| `regularPrice - salePrice` | `discountPercent` | Computed if on sale |
| `customerReviewAverage ?? 4.0` | `rating` | Real rating; 4.0 default if none |
| `onlineAvailability ? 200 : 20` | `stock` | Proxy for availability |
| `manufacturer` | `brand` | Direct |
| `department` → slug | `category` | Normalized via lookup table |
| `image` | `thumbnail` + `images[0]` | Direct |

**New `ProductSource` value:** `'bestbuy'`

**Environment variable:** `EXPO_PUBLIC_BESTBUY_API_KEY` — free at developer.bestbuy.com, no approval needed.

**Files to change:**
| File | Change |
|------|--------|
| `src/types/product.ts` | Add `'bestbuy'` to `ProductSource` union |
| `src/constants/index.ts` | Add `BESTBUY_BASE_URL` |
| `src/api/bestBuyApi.ts` | **New** — `fetchBestBuyProducts()`, `isBestBuyKeyConfigured()` |
| `src/services/productService.ts` | Add Best Buy as source tier 2; extend `ProductSourceStatus` |

---

## Verification

```bash
npx tsc --noEmit   # zero TypeScript errors
yarn start         # Metro cold start — check for import errors
yarn ios           # launch on simulator
```

**Phase 5 test flow:**
1. Add a valid `EXPO_PUBLIC_BESTBUY_API_KEY` to `.env`
2. Cold-start app → `sourceStatus.bestbuy` shows `'ok'` in the Dashboard hero
3. Products on the Discover/Trending screens have real Best Buy names and prices (not DummyJSON)
4. Remove the key → app falls back to DummyJSON silently, no crash
5. Confirm `yarn ts:check` passes (new `'bestbuy'` source in switch/union)

**Phase 1 test flow:**
1. Open Dashboard → Market Pulse section shows "LOADING" briefly then "LIVE"
2. Category scores are real numbers (not the fixed 84/91/76/88/79/72 from static data)
3. Kill network → section shows fallback static values (no crash)

**Phase 2 test flow:**
1. Dashboard loads → "What's Trending" strip appears below Market Pulse
2. Cards show real HN story titles with real upvote counts
3. Tap a card → browser/in-app browser opens the HN link
4. Posts < 24h show "NEW" badge, posts > 100 points show "HOT" badge
5. Kill network → section hidden gracefully (empty array, section not rendered)
