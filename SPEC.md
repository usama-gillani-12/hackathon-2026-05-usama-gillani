# TrendPro — Product Specification

**Hackathon:** Let's AI Hackathon · May 7–9 2026  
**Version:** 1.0.0 (MVP)  
**Platform:** iOS & Android (React Native CLI)

---

## 1. Problem Statement

Dropshippers and e-commerce sellers spend hours manually researching products across Amazon, TikTok, and supplier sites — with no reliable signal on whether a product will actually sell. Most tools are either too expensive, desktop-only, or require a sourcing agent.

**TrendPro solves this** by aggregating live product data from multiple sources and running a 7-dimension AI scoring model that outputs a single 1–10 winning score, plus a full test plan, in seconds — right from a mobile phone.

---

## 2. Target User

| Attribute | Detail |
|-----------|--------|
| **Primary persona** | Solo dropshipper or micro-brand owner, 22–38 years old |
| **Tech comfort** | Moderate — uses TikTok, Shopify, Facebook Ads daily |
| **Pain point** | No fast, affordable way to validate a product idea before spending ad budget |
| **Decision context** | Usually researching products on mobile, late evening or weekends |
| **Willingness to pay** | $5–$20 for a tool that saves 3+ hours per week |

---

## 3. Core Features (MVP)

### 3.1 Product Intelligence Feed
- Blends 4 data sources: Amazon (RapidAPI), DummyJSON, FakeStore, and bundled mock hero products
- Each product is scored in real time by `scoringService.buildScore()`
- Displayed as scrollable cards sorted by winning score descending
- Paginated: 15 products per page (`PAGE_SIZE_PRODUCTS`)

### 3.2 7-Dimension Scoring Engine

| Dimension | Weight | Source |
|-----------|--------|--------|
| Demand Signal | 25% | Stock movement + rating + discount |
| Social Buzz | 20% | YouTube video count proxy via `youtubeApi` |
| Profit Potential | 20% | Category margin model (`calculateMargin`) |
| Product Rating | 15% | Raw star rating normalised to 0–100 |
| Shipping Ease | 10% | Category lookup table |
| Competition (inverted) | 5% | Category lookup table |
| Risk (inverted) | 5% | Category lookup table |

Output: `winningScore` (0–100) → `rating10` (1–10) → `recommendation` (Test Now / Watch Closely / Research More / Avoid for Now)

### 3.3 Premium Lock & Credit System
- Products scoring 9/10 → locked, costs **3 credits** to unlock full data + test plan
- Products scoring 10/10 → locked, costs **5 credits** to unlock
- Credits purchased via in-app USDC payment flow (mock in MVP)
- New users receive starter credits on onboarding

### 3.4 Product Detail & Score Breakdown
- Full 7-bar score breakdown with explainer text per dimension
- AI Summary: auto-generated plain-English summary
- Why Trending: social context paragraph
- Risks to Watch: category-specific risk paragraph
- Best audience + ad angle recommendations
- Suggested selling platforms (Shopify, TikTok Shop, Instagram Reels, Facebook Ads)

### 3.5 Test Plan Generator
- Auto-generated ad test plan per product
- Includes: suggested retail price, target audience, ad copy variant #1, testing budget ($50–$100), test duration (3–5 days), and success metric (CPA + ROAS targets)

### 3.6 Watchlist
- Users can save any product to a persistent watchlist
- Survives app restart via Zustand `persist` + AsyncStorage
- Paginated at 10 entries (`PAGE_SIZE_WATCHLIST`)

### 3.7 Discover Tab
- Best-seller search powered by Amazon RapidAPI (falls back to DummyJSON if key absent)
- Category filter + keyword search
- Page size: 12 (`PAGE_SIZE_DISCOVER`)

### 3.8 Compare Products
- Side-by-side comparison of 2 products across all 7 score dimensions
- Visual delta highlighting (winner column highlighted)

### 3.9 Analytics Dashboard
- Portfolio-level stats: total products scanned, avg score, top category, credits spent
- Charts: score distribution, category breakdown

### 3.10 Authentication
- Email/password via Supabase Auth
- Validation: react-hook-form + yup, `mode: 'onTouched'`
- Field-level inline errors + Supabase error mapping to human-friendly messages

---

## 4. MVP Scope (Hackathon Build)

### In Scope ✅
- All 10 features above
- iOS simulator build
- Mock USDC payment (no real money)
- Synthetic data as primary source; real Amazon API optional
- Supabase auth (email + password)
- Onboarding screen (1-time, gated by `onboardingComplete` flag)

### Out of Scope ❌ (post-hackathon)
- Real USDC / crypto payment settlement
- Push notifications
- Social sharing
- Admin dashboard
- Server-side rendering or backend API beyond Supabase
- Android-specific testing (iOS-first for demo)

---

## 5. Success Metrics

| Metric | MVP Target |
|--------|-----------|
| End-to-end flow works without crash | 100% |
| Score computed for any product in < 200ms | ✅ |
| Premium unlock flow completes correctly | ✅ |
| Watchlist survives full app restart | ✅ |
| Auth: login + signup + error states all work | ✅ |
| TypeScript: zero type errors (`yarn ts:check`) | ✅ |

---

## 6. Non-Functional Requirements

- **Performance:** FlatLists use `usePaginatedList` + `onEndReached` — no full-list renders
- **Responsiveness:** All sizing via `ms()` (moderateScale) — works on 4" to 6.9" screens
- **Resilience:** App degrades gracefully if RapidAPI or YouTube keys are absent
- **Security:** No secrets in client bundle; env vars via `EXPO_PUBLIC_` prefix
- **Data:** Synthetic / public mock data only — no production PII
