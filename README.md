# TrendPro

> **AI-powered product intelligence for ecommerce merchants — with on-chain USDC payments on Base Sepolia.**

Discover, score, compare, and unlock high-margin trending products before spending money on inventory or ads. TrendPro blends live Amazon data with a 7-dimension AI scoring engine and a real Web3 credit economy — USDC payments settle on **Base Sepolia testnet** via WalletConnect, with a full mock mode for simulator testing.

Built as a polished **React Native CLI + TypeScript** app. Works offline against bundled mock data, blends in live APIs when online, and ships two payment tiers: simulator-friendly mock mode and real on-chain USDC via MetaMask / Rainbow / any WalletConnect v2 wallet.

---

## Features

### Product Intelligence
- **7-Dimension AI Scoring** — Demand, Social Buzz, Profit Potential, Rating, Shipping Ease, Competition, Risk — weighted and combined into a 0–100 Winning Score (1–10 rating)
- **Live Amazon Data** — Real-Time Amazon Data API via RapidAPI (best sellers, deals, categories)
- **Dashboard** — Credit balance card, animated metric counters, Market Pulse carousel, What's Trending feed (Reddit), Top Opportunity card, Quick Actions
- **Trending Products** — Filter by category, recommendation, premium-only; sort by score / margin / social buzz
- **Discover** — Browse Amazon best sellers by category with live search, recent searches, trending chips
- **Product Detail** — Image carousel, full pricing & profit grid, animated score bars, AI summary, "why trending", risks, audience, ad angles, suggested platforms
- **Score Breakdown** — Full transparent per-dimension explanations with weights
- **Compare Products** — Pick up to 3 products, side-by-side table, AI conclusion picks a winner
- **AI Ad Copy Generator** — TikTok, Meta, Google ad scripts generated via Gemini 2.0 Flash (1 credit)
- **Product Test Plan** — AI-generated audience, angle, ad copy, budget, duration, success metric

### Premium Lock System
- 9/10 products → **3 credits** to unlock
- 10/10 products → **5 credits** to unlock
- Blurred name and locked sections with balance check; routes to Buy Credits if insufficient

### Web3 Credit Economy

| Mode | Badge | How it works |
|------|-------|-------------|
| **Mock (Demo)** | 🟡 USDC DEMO MODE | Simulates ~1.4s latency, fake `0x…` hash, no wallet needed — works on simulator |
| **Base Sepolia Testnet** | 🟢 BASE SEPOLIA TESTNET | Real ERC-20 USDC transfer via WalletConnect v2, on-chain receipt polling, verified tx hash |

**Toggle in `App.tsx` — one line:**
```ts
const USE_MOCK_PAYMENT = true;   // false → real Base Sepolia USDC
```

**Credit packages:**

| Package | Credits | Bonus | Total | USDC |
|---------|---------|-------|-------|------|
| Starter | 5 | — | 5 | 4 |
| Pro ⭐ | 12 | +3 | 15 | 9 |
| Elite | 25 | +10 | 35 | 15 |
| Power | 60 | +30 | 90 | 28 |
| Monthly Pass | 25/mo | — | 25 | 19 |

### Other Screens
- **Watchlist** — Watching / Testing / Avoided statuses, persisted via AsyncStorage
- **Payment Success** — Receipt with real/mock tx hash, network, timestamp
- **Transaction History** — Every USDC purchase and credit unlock with full audit trail
- **Investor Metrics** — Chain volume, total transactions, on-chain stats
- **Onboarding** — Three-slide value prop (Discover · Compare · Unlock)
- **Settings** — Mock API toggle, reset credits, clear data, API status

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.74 (bare CLI, not Expo managed) |
| Language | TypeScript 5 (strict) |
| Navigation | React Navigation 6 (Stack + Bottom Tab + Drawer) |
| State | Zustand + AsyncStorage persist |
| Data fetching | React Query v5 |
| Animations | Reanimated 3 + React Native Gesture Handler |
| Web3 | wagmi v3 + viem v2 + WalletConnect v2 (Web3Modal) |
| Chain | Base Sepolia testnet (Chain ID: 84532) |
| USDC Contract | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` (Circle official) |
| AI | Gemini 2.0 Flash (ad copy + insights) |
| UI | React Native Paper + Linear Gradient + BlurView |
| Icons | React Native Vector Icons (MaterialCommunityIcons) |

---

## Setup

```bash
# 1. Install JS dependencies
yarn install

# 2. Install iOS native pods (required)
cd ios && LANG=en_US.UTF-8 pod install && cd ..

# 3. Start Metro bundler
yarn start --reset-cache

# 4. Run on simulator (separate terminal)
yarn ios
```

> **Note:** This is a **bare React Native CLI** project. Use `yarn ios` / `yarn android`, not `expo start`.

> **iOS minimum deployment target:** 14.0 (required by `@react-native-community/netinfo` v12)

---

## Environment Variables

Create a `.env` file in the project root:

```bash
# ── WalletConnect (required for real testnet payments)
EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID="your_project_id"
# Get free at: https://cloud.walletconnect.com

# ── Supabase (required for auth)
EXPO_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
EXPO_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"

# ── Amazon live data (optional — falls back to mock)
EXPO_PUBLIC_RAPIDAPI_KEY="your_rapidapi_key"
# Subscribe free at: https://rapidapi.com → Real-Time Amazon Data

# ── YouTube social buzz scoring (optional — falls back to mock)
EXPO_PUBLIC_YOUTUBE_API_KEY="your_youtube_key"

# ── Gemini AI (optional — falls back to static summaries)
EXPO_PUBLIC_GEMINI_API_KEY="your_gemini_key"

# ── Payment mode
# true  = mock/demo (no wallet, works on simulator)
# false = real Base Sepolia USDC (needs MetaMask + testnet USDC)
EXPO_PUBLIC_USE_MOCK_PAYMENT=true
```

After editing `.env`, always restart Metro with `yarn start --reset-cache`.

---

## Payment Modes

### Mock Mode (Simulator / Demo)

Set `USE_MOCK_PAYMENT = true` in `App.tsx`. No wallet required.

1. Open **Credits** tab
2. Confirm amber **"USDC DEMO MODE"** badge
3. Select a package → tap **Pay X USDC**
4. ~1.4s processing → **PaymentSuccess** screen with fake `0x…` hash
5. Credits added instantly, transaction logged in history

### Real Base Sepolia Testnet (Physical Device)

Set `USE_MOCK_PAYMENT = false` in `App.tsx`.

**Prerequisites:**
- iPhone with MetaMask (or Rainbow / any WalletConnect v2 wallet) installed
- Switch wallet to **Base Sepolia** network
- Get free testnet USDC from [Base Sepolia faucet](https://faucet.circle.com)
- Valid `EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID` in `.env`

**Steps:**
```bash
# App.tsx: const USE_MOCK_PAYMENT = false;
yarn start --reset-cache
yarn ios --device
```

1. Credits tab → green **"BASE SEPOLIA TESTNET"** badge
2. Tap **Connect Wallet** → scan QR / deep-link to MetaMask
3. Select package → tap pay → sign in MetaMask
4. Wait ~9s for on-chain confirmation
5. Verify on [Base Sepolia Explorer](https://sepolia.basescan.org)

---

## Data Sources

| Source | Purpose | Key Required |
|--------|---------|-------------|
| Amazon (RapidAPI) | Live best sellers, categories, deals | `EXPO_PUBLIC_RAPIDAPI_KEY` |
| DummyJSON | Fallback product catalog | No |
| Fake Store API | Fallback product catalog | No |
| Bundled mock | Always blended in — hero demo products always appear | No |
| YouTube Data API | Social buzz scoring signal | `EXPO_PUBLIC_YOUTUBE_API_KEY` |
| Reddit API | Market pulse + trending posts | No |
| Gemini 2.0 Flash | Ad copy generation + AI insights | `EXPO_PUBLIC_GEMINI_API_KEY` |

The app never fully breaks — mock data is always blended in so premium demo products always appear regardless of API availability.

---

## Architecture

### Data Flow
```
APIs (Amazon / DummyJSON / FakeStore / YouTube)
  └─▶ productService.ts       — orchestrates sources, dedupes, memory cache
        └─▶ scoringService.ts — buildScore() → ScoredProduct (pure function)
              └─▶ useProductStore (Zustand) — holds ScoredProduct[]
                    └─▶ useProductsQuery (React Query) — wraps for screens
```

### Payment Flow (Testnet)
```
BuyCreditsScreen.onPay()
  └─▶ service.createUsdcPaymentIntent(pkg)   — generates intentId
  └─▶ service.verifyUsdcPayment(intentId)
        └─▶ WalletConnect → MetaMask         — user signs ERC-20 transfer
        └─▶ wagmi writeContract()            — USDC → Treasury
        └─▶ poll getTransactionReceipt()     — every 3s, max 60s
  └─▶ service.addCredits(pkg, result)
        └─▶ AsyncStorage balance update
        └─▶ Transaction history log
        └─▶ Chain volume increment (Investor Metrics)
  └─▶ navigate('PaymentSuccess')
```

### Navigation
```
AppNavigator (Stack)
  ├── Onboarding
  └── MainApp → RootStackNavigator
        ├── DrawerRoot → DrawerNavigator
        │     ├── BottomTabNavigator (Dashboard · Trending · Discover · Watchlist · Credits)
        │     └── Analytics · Profile · Settings · Notifications
        ├── ProductDetail
        ├── ScoreBreakdown
        ├── CompareProducts
        ├── ProductTestPlan
        ├── InvestorMetrics
        └── PaymentSuccess (modal)
```

### Scoring Engine Weights

| Dimension | Weight |
|-----------|--------|
| Demand | 25% |
| Social Buzz | 20% |
| Profit Potential | 20% |
| Product Rating | 15% |
| Shipping Ease | 10% |
| Competition (inverted) | 5% |
| Risk (inverted) | 5% |

`rating10 ≥ 9` → product is `isPremium`. Unlock costs: 9/10 = 3 credits, 10/10 = 5 credits.

---

## Folder Structure

```
plans/              Feature implementation plans (.md per feature)
src/
  api/              Raw fetch functions (Amazon, DummyJSON, FakeStore, YouTube, Reddit)
  components/       Shared UI components + skeletons
  config/           wagmi + Web3Modal config
  constants/        App-wide constants (chain IDs, RPC, USDC contract, score weights)
  hooks/            Custom hooks + React Query hooks
  lib/              Supabase client singleton
  mocks/            Bundled mock data (products, social buzz)
  navigation/       Navigator definitions
  screens/          One file per screen (auth screens under screens/auth/)
  services/         Business logic (product, scoring, payment, credit, wallet, unlock, gemini)
  stores/           Zustand stores (one per domain)
  theme/            Design tokens (colors, spacing, typography, responsive)
  types/            Global TypeScript interfaces
  utils/            Pure utility functions
App.tsx             App root — payment mode toggle lives here
index.js            Entry point — polyfills (WalletConnect, ethers, URL)
```

---

## Smart Contracts & Addresses

| Item | Value |
|------|-------|
| Network | Base Sepolia (Chain ID: 84532) |
| RPC | `https://base-sepolia-rpc.publicnode.com` |
| USDC Contract | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |
| Treasury Wallet | `0x10Bc9282030dd5a2CF4c7D0fc88e3ad2Ef894C24` |

---

## Production Checklist

- [ ] Replace `MockPaymentService` / `BaseSepoliaPaymentService` with a backend-verified implementation (server must confirm receipt before granting credits — never trust client)
- [ ] Move treasury to a multisig wallet
- [ ] Switch from Base Sepolia → Base Mainnet (update chain config in `src/config/wagmi.ts` + constants)
- [ ] Add server-side Supabase RLS policies for credit balances
- [ ] Enable push notifications (store is local-only in MVP)
- [ ] Connect live Gemini API key for real ad copy generation

---

## Contributing

1. Fork → create feature branch
2. Run `yarn ts:check` — must pass before any PR
3. Run `yarn lint` — no new ESLint errors
4. Create a plan file at `plans/<feature-slug>.md` for any change touching ≥ 3 files
5. No raw hex colors, no raw pixel values — use theme tokens from `src/theme/`
6. No `console.log` in production paths — wrap in `if (__DEV__)`

---

Built for a hackathon. Architected to grow into a real product.
