# TrendPro — Product Requirements Document

**Version:** 1.0  
**Date:** May 9 2026  
**Status:** Post-MVP / Living Document  
**Owner:** Solo (Hackathon build → post-launch iteration)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Goals & Success Metrics](#3-goals--success-metrics)
4. [Target Users](#4-target-users)
5. [Product Overview](#5-product-overview)
6. [Feature Requirements](#6-feature-requirements)
   - 6.1 Onboarding
   - 6.2 Authentication
   - 6.3 Dashboard
   - 6.4 Trending
   - 6.5 Discover
   - 6.6 Product Detail
   - 6.7 Score Breakdown
   - 6.8 Compare Products
   - 6.9 Product Test Plan
   - 6.10 Watchlist
   - 6.11 Credits & Payments
   - 6.12 Analytics
   - 6.13 Settings & Profile
   - 6.14 Notifications
7. [User Stories](#7-user-stories)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [Scoring Engine Specification](#9-scoring-engine-specification)
10. [Monetisation Model](#10-monetisation-model)
11. [UX & Design Principles](#11-ux--design-principles)
12. [Technical Constraints](#12-technical-constraints)
13. [Competitive Landscape](#13-competitive-landscape)
14. [Roadmap](#14-roadmap)
15. [Risks & Mitigations](#15-risks--mitigations)
16. [Open Questions](#16-open-questions)

---

## 1. Executive Summary

TrendPro is a mobile-native AI product intelligence app for e-commerce entrepreneurs and dropshippers. It aggregates product data from Amazon and curated marketplaces, scores each product across 7 weighted dimensions using a proprietary algorithm, and surfaces premium insights (supplier angles, ad copy, full test plans) behind a credit-based paywall.

The core insight driving the product is that **no mobile-first product research tool exists** — all incumbents (Minea, AdSpy, Dropship.io) are desktop-centric subscription tools. TrendPro is built for the generation that runs their Shopify store from a phone.

**MVP shipped:** May 9 2026 at the Let's AI Hackathon (48-hour solo build).  
**Next milestone:** v1.1 — Live USDC payment integration (2–3 weeks post-hackathon).

---

## 2. Problem Statement

### The Market Gap

The global dropshipping market is projected to reach **$1.25 trillion by 2030**. Every solo dropshipper must answer the same question before placing an order or running an ad: *Is this product worth testing?*

Today's answer to that question is broken:

| Current Approach | Problem |
|-----------------|---------|
| Desktop tools (Minea, AdSpy) | Expensive ($50–$200/mo), require a laptop, not built for quick decisions |
| Manual TikTok/Amazon browsing | Takes 3–8 hours per validation cycle; no scoring or ranking |
| Gut instinct | Leads to wasted ad spend; users have been burned by high-competition niches |
| Free tools (Google Trends) | No product-level granularity, no profit or risk scoring |

**No solution is mobile-native, affordable, or fast enough** for the average solo operator who researches products on a phone during a lunch break.

### The Insight

A dropshipper doesn't need 40 data points. They need one score, one recommendation, and one test plan. TrendPro compresses 7 data dimensions into a single `rating10` score and a go/no-go recommendation in under 30 seconds.

---

## 3. Goals & Success Metrics

### Product Goals

1. Deliver a go/no-go verdict on any product in under 30 seconds from app open
2. Make the credit paywall feel like a fair exchange, not a barrier
3. Build retention through watchlist alerts and daily discovery habit
4. Position TrendPro as the product research layer before the ad account

### KPIs

| Metric | MVP Target (Demo) | v1.x Target | v2.0 Target |
|--------|------------------|-------------|-------------|
| Onboard → score → unlock E2E | ✅ Working | < 45 sec avg | < 30 sec avg |
| App crash rate | 0 during demo | < 0.1% sessions | < 0.05% sessions |
| TypeScript errors (`yarn ts:check`) | 0 | 0 | 0 |
| Products scored per session | N/A | > 10 | > 20 |
| Credit purchase conversion | N/A (mock) | > 15% of active users | > 25% |
| Watchlist save rate | N/A | > 40% of detail views | > 50% |
| D7 retention | N/A | > 35% | > 45% |
| Session length | N/A | > 4 min | > 6 min |
| Monthly active users | Demo | 500 | 5,000 |

---

## 4. Target Users

### Primary Persona — "The Weekend Warrior"

> *Maya, 27 — Miami. Manages a Shopify store part-time while working a 9–5. Researches products on her phone during her commute and weekends. Has a $500/month ad budget and can't afford to waste it on untested products.*

**Goals:**
- Find 2–3 winning products per month worth testing
- Get a go/no-go signal in under 30 seconds
- Know the ad angle and target audience before she opens Meta Ads Manager
- Understand the risk before ordering inventory

**Frustrations:**
- Minea is expensive and requires a desktop browser
- "TikTok viral" doesn't mean profitable — she's been burned twice
- High-competition niches looked hot but had no margin left
- Existing tools don't generate test plans — she has to figure out the test herself

**Behaviour patterns:**
- Phone-first; does research during commutes and lunch breaks
- Saves products to review later; doesn't always decide on the first view
- Willing to pay a small per-use fee; resistant to $49/month subscriptions on an unproven tool

---

### Secondary Persona — "The Agency Sourcer"

> *Jake, 34 — Toronto. Runs a product sourcing consultancy for 8 Shopify stores. Needs to validate 15–20 products per week, share recommendations with clients, and justify scoring decisions.*

**Goals:**
- High throughput product validation (15+ per week)
- Ability to share score breakdowns with clients
- Audit trail of which products were recommended and why
- Bulk unlock capability

**Differentiating needs vs primary:** team sharing, bulk credits, export to Notion/Sheets, agency billing

**PRD scope:** Secondary persona is served in v2.0 (B2B team plans). MVP and v1.x optimise for Maya.

---

### Out of Scope (for now)

- Wholesale buyers (different margin model)
- Amazon FBA sellers (different research signal — BSR, review velocity)
- Established brands (they have their own data pipelines)

---

## 5. Product Overview

### App Identity

TrendPro is a **bare React Native CLI app** (iOS and Android) that delivers product intelligence as a consumer mobile app. It is not a web app, not an Expo managed app, and not a desktop tool.

### Core Value Loop

```
Discover product → View score → Unlock premium detail → Launch test → Return to validate
```

Every feature either feeds into this loop or retains users between cycles.

### Five Tabs

| Tab | Icon | One-line Purpose |
|-----|------|-----------------|
| Dashboard | Home | Curated feed of scored products, sorted by winning score |
| Trending | Trending | Top 20 most-viewed products this session |
| Discover | Search | Search Amazon best-sellers by keyword or category |
| Watchlist | Bookmark | Saved products for later review |
| Credits | Lightning | Buy credits, view transaction history |

### Drawer Items (supplementary)

Analytics · Profile · Settings · Notifications

---

## 6. Feature Requirements

### 6.1 Onboarding

**Purpose:** First impression. Must communicate value before the auth wall.

**Requirements:**
- Single full-screen carousel (or single hero screen) — no multi-step tutorial
- Brand intro: app name, tagline ("Find your next winning product"), core pitch
- Starter credit grant shown before auth prompt (e.g. "You have 10 free credits waiting")
- `onboardingComplete` flag stored in `useSettingsStore` (persisted via AsyncStorage)
- Once completed, never shown again (even on reinstall if session persists)

**Acceptance criteria:**
- New user sees onboarding on first launch
- Returning user skips directly to Dashboard (or Auth gate if session expired)
- Starter credits appear in credit balance immediately after auth

---

### 6.2 Authentication

**Provider:** Supabase email/password  
**Future:** Google OAuth (v1.1), Apple Sign In (v2.0)

**Requirements:**
- **Login screen:** email + password fields, "Forgot password" link, "Don't have an account? Sign up" navigation
- **Signup screen:** email + password + confirm password, terms acceptance checkbox
- Validation: `react-hook-form` + `yup`, `mode: 'onTouched'` (validates on first blur, live on change)
- Field-level errors shown as small red text **below** the input
- Input border states: default → blue on focus → red on error → green on confirm-password match
- Supabase API errors mapped via `mapAuthError()` to human-readable messages
- Server error banner shown above CTA button; clears on any field keystroke
- Auth state held in `useAuthStore` (Supabase session object); persisted to AsyncStorage

**Acceptance criteria:**
- Invalid email shows "Enter a valid email address" below the field on blur
- Wrong password shows Supabase error in red banner (not "Unknown error")
- Successful login navigates to Dashboard immediately
- Session persists across app restarts; user is not re-prompted

---

### 6.3 Dashboard

**Purpose:** The home feed — daily discovery of scored products.

**Requirements:**
- FlatList of `ScoredProduct[]` sorted by `winningScore` descending
- Each `ProductCard` shows: product image, name (truncated to 2 lines), score badge (`rating10`), recommendation tag, price
- Recommendation tags: `🔥 HOT PICK`, `⚠️ HIGH RISK`, `💎 HIDDEN GEM`, `📈 TRENDING UP` (determined by scoring outputs)
- Sticky header with app logo and notification bell (navigates to Notifications)
- Pull-to-refresh calls `loadScoredProducts({ refresh: true })` to bust `cachedResult`
- Skeleton cards shown during initial load (Zustand `status === 'loading'`)
- Error state with retry CTA if all sources fail
- Pagination via `usePaginatedList(filtered, PAGE_SIZE_PRODUCTS)` — never render full raw array
- Search/filter bar: filter by category, sort by score/price/rating
- `ListFooterLoader` shows load-more progress and "All N products shown" when exhausted

**Out of scope for MVP:** personalised feed based on saved categories

**Acceptance criteria:**
- Dashboard loads within 3 seconds on first open (Amazon API + mock blend)
- Mock hero products always appear at top regardless of API status
- Scrolling past page 1 appends next 15 products without jank
- Pull-to-refresh produces updated scores

---

### 6.4 Trending

**Purpose:** Highlight the hottest products this session by view/score momentum.

**Requirements:**
- Top 20 products sorted by a derived "trending score" (combination of `winningScore` + recent view count tracked in session memory)
- Visual distinction from Dashboard: numbered rank badges (#1, #2 …), larger product images
- Same `ProductCard` tap interaction as Dashboard → navigates to ProductDetail
- Refresh triggers same `loadScoredProducts` call; trending list recalculates on new data
- Section header shows "Updated [N] minutes ago"

**Acceptance criteria:**
- Trending tab shows exactly 20 products when available
- Rank badges are visually distinct (bold number in coloured circle)
- Products the user has viewed this session appear higher in ranking (session-only signal)

---

### 6.5 Discover

**Purpose:** Intent-based search — user searches for a product keyword or category to validate.

**Requirements:**
- Search bar (auto-focused on tab open) accepting free-text keyword
- Category chips for quick filtering: Electronics, Fashion, Home & Garden, Beauty, Toys, Sports, etc.
- Results from Amazon RapidAPI if key present; falls back to DummyJSON + FakeStore keyword match
- All results pass through `scoringService.buildScore()` before display
- Results paginated with `usePaginatedList(results, PAGE_SIZE_DISCOVER)`
- "No results" empty state with suggestions to try broader terms
- Recently searched keywords stored in AsyncStorage (last 5); shown below search bar

**Acceptance criteria:**
- Typing "wireless earbuds" and tapping Search returns scored results within 2.5 seconds
- If Amazon API key absent, results still appear from free sources (degraded but functional)
- Category chip selection filters displayed results without re-fetching
- Recent searches persist across app restarts

---

### 6.6 Product Detail

**Purpose:** The paywall moment — full product intelligence on one screen.

**Free section (all users):**
- Product image(s), name, price, source marketplace
- Overall score badge and `rating10`
- Short AI summary (2–3 sentences: what it is, why trending, one risk)
- Recommendation tag and reasoning snippet
- "Add to Watchlist" button
- Score bars for all 7 dimensions (bars visible but values blurred for premium products)

**Premium section (unlocked via credits):**
- Exact score values for all 7 dimensions
- Full AI analysis: Why Trending (3–5 bullet points), Risk Factors (2–3), Opportunity Window estimate
- Ad angle: primary audience, pain point addressed, suggested platforms (TikTok / Meta / Google)
- Suggested selling price range with estimated margin %
- Link to "View Full Test Plan" (navigates to ProductTestPlan screen)
- "Compare" button (navigates to CompareProducts with this product pre-loaded)

**Lock/Unlock flow:**
- Products with `rating10 >= 9` are premium (`isPremium = true`)
- Unlock button shows credit cost (3 credits for 9/10, 5 credits for 10/10)
- Insufficient credits → prompt with "Buy Credits" CTA
- After unlock: `unlockService.unlockProduct(id)` persists to `useUnlockStore`; premium section animates in with slide+fade
- Unlocked products remain unlocked permanently (persisted in AsyncStorage)

**Acceptance criteria:**
- Free section renders without any API call beyond the product data
- Score bars render for all 7 dimensions on all products (values blurred on locked)
- Unlock deducts correct credit amount and persists unlock state
- Re-opening a previously unlocked product shows premium section immediately (no re-lock)

---

### 6.7 Score Breakdown

**Purpose:** Deep-dive visualisation of the 7-dimension score for users who want to understand "why this score."

**Requirements:**
- Full-screen modal or stack screen (navigated from ProductDetail "See Breakdown" link)
- Animated bar chart for each of the 7 dimensions
- Plain-language explanation for each dimension score ("Your demand score of 78 is driven by low stock levels and a 4.2-star rating…")
- Score formula displayed: `Score = demand×0.25 + buzz×0.20 + profit×0.20 …`
- Share button: generates a screenshot-ready score card PNG (v1.4 feature; placeholder button in MVP)

**Acceptance criteria:**
- All 7 dimensions shown with value and weight label
- Explanation text is product-specific (not generic)
- Screen accessible from ProductDetail without credits

---

### 6.8 Compare Products

**Purpose:** Side-by-side comparison of 2–3 products before deciding which to test.

**Requirements:**
- Entry: "Compare" button on ProductDetail, pre-loading the current product
- User selects 1–2 more products from their Watchlist or a search
- Side-by-side card layout: product image, score, price, 3 key dimension values
- Radar chart overlay showing all 3 products on the same 7-dimension axes
- "Best Choice" badge on the highest-scoring product
- CTA: "Add to Watchlist" or "Unlock" for each product from the comparison view

**Acceptance criteria:**
- Comparison works with 2 or 3 products
- Radar chart renders correctly for all configurations
- Best Choice badge correctly identifies the highest `winningScore`

---

### 6.9 Product Test Plan

**Purpose:** The 10× differentiator — a complete ad test plan generated from the product's score.

**Requirements (all generated by `scoringService.buildTestPlan(scoredProduct)`):**
- **Ad campaign setup:** recommended platform, campaign objective, daily budget range, test duration
- **Audience targeting:** primary demographic, secondary demographic, interest keywords, lookalike source
- **Creative brief:** ad format (video/image), hook (3 variants: curiosity / pain / social proof), CTA
- **Budget split:** % to video ads, % to image ads, % to retargeting
- **Success metrics:** target CPC range, ROAS threshold for scaling, kill criteria (pause if CPC > $X after $Y spend)
- **Timeline:** Day 1–3 learning phase, Day 4–7 decision point, Week 2 scale/kill

**Gate:** Test Plan screen requires product to be unlocked (premium). Non-premium redirect to unlock flow.

**Acceptance criteria:**
- All 6 sections populated for any unlocked product
- Budget recommendations scale with estimated product price (a $5 item ≠ a $50 item's budget)
- "Kill criteria" section always present (never omitted)
- Screen is shareable (share icon in header; v1.4 — placeholder for MVP)

---

### 6.10 Watchlist

**Purpose:** Save products for later — the retention anchor between sessions.

**Requirements:**
- Tap "Add to Watchlist" (bookmark icon) on any ProductCard or ProductDetail
- Watchlist screen: FlatList of saved products, sorted by date saved (newest first)
- Each row shows: image, name, score badge, date saved, lock/unlocked status
- Swipe-to-delete or long-press context menu to remove
- Paginated with `usePaginatedList(items, PAGE_SIZE_WATCHLIST)`
- Watchlist state in `useWatchlistStore` (persisted to AsyncStorage)
- Score badge reflects current `winningScore` (recalculated on each app open, not frozen at save time)
- Empty state: "No saved products yet. Tap the bookmark on any product to save it."

**Acceptance criteria:**
- Bookmarked product appears in Watchlist immediately after save
- Removing a product updates the list without requiring reload
- Score on saved product refreshes on next app open (not stale)
- Watchlist persists across sessions and app restarts

---

### 6.11 Credits & Payments

**Purpose:** The monetisation core — buying and spending credits.

#### Buy Credits Screen (Credits Tab)

**Requirements:**
- 4 credit pack options in a card grid:
  - Starter: 10 credits · $2.99
  - Growth: 50 credits · $9.99
  - Pro: 150 credits · $24.99
  - Elite: 500 credits · $69.99
- "Most Popular" badge on Growth pack
- Current balance shown prominently at top
- Each pack: tap → payment confirmation modal → `paymentService.createUsdcPaymentIntent()` → loading state (1.4s mock) → success/failure
- On success: navigate to PaymentSuccess modal, credit balance updated via `useCreditStore`
- On failure: error banner with retry option

**Payment architecture:**
- Interface: `PaymentService` (swappable via `setPaymentService()`)
- MVP implementation: `MockPaymentService` (simulates latency, generates 64-char hex tx hash, marks tx `confirmed` on `mock` network)
- v1.1 implementation: `LivePaymentService` calling backend `/payments/verify` endpoint

#### Transaction History Screen

- FlatList of all credit transactions (purchases + unlocks)
- Each row: transaction type icon, description, credit delta (green for purchase, red for spend), timestamp, tx hash (truncated)
- Paginated with `usePaginatedList(transactions, PAGE_SIZE_TRANSACTIONS)`
- Filter tabs: All | Purchases | Spends

#### PaymentSuccess Screen (Modal)

- Full-screen celebration modal (gradient background, animated checkmark)
- Shows: credits purchased, new balance, transaction hash
- "Start Discovering" CTA → dismisses modal, navigates to Dashboard

**Acceptance criteria:**
- Credit balance updates immediately on successful purchase
- Transaction history entry created for every purchase and every unlock
- PaymentSuccess modal animates in (not instant swap)
- Mock payment always completes within 2 seconds
- Insufficient credits: unlock button greys out and shows "Need X more credits"

---

### 6.12 Analytics

**Purpose:** Personal performance dashboard — did the products I researched actually perform?

**MVP scope:** Primarily a metrics summary page. Full analytics in v1.x.

**Requirements (MVP):**
- Summary stats: total products viewed, total credits spent, total products unlocked, watchlist count
- Top 5 highest-scored products in session
- Credit spend breakdown (bar chart: credits spent per week)
- Placeholder for "launch tracking" (v2.0 — connect ad account to see which products you actually tested)

**v1.x additions:**
- Product score change tracking: "Products you watched that moved up/down"
- Category heatmap: which categories you research most

**Acceptance criteria:**
- Analytics screen loads without API calls (all data from local stores)
- Stats are accurate to within-session actions (credits, unlocks, views)

---

### 6.13 Settings & Profile

#### Profile Screen

- Display name, email (from Supabase session)
- Avatar placeholder (initials or default icon)
- Edit display name (inline edit, saved to Supabase profile table — v1.x)
- "Sign Out" button with confirmation dialog

#### Settings Screen

- **Theme:** Dark (default) / Light toggle — persisted in `useSettingsStore`
- **Notifications:** Toggle for score alerts, daily digest (UI only in MVP — wired in v1.3)
- **Data preferences:** Clear product cache, Reset watchlist (with confirmation)
- **About:** Version number, Terms of Service link, Privacy Policy link
- **Developer (if `__DEV__`):** Reset onboarding, clear all data, toggle mock mode

**Acceptance criteria:**
- Theme change takes effect immediately without restart
- Sign out clears `useAuthStore.session` and returns user to auth gate
- Destructive actions (reset watchlist, clear cache) show confirmation dialogs

---

### 6.14 Notifications

**Purpose:** Inbox for system and score alerts.

**MVP scope:** Local-only notification store (no push delivery in MVP).

**Requirements:**
- List of notification objects from `useNotificationStore` (persisted to AsyncStorage)
- Each notification: icon, title, body, timestamp, read/unread state
- Mark as read on open; "Mark all read" button
- Notification bell in Dashboard header shows unread badge count
- Types: score alert, credit confirmation, welcome message, app announcement

**v1.3 additions:** Firebase Cloud Messaging delivery for watchlist score changes and trending surges

**Acceptance criteria:**
- Unread badge appears on notification bell when unread items exist
- Tapping a product-related notification navigates to that ProductDetail screen
- All notifications persist across restarts

---

## 7. User Stories

### Discovery

- As a user, I want to open the app and see the top-scoring products immediately so I can start research without setup.
- As a user, I want to search by keyword so I can validate a specific product I already have in mind.
- As a user, I want to filter products by category so I can focus on my niche.
- As a user, I want to see a trending list so I can catch momentum products before they peak.

### Scoring & Intelligence

- As a user, I want to see a single overall score (1–10) so I can make a fast go/no-go decision.
- As a user, I want to understand *why* a product scored the way it did so I can trust the signal.
- As a user, I want to see the ad angle and audience so I can plan my campaign before ordering samples.
- As a user, I want a complete test plan so I don't have to figure out budget and kill criteria on my own.

### Saving & Tracking

- As a user, I want to save products to my watchlist so I can come back to them later.
- As a user, I want to compare two products side by side so I can decide which one to test first.
- As a user, I want to see score changes on products I've saved so I know if momentum is shifting.

### Credits & Payments

- As a user, I want to know exactly how many credits a premium unlock costs before I commit.
- As a user, I want to buy credits quickly from within the app so I don't have to leave to pay.
- As a user, I want my unlocked products to stay unlocked so I don't pay twice.
- As a user, I want a receipt and transaction history so I can track my spend.

### Account

- As a user, I want my data to persist across sessions so I don't lose my watchlist when I close the app.
- As a user, I want to sign up with email so I don't have to link a social account.
- As a user, I want to sign out and have my data remain attached to my account.

---

## 8. Non-Functional Requirements

### Performance

| Requirement | Target |
|-------------|--------|
| Initial product feed load | < 3 seconds (cached after first load) |
| Screen-to-screen navigation | < 200ms perceived |
| Score calculation (`buildScore`) | < 50ms per product (pure function, no I/O) |
| FlatList scroll frame rate | 60fps (Reanimated on UI thread) |
| Mock payment flow | 1.4s simulated latency (realistic UX) |

### Reliability

- All product sources fail gracefully: if Amazon API is absent/erroring, DummyJSON + FakeStore + mock heroes still populate the feed.
- No screen should show a blank white page — every route has a loading skeleton and error state.
- `cachedResult` in `productService.ts` survives minor component re-mounts (module-level singleton).

### Security

- Auth tokens held in Supabase session object — not in plain AsyncStorage as a raw string.
- Payment verification must be server-side in production. Mobile client must never hold payment keys.
- Environment variables (`EXPO_PUBLIC_*`) accessed only in bundle-time files (`src/core/api/`, `src/core/lib/`); never in dynamic runtime expressions.

### Maintainability

- TypeScript strict mode; `yarn ts:check` must pass with zero errors.
- No `@ts-ignore` or `as any` without an explicit comment.
- No `console.log` / `console.warn` in production paths — wrapped in `if (__DEV__)`.
- All cross-folder imports via `@alias/` system; no `../../` relative paths beyond same-folder.

### Accessibility

- All interactive elements have `accessibilityLabel` props.
- Touch targets minimum 44×44pt.
- Colour contrast ratio ≥ 4.5:1 for text on card backgrounds.
- Score badges use both colour and text label (not colour-only signalling).

### Platform

- iOS 15+ and Android 10+ (API 29+).
- Tested on iPhone 14 Pro (primary) and Android mid-range simulator.
- Dark mode is the default and primary design target; light mode is a toggle.

---

## 9. Scoring Engine Specification

**File:** `src/core/services/scoringService.ts`  
**Entry point:** `buildScore(product: Product, inputs: ScoreInputs): ScoredProduct`  
**Contract:** Pure function — no network calls, no store writes, no side effects.

### Formula

```
winningScore = demand × 0.25
             + socialBuzz × 0.20
             + profitPotential × 0.20
             + productRating × 0.15
             + shippingEase × 0.10
             + (100 − competition) × 0.05
             + (100 − risk) × 0.05
```

All raw dimension values are on a 0–100 scale before weighting.

### Dimension Sources

| Dimension | Source | Notes |
|-----------|--------|-------|
| `demand` | Derived: `product.stock`, `product.rating`, `product.discountPercent` | High stock + high discount → suppressed demand signal |
| `socialBuzz` | YouTube Data API v3 (`youtubeApi.ts`) | Degrades to deterministic mock if `EXPO_PUBLIC_YOUTUBE_API_KEY` absent |
| `profitPotential` | `calculateMargin(price, category)` → `marginPercent × 1.4` | Category-based cost model; v1.2 will replace with live Alibaba quotes |
| `productRating` | `(rating / 5) × 100` | Simple linear transform |
| `shippingEase` | Lookup table keyed by category string | Electronics = harder; apparel = easier |
| `competition` | Lookup table keyed by category string | Inverted in formula — high competition reduces score |
| `risk` | Lookup table keyed by category string | Inverted in formula — high risk reduces score |

### Output Path

```
winningScore (0–100 float)
  → scoreToRating10()    → rating10 (1–10 integer)
  → rating10 >= 9        → isPremium (boolean)
  → isPremium            → unlockCost (3 credits for 9, 5 credits for 10)
```

### Recommendation Tags

| Condition | Tag |
|-----------|-----|
| `rating10 >= 9 && socialBuzz >= 70` | 🔥 HOT PICK |
| `risk >= 70` | ⚠️ HIGH RISK |
| `rating10 >= 8 && competition <= 30` | 💎 HIDDEN GEM |
| `demand >= 75 && trending month-on-month` | 📈 TRENDING UP |
| Default | (no tag) |

### Score Weight Changes

Any change to weights in `SCORE_WEIGHTS` (defined in `src/constants/index.ts`) requires:
1. A written rationale in the commit message
2. Running the `score-tune` skill (`/score-tune`) for impact assessment
3. Approval (self-review for solo; peer review for team)

---

## 10. Monetisation Model

### Credit System

1 credit = 1 unit of premium access. Credits are bought in packs and spent on unlocks.

**Unlock costs:**
- `rating10 = 9` → 3 credits
- `rating10 = 10` → 5 credits
- `rating10 <= 8` → Free (full detail visible)

**Why:** Products with `rating10 <= 8` are marginal — gating them would frustrate users. The paywall is placed at the point where the data is genuinely actionable.

### Credit Packs

| Pack | Credits | Price | Price per Credit | Best For |
|------|---------|-------|-----------------|---------|
| Starter | 10 | $2.99 | $0.30 | First-time buyer, low commitment |
| Growth | 50 | $9.99 | $0.20 | Active researcher (most popular) |
| Pro | 150 | $24.99 | $0.17 | Power user / weekly research habit |
| Elite | 500 | $69.99 | $0.14 | Agency / high-volume sourcing |

### Future Monetisation (Roadmap)

- **Monthly subscription ($19/month):** unlimited unlocks; targets users who exceed 6+ unlocks/month
- **B2B team plan:** shared credit pool, team members, admin dashboard; targets sourcing agencies
- **Export credits:** pay to export a test plan to Notion or Google Sheets (v2.0)

### Free Tier

- Onboarding: starter credits granted (e.g. 10 credits free on signup)
- All scores visible (no score hiding)
- Score bars visible (values blurred for premium products)
- Short AI summary visible on all products
- Watchlist: unlimited saves
- Trending and Discover: full access

The free tier is generous enough to demonstrate value without leaking the premium paywall reason.

---

## 11. UX & Design Principles

### Visual Hierarchy

1. **Dark hero sections** (`gradients.heroDark`) for primary content areas, headers, and score badges
2. **Light content cards** (`colors.card` on `colors.background`) for product cards and detail sections
3. **Accent colour** (`colors.accent`) used sparingly for CTAs, active states, score highlights

### Design Token Rules

- All sizes via `ms()`, `s()`, `vs()` from `react-native-size-matters` — never raw pixel values
- All colours from `@theme/colors` semantic tokens — never hardcoded hex
- Spacing from `@theme/spacing` — `spacing.sm`, `spacing.md`, `spacing.lg`, `spacing.xl`
- Typography from `@theme/typography` — `typography.h1`, `typography.body`, etc.

### Interaction Patterns

- **Tap feedback:** All product cards use `TouchableOpacity` with `activeOpacity={0.85}`
- **Animations:** Reanimated `withSpring` for score bars, `withTiming` for modal transitions
- **Loading states:** Skeleton screens (not spinners) for list loads; inline `ActivityIndicator` for mutations
- **Error states:** Every screen has a graceful error fallback with a retry CTA
- **Empty states:** Illustrated empty states with contextual guidance (not blank white)

### Navigation Principles

- Bottom tab bar is always visible when browsing the main app
- Modals (PaymentSuccess, confirmation dialogs) use `presentation: 'modal'` with slide-up animation
- Deep screens (ProductDetail, TestPlan) use the stack's default slide-right transition
- "Back" is always available — no screen should trap the user

---

## 12. Technical Constraints

### Stack (Current)

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | React Native (bare CLI) | 0.74.5 |
| Language | TypeScript | ~5.3.3 |
| Navigation | React Navigation | v6 |
| State (global) | Zustand | ^4.5.4 |
| State (async/cache) | React Query (@tanstack) | ^5.56.2 |
| Auth | Supabase JS | ^2.105.3 |
| Forms | react-hook-form + yup | — |
| UI base | react-native-paper | ^5.12.3 |
| Animations | react-native-reanimated | ~3.10.1 |
| Gradients | react-native-linear-gradient | ^2.8.3 |
| Icons | react-native-vector-icons | ^10.3.0 |
| Responsive | react-native-size-matters | ^0.4.2 |
| Persistence | AsyncStorage | 1.23.1 |

### Architecture Rules

- No logic in Screen files — all state, effects, and service calls live in the `.hooks.ts` sibling file
- No `StyleSheet.create` in Screen or Component files — styles live in `.styles.ts` sibling file
- No FlatList over 20 items without `usePaginatedList`
- No Reanimated worklets on JS thread — UI thread only
- No writing to Zustand stores from React Query `queryFn` — queries are read-only
- All cross-folder imports via `@alias/` — same-folder relative imports (`./`) only

### Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `EXPO_PUBLIC_SUPABASE_URL` | ✅ | Auth |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Auth |
| `EXPO_PUBLIC_RAPIDAPI_KEY` | Optional | Amazon live data; degrades to free fallback |
| `EXPO_PUBLIC_YOUTUBE_API_KEY` | Optional | Social buzz scoring; degrades to mock |

The app must function (with degraded data) without the optional keys.

---

## 13. Competitive Landscape

| Feature | TrendPro | Minea | AdSpy | Dropship.io | Ecomhunt |
|---------|----------|-------|-------|------------|---------|
| Mobile-native | ✅ | ❌ | ❌ | ❌ | ❌ |
| AI scoring (multi-dimension) | ✅ | Partial | ❌ | Partial | Partial |
| Free tier with credits | ✅ | ❌ | ❌ | ❌ | Limited |
| Complete ad test plan | ✅ | ❌ | ❌ | ❌ | ❌ |
| Amazon + social data blend | ✅ | ✅ | ✅ | ✅ | ✅ |
| Price point | Credits-based (~$0.17–0.30/unlock) | $49/mo | $149/mo | $29/mo | $29/mo |
| Desktop app | ❌ (mobile-first) | ✅ | ✅ | ✅ | ✅ |
| No subscription required | ✅ | ❌ | ❌ | ❌ | Partial |

### Core Differentiators

1. **Only mobile-native tool** — zero competitors have a production iOS/Android app
2. **Only tool with a complete test plan** — audience, copy, budget, timeline, kill criteria in one tap
3. **Per-unlock pricing** — no subscription lock-in; low barrier to first purchase
4. **Score transparency** — 7-dimension breakdown with plain-language explanations builds trust

### Risks from Competition

- Minea could ship a React Native app in 3–6 months if they see traction
- Dropship.io could add mobile-first features given their existing product database
- **Mitigation:** Speed of iteration + scoring model quality + the test plan moat (hardest to replicate)

---

## 14. Roadmap

### Current: MVP (shipped May 9 2026)

- ✅ All 5 tabs functional
- ✅ Scoring engine (7 dimensions, weighted formula)
- ✅ Product detail with premium lock/unlock
- ✅ Mock payment flow (USDC simulation)
- ✅ Watchlist persistence
- ✅ Credit store with transaction history
- ✅ Product test plan generator
- ✅ Compare products screen
- ✅ Score breakdown visualisation
- ✅ Supabase auth (login + signup)
- ✅ Onboarding screen
- ✅ Settings (theme toggle, data reset)

---

### v1.1 — Real Payment Integration (2–3 weeks post-hackathon)

| Task | Detail |
|------|--------|
| Integrate RevenueCat or Stripe | Replace `MockPaymentService` with `LivePaymentService` |
| Backend payment verifier | Supabase Edge Function — watches USDC wallet, confirms tx on-chain |
| Server-side credit grant | Credit granted only after backend confirmation — no client trust |
| Restore purchases | Flow for reinstalling users |
| Google OAuth | Social login option for faster onboarding |

---

### v1.2 — Live Supplier Quotes (4–6 weeks)

| Task | Detail |
|------|--------|
| Alibaba / CJ Dropshipping API | Real sourcing costs replacing `calculateMargin` category model |
| Real margin calculation | Actual supplier quote per product SKU |
| Shipping rate API | ePacket / Yunexpress rate by weight + destination |
| Score recalibration | `profitPotential` dimension accuracy ↑ → better recommendations |

---

### v1.3 — Push Notifications & Retention (6–8 weeks)

| Task | Detail |
|------|--------|
| Firebase Cloud Messaging | iOS (APNs) + Android setup |
| Watchlist score alerts | "Pet water bottle just hit 9/10 — up from 7 last week" |
| Trending surge notification | Alert when a new product crosses score threshold in user's categories |
| Daily digest (opt-in) | "3 new 8+ products in your niches today" |

---

### v1.4 — Social Sharing & Viral Loop (8–10 weeks)

| Task | Detail |
|------|--------|
| Share score card | Branded PNG score card for TikTok/Instagram Stories |
| Referral credits | "Give 5 credits, get 5 when they buy" |
| TikTok deep link | Tap to search TikTok for the product from ProductDetail |
| Public leaderboard | Top 10 most-watched products this week (anonymised) |

---

### v2.0 — AI Creative Generator (3–4 months)

| Task | Detail |
|------|--------|
| Ad copy generator | 5 TikTok ad scripts from the product's angle + audience (LLM-generated) |
| Thumbnail prompt | Stable Diffusion prompt for hero ad image |
| Hook variants | 3 emotional hooks (curiosity / pain / social proof) for A/B testing |
| Export to Notion/Sheets | One-tap export of test plan + creative brief |
| B2B team plans | Shared credit pool, team members, admin dashboard |
| Apple Sign In | Required for App Store apps offering social login |

---

### Infrastructure Roadmap

| Area | MVP | v1.x | v2.0 |
|------|-----|------|------|
| Auth | Supabase email/pw | + Google OAuth | + Apple Sign In |
| Payments | Mock USDC | Real USDC / Stripe | Subscription tier |
| Data | Public APIs + mock | + Real supplier APIs | + Proprietary trend data |
| Backend | None (client-only) | Supabase Edge Functions | Dedicated API service |
| Analytics | None | Mixpanel / PostHog | Custom funnel dashboards |
| AI | Rule-based scoring | + LLM ad copy | + Fine-tuned scoring model |
| Notifications | Local-only store | Firebase Cloud Messaging | Personalised digest |

---

## 15. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Amazon RapidAPI rate limits / cost spikes | Medium | High | 5-min `cachedResult`, fallback to free sources, user-facing degradation notice |
| Scoring model inaccuracy → user burns money on bad picks | Medium | High | Score transparency (show dimensions), risk warning tags, free tier for < 9/10 products |
| Mock payment in demo → real payment complexity | High (known) | Medium | Service abstraction ready (`setPaymentService()`); backend verifier in v1.1 sprint |
| iOS App Store rejection for crypto/USDC payments | Medium | High | Offer Stripe as alternative payment in v1.1; USDC is optional path |
| Competitor ships mobile app | Low | High | Maintain 3-month feature lead; scoring accuracy + test plan moat are hardest to replicate |
| Supabase free tier limits at scale | Low now / Medium at 500 MAU | Medium | Upgrade to Pro tier at 500 MAU; Edge Functions scale well |
| YouTube API quota exhaustion | Medium | Low | Social buzz falls back to deterministic mock; score still computed |
| AsyncStorage data loss on app uninstall | Known behaviour | Low | Auth tied to Supabase session; re-login restores server-side data; local-only stores (watchlist) are a known trade-off until backend sync in v1.x |

---

## 16. Open Questions

### Active

1. **Gemini API for live AI summaries:** Should `geminiService.ts` be connected to a live Gemini key for the v1.1 release, or is the static fallback in `scoringService.ts` sufficient until the LLM creative generator in v2.0? (Static fallback is functional but all products share the same summary template.)

2. **USDC vs Stripe for real payments:** USDC is on-brand (crypto-native, no intermediary fees) but risks App Store rejection. Stripe is safe but loses the web3 positioning. Best approach for v1.1: ship Stripe as primary, offer USDC as a secondary "advanced" option?

3. **Watchlist score sync:** Should score refreshes on watchlist items happen on every app open (current behaviour) or be server-driven (future backend)? Client-side refresh is fast but expensive in API calls for large watchlists.

4. **Onboarding credit amount:** 10 starter credits allows 3× unlocks of 9/10 products or 2× unlocks of 10/10 products. Is this enough to demonstrate value before purchase? Or should it be 5 credits (tighter funnel) or 15 credits (more generosity)?

5. **Score weight changes post-launch:** Once real user data is available (products users unlocked + whether they actually launched), should score weights be updated automatically (ML-based recalibration) or manually reviewed? The current static weights in `SCORE_WEIGHTS` were tuned intuitively, not on real outcome data.

### Resolved

- **Navigation structure:** DrawerNavigator wraps BottomTabNavigator (not the other way around) — resolved in hackathon Day 1 via plan mode.
- **Product cache duration:** 5 minutes (`PRODUCT_CACHE_TTL_MS`) — balances freshness vs API cost.
- **Unlock persistence:** Stored in `useUnlockStore` (AsyncStorage) — once unlocked, always unlocked on device.
- **FlatList pagination:** `usePaginatedList` hook mandatory for all lists > 20 items — prevents jank on low-end devices.
