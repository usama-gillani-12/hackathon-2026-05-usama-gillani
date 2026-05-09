# TrendPro — Post-Hackathon Roadmap

**Hackathon:** Let's AI Hackathon · May 7–9 2026
**MVP shipped:** May 9 2026
**Status:** Committed · Reviewed alongside [Notion Engineering & Product Brief — Ch. 10](https://www.notion.so/35b85d79bc5081f6b502c64c18b21bf0)

---

## Strategic thesis (12 months)

In one year, TrendPro becomes **the default mobile surface for solo e-commerce sellers to find their next product** — with a defensible moat in three layers:

1. **Data moat** — historical signal snapshots no competitor has
2. **Model moat** — a hit-rate-tuned scoring engine, calibrated against real outcomes
3. **Network moat** — a community layer where sellers share verified outcomes for credit rebates

> **North-star metric:** monthly **verified successful unlocks** — unlocks where the user later marks the product as *Tested → worked* in their watchlist. Every roadmap item ladders up to that number.

---

## Vision

TrendPro becomes the app open on a solo seller's phone *before* they open their ad account. The moat compounds with usage: every release, scoring weights get smarter based on real sell-through data from users who actually launched what they unlocked.

---

## 30 / 60 / 90 day plan

### Days 1–30 — Submission, polish, observability

| Task | Detail |
|------|--------|
| **TestFlight + Play Internal Testing** | Apple Developer Program enrollment → first external build |
| **Sentry** for crash & error reporting | Replaces all `__DEV__` console.\* paths |
| **PostHog** funnel analytics | install → onboarding complete → first unlock → second unlock |
| **Mainnet migration plan** | USDC on Base mainnet, treasury rotation procedure documented |
| **Pricing experiment** | 3-credit vs 4-credit unlock for 9/10 products, A/B at install |
| **Onboarding cut** | reduce 3 slides → 1 slide + a free first unlock |

### Days 31–60 — Web3 maturity & payment polish

| Task | Detail |
|------|--------|
| **In-app fiat onramp** (Coinbase Onramp / MoonPay) | Card → USDC without leaving the app |
| **Apple Pay & Google Pay** | Fiat-rail alternatives — USDC for the crypto-native, Apple Pay for everyone else |
| **Gasless unlocks** via Base Paymaster | The user signs, the app pays gas |
| **Recurring credit packs** | Pay-per-unlock semantics, but auto-top-up below threshold |
| **Multi-chain readiness** | Abstract chain config so adding Polygon zkEVM / Arbitrum is a config change |
| **Backend payment verifier** | Supabase Edge Function — watches USDC wallet for on-chain confirmations |
| **Server-side receipt validation** | Credit grant only after confirmed tx — never trust client |
| **Restore purchases** flow | For users reinstalling the app |

### Days 61–90 — Data foundation

| Task | Detail |
|------|--------|
| **Signal snapshot service** | Every product, every signal, every 24h, persisted server-side. *The single most important investment in the entire roadmap.* |
| **8th scoring dimension: Trend Velocity** | 7-day rate-of-change of social buzz; weight TBD after backtest |
| **Outcome telemetry** | One-tap *worked* / *flopped* survey, 30 days post-unlock |
| **First public research blog** | *"What 10,000 unlocks taught us about scoring trending products"* |

---

## v1.x — Tactical feature releases

### v1.1 — Live Supplier Quote Integration *(Weeks 4–6)*

| Task | Detail |
|------|--------|
| Alibaba / CJ Dropshipping API | Pull live sourcing cost to replace the `calculateMargin` category model |
| Real margin calculation | Replace estimated cost with actual supplier quote per product |
| Shipping estimate | Integrate ePacket / Yunexpress rate API for per-kg cost |
| Score recalibration | `profitPotential` becomes more accurate → better recommendations |

> The margin model is the most impactful dimension after social buzz. Accurate sourcing costs = accurate profit scores = user trust.

### v1.2 — Push Notifications & Score Alerts *(Weeks 6–8)*

| Task | Detail |
|------|--------|
| Firebase Cloud Messaging (FCM) | iOS (APNs) and Android setup |
| Watchlist score-change alerts | *"Pet water bottle just hit 9/10 — up from 7 last week"* |
| Trending surge notifications | Alert when a new product crosses 85+ score in the user's favourite categories |
| Daily digest | *"3 new 8+ products in your niches today"* — opt-in |

> Retention play. Notifications bring users back without paid re-engagement ads.

### v1.3 — Social Sharing & Viral Loop *(Weeks 8–10)*

| Task | Detail |
|------|--------|
| Shareable score card | Branded PNG of the product score card for TikTok / Instagram Stories |
| Referral credits | *"Give a friend 5 credits, get 5 when they buy their first pack"* |
| Public leaderboard | Top 10 most-watched products this week, anonymised |
| TikTok deep-link | Tap to search TikTok for the product directly from the detail screen |

---

## H2 2026 — The model moat

With 90 days of outcome telemetry, we earn the right to evolve the score:

- **Per-niche weight calibration.** Beauty products score differently than electronics. Today we use one weight vector; we'll evolve to category-specific vectors, learned from outcomes.
- **Forecast curves.** Show *projected* score 7 days out alongside today's score. Users want to know if they're catching a wave or chasing a fad.
- **AI-augmented signals.** A learned residual on top of the linear model — transparent base, ML for the last 10%. We expose the residual explicitly so users see *why* the model deviated from the formula.
- **Confidence intervals.** Every score becomes a range, not a point. Low-data niches show wider ranges — honesty is a feature.

---

## v2.0 — AI Creative Generator *(3–4 months)*

| Task | Detail |
|------|--------|
| Ad copy generator | Gemini 2.0 Flash generates 5 TikTok ad scripts from the product's ad angle + audience |
| Thumbnail prompt | Stable Diffusion prompt for the hero image of the ad creative |
| Hook variants | 3 emotional hooks (curiosity / pain / social proof) for A/B testing |
| Export to Notion / Sheets | One-tap export of the full test plan + creative brief |

> The 10× feature that separates TrendPro from every other product research tool. No competitor generates ad creatives. This makes it a complete campaign launcher, not just a scorer.

---

## 2027 — The network moat

- **Community results layer.** Verified outcomes (*"I tested this product, here's the ad spend, here's the ROAS"*) become a public artifact, anonymised, attached to the product page. Verification via on-chain receipts where possible.
- **Rebate program.** Users who submit verified outcomes earn credit rebates. The data flywheel becomes a user-incentive flywheel.
- **Marketplace partnerships.** Whitelisted Shopify themes, Amazon agency referrals, TikTok Shop creator fund — monetize the bottom-of-funnel after we own the top.
- **Web companion + public API.** Same scoring engine, surfaced via web for desktop users and as an API for power users.

---

## Adjacent product bets (under consideration, not committed)

| Bet | Hypothesis | Risk |
|---|---|---|
| **Supplier connect** | After scoring, sellers want sourcing | Adds B2B complexity and a different sales motion |
| **Multi-tenant agency mode** | Agencies score products for clients | Useful but small TAM in v1 |
| **AI shopping assistant for buyers** | Same engine, opposite audience | Different brand, would dilute focus |

We will commit at most **one** of these for 2027 H2, decided after Q1 telemetry.

---

## Risks register

| Risk | Severity | Mitigation |
|---|---|---|
| **Marketplace API revocation** | High | Multi-source pipeline; never depend on one provider |
| **App Store crypto policy shift** | High | Mock-mode toggle ships in production builds; can disable on-chain payment region-by-region |
| **Score quality complaints** | Medium | Outcome telemetry + transparent breakdown reduce blame surface |
| **Gemini cost spikes** | Low | Insights cached per-product; only generated post-unlock |
| **WalletConnect deprecation** | Low | Wagmi connector layer abstracts the protocol |

---

## Infrastructure evolution

| Area | Now (MVP) | v1.x | v2.0 |
|---|---|---|---|
| **Auth** | Supabase email/pw | + Google OAuth | + Apple Sign In |
| **Payments** | Mock USDC + Base Sepolia | Real USDC mainnet + Stripe / fiat onramp | Subscription tier |
| **Data** | Public APIs + curated dataset | + Real supplier APIs | + Proprietary trend data |
| **Backend** | None (client-only) | Supabase Edge Functions | Dedicated API service |
| **Analytics** | None | Sentry + PostHog | Custom funnel dashboards |
| **AI** | Rule-based scoring | + LLM ad copy | + Fine-tuned scoring model |

---

## Metrics that drive prioritization

1. **Credit purchase rate** — if < 10%, fix onboarding or price; if > 30%, raise price
2. **Unlock → test conversion** — do users who unlock actually launch the product?
3. **Watchlist save rate** — proxy for product discovery quality
4. **Session length** — target > 4 min if scoring is engaging
5. **D7 retention** — target > 35% (good for a utility app)
6. **Verified successful unlocks** *(north star)* — outcomes marked *worked* 30 days post-unlock

---

## How we'll know we're winning

A single number: **monthly verified successful unlocks**. Every roadmap item ladders up to that number, or it gets cut.
