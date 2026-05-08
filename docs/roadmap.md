# TrendPro — Post-Hackathon Roadmap

**Hackathon:** Let's AI Hackathon · May 7–9 2026  
**MVP shipped:** May 9 2026

---

## Vision

TrendPro becomes the default product research companion for every solo dropshipper — the app open on their phone before they open their ad account. The moat is the scoring model accuracy: every release, the weights get smarter based on real sell-through data from users who actually launched the products they unlocked.

---

## v1.1 — Real Payment Integration
**Target:** 2–3 weeks post-hackathon

| Task | Detail |
|------|--------|
| Integrate RevenueCat or Stripe | Replace `MockPaymentService` with `LivePaymentService` calling a backend endpoint |
| Backend payment verifier | Node.js / Supabase Edge Function that watches USDC wallet for on-chain confirmations |
| Receipt validation | Server-side credit grant after confirmed tx — no client-side trust |
| Restore purchases | `restorePurchases()` flow for users reinstalling the app |

**Why first:** Without real payments, the app can't monetise. Everything else is optimisation.

---

## v1.2 — Live Supplier Quote Integration
**Target:** 4–6 weeks post-hackathon

| Task | Detail |
|------|--------|
| Alibaba / CJ Dropshipping API | Pull live sourcing cost to replace the `calculateMargin` category model |
| Real margin calculation | Replace estimated cost with actual supplier quote per product |
| Shipping estimate | Integrate ePacket / Yunexpress rate API for per-kg cost |
| Score recalibration | `profitPotential` dimension becomes more accurate → better recommendations |

**Why second:** The margin model is the most impactful dimension after social buzz. Accurate sourcing costs = accurate profit scores = user trust.

---

## v1.3 — Push Notifications & Score Alerts
**Target:** 6–8 weeks post-hackathon

| Task | Detail |
|------|--------|
| Firebase Cloud Messaging (FCM) | Setup for iOS (APNs) and Android |
| Watchlist score change alerts | "Pet water bottle just hit 9/10 — up from 7 last week" |
| Trending surge notification | Alert when a new product crosses 85+ score in the user's favourite categories |
| Daily digest | "3 new 8+ products in your niches today" — opt-in |

**Why third:** Retention. Push notifications bring users back without paid re-engagement ads.

---

## v1.4 — Social Sharing & Viral Loop
**Target:** 8–10 weeks post-hackathon

| Task | Detail |
|------|--------|
| Share score card | Generate a branded PNG of the product score card for TikTok/Instagram Stories |
| Referral credits | "Give a friend 5 credits, get 5 when they buy their first pack" |
| Public leaderboard | Top 10 most-watched products this week (anonymised) |
| TikTok deep link | Tap to search TikTok for the product directly from the detail screen |

---

## v2.0 — AI Creative Generator
**Target:** 3–4 months post-hackathon

| Task | Detail |
|------|--------|
| Ad copy generator | GPT-4o generates 5 TikTok ad scripts from the product's ad angle + audience |
| Thumbnail prompt | Stable Diffusion prompt for the hero image of the ad creative |
| Hook variants | 3 different emotional hooks (curiosity / pain / social proof) for A/B testing |
| Export to Notion/Sheets | One-tap export of the full test plan + creative brief |

**Why v2:** This is the 10× feature that separates TrendPro from every other product research tool. No competitor generates ad creatives. This makes it a complete campaign launcher, not just a scorer.

---

## Infrastructure Roadmap

| Area | Now (MVP) | v1.x | v2.0 |
|------|-----------|------|------|
| Auth | Supabase email/pw | + Google OAuth | + Apple Sign In |
| Payments | Mock USDC | Real USDC / Stripe | Subscription tier |
| Data | Public APIs + mock | + Real supplier APIs | + Proprietary trend data |
| Backend | None (client-only) | Supabase Edge Functions | Dedicated API service |
| Analytics | None | Mixpanel / PostHog | Custom funnel dashboards |
| AI | Rule-based scoring | + LLM ad copy | + Fine-tuned scoring model |

---

## Metrics to Drive Roadmap Prioritisation

1. **Credit purchase rate** — if < 10%, fix onboarding or price; if > 30%, raise price
2. **Unlock → test conversion** — do users who unlock actually launch the product?
3. **Watchlist save rate** — proxy for product discovery quality
4. **Session length** — should be > 4 min if scoring is engaging
5. **D7 retention** — target > 35% (good for a utility app)
