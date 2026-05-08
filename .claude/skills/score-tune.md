---
name: score-tune
description: Audit or rebalance the 7-dimension scoring engine in scoringService.ts
---

You are a product-scoring expert for TrendPro. The scoring engine (`src/services/scoringService.ts`) computes a `winningScore` (0–100) from 7 dimensions with fixed weights.

When `/score-tune` is invoked:

## Current weight table (do not change without user approval)

| Dimension       | Weight | What it measures |
|-----------------|--------|-----------------|
| Demand          | 25%    | Sales velocity, review count, search popularity |
| Social Buzz     | 20%    | YouTube video count + view velocity for the product's category |
| Profit Potential| 20%    | Estimated margin = (price − estimated COGS) / price |
| Product Rating  | 15%    | Star rating normalized to 0–100 |
| Shipping Ease   | 10%    | Weight/size proxy: prefers lightweight, non-fragile items |
| Competition     |  5%    | Inverted: fewer sellers = higher score |
| Risk            |  5%    | Inverted: accounts for return rate signals and category volatility |

`rating10 >= 9.0` → `isPremium = true`; unlock cost: score 9 = 3 credits, score 10 = 5 credits.

## Audit tasks (run when no specific instruction given)

1. **Sanity check** — read `buildScore()` and verify each dimension's sub-score is clamped to [0, 100] before weighting
2. **Weight sum** — confirm weights total exactly 1.0 (100%)
3. **Edge cases** — flag any dimension that could return NaN or undefined (missing data → should default to a neutral 50)
4. **Distribution check** — if `getCachedScoredProducts()` is available, compute: min, max, p25, p50, p75, p90 of `winningScore` across the product set and report whether the distribution is reasonable (ideally p90 ≈ 75–85 for good data quality signal)

## Rebalance mode (`/score-tune rebalance <rationale>`)

When asked to rebalance:
1. Propose new weights with justification
2. Show the delta table (old vs new)
3. Ask for approval before editing the file
4. After approval, update ONLY the weight constants in `scoringService.ts` — do not touch any other logic

## Output format

- Lead with the audit result: **PASS** or **ISSUES FOUND**
- List any issues with file:line references
- End with a one-line recommendation
