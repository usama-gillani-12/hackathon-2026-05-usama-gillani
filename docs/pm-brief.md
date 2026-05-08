# TrendPro — PM Brief

**Hackathon:** Let's AI Hackathon · May 7–9 2026  
**Owner:** Solo build  
**Status:** MVP shipped

---

## 1. The Opportunity

The global dropshipping market is projected to reach $1.25 trillion by 2030. Despite this, the tooling for product research is fragmented:

- **Expensive desktop tools** (Minea, AdSpy, Dropship.io) cost $50–$200/month and require a laptop
- **Manual TikTok/Amazon browsing** takes 3–8 hours per product validation cycle
- **No mobile-first solution** exists that blends multi-source data + AI scoring in one tap

**TrendPro is the first mobile-native product intelligence app** for dropshippers — built for the generation that runs their business from a phone.

---

## 2. Target Persona

### "The Weekend Warrior"
> *Maya, 27 — Miami. Manages a Shopify store part-time while working a 9–5. Researches products on her phone during her commute and weekends. Has a $500/month ad budget and can't afford to waste it on untested products.*

**Needs:**
- Fast signal on whether a product is worth testing (< 30 seconds)
- Concrete ad angle and audience suggestion she can copy-paste
- Price she can realistically sell at with healthy margin
- Risk heads-up before she orders 100 units

**Frustrations:**
- Minea is too slow and requires desktop
- TikTok trending ≠ actually profitable
- She's been burned twice by high-competition niches that seemed hot

---

## 3. User Journey

```
App Install
    │
    ▼
Onboarding (1 screen, one-time)
  → Brand intro + starter credits granted
    │
    ▼
Auth Gate (Login / Sign Up via Supabase)
    │
    ▼
Dashboard (Home Tab)
  → Curated feed of scored products, sorted by winning score
  → Quick-scan: score badge, recommendation tag, price
    │
    ├── Tap product card
    │     ▼
    │   Product Detail
    │     → Full score breakdown (7 bars)
    │     → AI Summary + Why Trending + Risks
    │     → Ad angle + audience + suggested platforms
    │     → [Premium] Full test plan
    │     → Unlock with credits if score ≥ 9
    │
    ├── Discover Tab
    │     → Search Amazon best-sellers by keyword/category
    │     → Same scoring engine applied in real time
    │
    ├── Trending Tab
    │     → Top 20 products globally this session
    │
    ├── Watchlist Tab
    │     → Saved products for later
    │
    └── Credits Tab
          → Buy more credits via mock USDC payment
          → Transaction history
```

---

## 4. Key Performance Indicators (KPIs)

| KPI | Hackathon Target | Post-Launch Target |
|-----|-----------------|-------------------|
| End-to-end flow: onboard → score → unlock | ✅ Working | < 45 sec average |
| Products scored per session | N/A (demo) | > 10 |
| Credit purchase conversion | N/A (mock) | > 15% of active users |
| Watchlist save rate | N/A (demo) | > 40% of detail views |
| App crash rate | 0 during demo | < 0.1% sessions |
| TypeScript errors | 0 | 0 |

---

## 5. Competitive Positioning

| Feature | TrendPro | Minea | AdSpy | Dropship.io |
|---------|----------|-------|-------|------------|
| Mobile-native | ✅ | ❌ | ❌ | ❌ |
| AI scoring (multi-dim) | ✅ | Partial | ❌ | Partial |
| Free tier / credits model | ✅ | ❌ | ❌ | ❌ |
| Amazon + social data blend | ✅ | ✅ | ✅ | ✅ |
| Test plan generator | ✅ | ❌ | ❌ | ❌ |
| Price point | Credits-based | $49/mo | $149/mo | $29/mo |

**Core differentiator:** The only tool that generates a complete ad test plan — audience, copy, budget, duration, and success metric — in a single tap.

---

## 6. Monetisation Model

**Credit packs** (USDC micro-payments):
- Starter: 10 credits · $2.99
- Growth: 50 credits · $9.99  
- Pro: 150 credits · $24.99
- Elite: 500 credits · $69.99

Credits spent only on premium unlocks (9/10 = 3 credits, 10/10 = 5 credits). Basic scores and recommendations are always free.

**Post-hackathon:**
- Monthly subscription tier ($19/month unlimited unlocks)
- B2B team plans for sourcing agencies
