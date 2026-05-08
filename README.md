# TrendScout AI

> **A mobile product-research copilot for ecommerce merchants.** Find, score, compare, and unlock trending products before spending money on inventory or ads — with a transparent USDC credit system for premium intelligence.

Built as a polished React Native CLI + TypeScript MVP for hackathon judging. Works offline against bundled mock data, but blends in live free APIs (DummyJSON, Fake Store, optional YouTube Data API) when the device is online.

---

## 1. Project overview

TrendScout AI is built for Shopify, TikTok Shop, dropshippers, Instagram sellers, and small online store owners. It ingests product catalogs and demand signals, runs a weighted **Winning Score** (0–100, 1–10), and surfaces what to test next.

The 9/10 and 10/10 winners are gated behind a **USDC credit unlock**. The credit system is intentionally blockchain-style:

- Buy credits with USDC.
- Each premium unlock deducts credits.
- Every payment and unlock is logged with a transaction hash, status, and network so judges can see the audit trail.

For the MVP, settlement is **simulated** via `MockPaymentService` — clearly labeled in the UI as **USDC credit demo mode**. The architecture is testnet-ready: swapping in a real backend-verified payment service is a one-file change.

---

## 2. Features

- **Onboarding** — three-slide value prop (Discover · Compare · Unlock).
- **Dashboard** — credit balance, KPIs, top opportunity, quick actions.
- **Trending Products** — filter by category, recommendation, premium-only; sort by score / margin / social buzz.
- **Product Detail** — image carousel, full pricing & profit grid, score bars, AI summary, “why trending”, risks, audience, ad angle, suggested platforms.
- **Premium Lock UX** — blurred name and locked sections with clear unlock cost and current balance.
- **Score Breakdown** — full transparent dimension explanations.
- **Compare Products** — pick up to 3, side-by-side table, AI conclusion picks a winner.
- **Watchlist** — Watching / Testing / Avoided statuses, persisted via AsyncStorage.
- **Buy Credits** — three USDC packages (5 / 15 / 50), live-style payment flow.
- **Payment Success** — receipt with hash, network, and status.
- **Transaction History** — every USDC purchase and credit unlock.
- **Product Test Plan** — AI-generated audience, angle, ad copy, budget, duration, success metric.
- **Settings** — toggle Mock API mode, reset credits, clear data, see API status.

---

## 3. Free APIs used

| API | Purpose | Required? |
| --- | --- | --- |
| [DummyJSON `/products`](https://dummyjson.com/products) | Primary product catalog | No (falls back) |
| [Fake Store API `/products`](https://fakestoreapi.com/products) | Backup catalog if DummyJSON fails | No (falls back) |
| YouTube Data API v3 (`/search`) | Social buzz signal | **Optional** |

If DummyJSON and Fake Store both fail, the app uses the bundled `mockProducts` so the demo never breaks. If `EXPO_PUBLIC_YOUTUBE_API_KEY` is missing or invalid, the social-buzz score is computed deterministically from `mockSocialBuzz.ts`.

The hand-tuned demo catalog always includes:

- Pet Travel Water Bottle (10/10 · premium)
- Mini Thermal Printer (10/10 · premium)
- LED Face Mask (9/10 · premium)
- Smart LED Strip (9/10 · premium)
- Baby Nail Trimmer (9/10 · premium)
- Portable Neck Fan, Portable Blender, Car Vacuum Cleaner, Foldable Storage Box, Resistance Band Set

---

## 4. Setup

```bash
# 1. install dependencies
yarn install

# 2. start Metro bundler (resets cache)
yarn start

# 3. run on simulator (in a second terminal)
yarn ios       # iOS simulator
yarn android   # Android emulator

# iOS native dependencies (after adding/removing packages)
yarn pod-install
```

> **Tip:** the app caches scored products in memory after the first load. Pull-to-refresh on Dashboard or toggle Mock API mode in Settings to force a re-score.

---

## 5. Optional environment configuration

Create a `.env` file (or export in your shell) before running `yarn start`:

```bash
EXPO_PUBLIC_YOUTUBE_API_KEY=your_youtube_data_api_v3_key
```

`EXPO_PUBLIC_*` keys are inlined into the bundle at build time by `babel-plugin-transform-inline-environment-variables`. **Do not** put server secrets here. The YouTube key is read at bundle time; if it is missing, the app degrades gracefully to mock buzz scores.

---

## 6. How Mock API mode works

`Settings → Mock API mode` flips the data source.

- **Off (default):** the app tries DummyJSON, then Fake Store, and finally falls back to bundled mock data — and **always** blends in the curated demo products on top of live ones so judges see the premium examples.
- **On:** the app skips all network calls and uses only `src/mocks/mockProducts.ts`. Useful for offline demos and CI.

Implementation lives in [`src/services/productService.ts`](src/services/productService.ts) — `loadScoredProducts({ forceMock: true, refresh: true })`.

---

## 7. How the USDC credit demo works

```
┌────────────┐    createUsdcPaymentIntent    ┌────────────────┐
│  Buy       │ ─────────────────────────▶   │ MockPayment    │
│  Credits   │                               │ Service        │
│  Screen    │ ◀─── verifyUsdcPayment ─────  │ (mock TX hash) │
│            │ ─── addCredits(pkg, result)──▶│                │
└────────────┘                               └────────────────┘
        │
        ▼
   AsyncStorage   →  balance, transactions, unlocks
```

- `PaymentService` is an interface in [`src/services/paymentService.ts`](src/services/paymentService.ts).
- `MockPaymentService` simulates network latency (~1.4s), generates a 0x… 64-char hex hash, marks the transaction `confirmed` on a `mock` network, and credits the local balance via `creditService.addCredits`.
- Every transaction (purchase or unlock) is persisted to `AsyncStorage` and rendered on the **Transaction History** screen.
- The UI surfaces a **"USDC credit demo mode"** chip everywhere mock mode is active so demo viewers cannot mistake it for real settlement.

### Premium unlock flow

1. User taps a 9/10 or 10/10 product → premium lock card shows unlock cost + current balance.
2. If balance ≥ cost → `unlockService.unlockProduct` deducts credits, stores an unlock record, generates a transaction hash, and reveals all locked sections.
3. If balance < cost → user is routed to **Buy Credits**.

Costs:

- 9/10 product → **3 credits**
- 10/10 product → **5 credits**

---

## 8. Replacing MockPaymentService with a real backend

Real USDC settlement **must** be verified server-side; the mobile client must never hold private keys, seed phrases, or sign transfers.

To go live:

1. Implement `PaymentService` in a new file (e.g. `liveUsdcPaymentService.ts`):
   ```ts
   class LiveUsdcPaymentService implements PaymentService {
     readonly mode = 'mainnet';
     async createUsdcPaymentIntent(pkg) {
       return fetch('https://your-api/payments/intent', {
         method: 'POST',
         body: JSON.stringify({ packageId: pkg.id }),
       }).then(r => r.json());
     }
     async verifyUsdcPayment(intentId) {
       return fetch(`https://your-api/payments/${intentId}/verify`).then(r => r.json());
     }
     async addCredits(pkg, result) {
       return fetch('https://your-api/credits/grant', {
         method: 'POST',
         body: JSON.stringify({ packageId: pkg.id, txHash: result.txHash }),
       }).then(r => r.json());
     }
   }
   ```
2. Register it at app start:
   ```ts
   import { setPaymentService } from './src/services/paymentService';
   setPaymentService(new LiveUsdcPaymentService());
   ```
3. Your backend should:
   - Generate a unique receiving address (or reference) per intent.
   - Watch the chain (Base / Polygon / Solana USDC, etc.) for a transfer matching the intent.
   - Only return `confirmed` after sufficient block confirmations.
   - Be the only place that grants credits — never trust the mobile client to mint them.

The rest of the app works unchanged: balance display, transaction history, premium unlock, demo-mode banner all read from the registered `PaymentService.mode`.

---

## 9. Notes & guardrails

- Payments are mocked for the MVP and clearly labeled as demo mode.
- No private keys, seed phrases, or signing primitives are stored on the device.
- Production USDC payments must be verified server-side before crediting balances.
- All persistent state lives in AsyncStorage under namespaced keys (`@trendscout/*`) and can be wiped from Settings.

---

## 10. Folder layout

```
src/
  api/         DummyJSON, Fake Store, YouTube clients
  components/  Reusable UI (ProductCard, ScoreBadge, ScoreBar, …)
  mocks/       Bundled mock products & social-buzz fallbacks
  navigation/  React Navigation stack
  screens/     12 screens listed in §2
  services/    Domain services (scoring, products, payments, unlocks, watchlist, storage)
  theme/       Colors, spacing, typography tokens
  types/       Product, credits, navigation TypeScript interfaces
  utils/       Formatters, hash generator, normalizers, margin math
App.tsx        Entry point
app.json       Expo config
package.json   React Native 0.74, TypeScript 5
```

Built for a hackathon. Ready to grow into a real product.
