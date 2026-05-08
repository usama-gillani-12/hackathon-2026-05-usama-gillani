# AI Ad Copy Generator — Feature Plan

## Why This Feature

TrendPro users unlock premium products with credits but previously got no immediately actionable output beyond analytics. The **AI Ad Copy Generator** closes the monetization loop:

> discover product → unlock (3–5 credits) → generate ad scripts (1 credit) → launch ads → profit → buy more credits

This is the single highest-leverage investor-demo feature because it:
- Proves the credit economy is self-sustaining
- Gives users something tangible and copy-paste ready
- Differentiates TrendPro from every other product discovery tool

---

## Files Changed

| File | Type | Change |
|------|------|--------|
| `src/types/adCopy.ts` | **New** | `AdScript`, `AdCopyResult`, `AdPlatform` interfaces |
| `src/constants/index.ts` | Modified | `AD_COPY_COST = 1` constant |
| `src/theme/colors.ts` | Modified | `metaBlue` palette + semantic token |
| `src/services/geminiService.ts` | Modified | `generateAdCopy()` function + `adCopyCache` Map |
| `src/screens/ProductDetailScreen.tsx` | Modified | New section, state, handler, sub-component, styles |

---

## Architecture

### Data Flow
```
User taps "Generate Ad Scripts"
  → handleGenerateAdCopy()
    → useCreditStore.spendCredits(1)       ← deduct credit from Zustand + AsyncStorage
    → useCreditStore.recordTransaction()   ← audit trail in credit history
    → qc.invalidateQueries(creditBalance)  ← refresh tab bar badge
    → generateAdCopy(scored)               ← Gemini 2.0 Flash API call
      → adCopyCache.set(productId, result) ← session-level cache (no re-charge on revisit)
    → setAdCopy(result)                    ← local component state → render 3 script cards
```

### Credit Charging Policy
- User is charged **before** the Gemini call
- If Gemini fails → State C (error + retry) renders; retry does **not** re-charge
- If the user has insufficient credits → State A shows inline warning with "Buy Credits →" link

### Caching
- `adCopyCache` is a module-level `Map<string, AdCopyResult>` in `geminiService.ts`
- Session-scoped (cleared on app restart) — matches existing `insights` cache pattern
- Navigating away and back shows cached scripts without re-charging

---

## UI States (inside unlocked product section)

| State | Condition | Renders |
|-------|-----------|---------|
| A | `!adCopy && !isGeneratingAdCopy` | Gold gradient "Generate Ad Scripts — 1 credit" button OR insufficient credits warning |
| B | `isGeneratingAdCopy` | ActivityIndicator + "Crafting your ad scripts…" |
| C | `adCopyError === 'generation-failed'` | Error message + Retry link (no credit re-charge) |
| D | `adCopy !== null` | 3 `AdScriptCard` components (TikTok, Meta, Google) |

### AdScriptCard Layout
```
┌──────────────────────────────────────────────┐  ← borderLeftColor = platform color
│ 🎵 TIKTOK                          [share ↗] │
│                                              │
│ "This $12 gadget is going viral for a reason"│  ← headline (bold, white)
│                                              │
│ 2–3 sentences of ad body copy...             │  ← body (muted white)
│                                              │
│ → Shop now before it sells out               │  ← CTA (gold, italic)
└──────────────────────────────────────────────┘
```

Platform colors:
- TikTok → `colors.danger` (red)
- Meta → `colors.metaBlue` (#1877F2)
- Google → `colors.success` (forest green)

Share button opens native OS share sheet via `Share.share()` — no extra package needed.

---

## Gemini Prompt Design

- **Temperature:** 0.3 (deterministic JSON vs 0.7 for narrative insights)
- **Max tokens:** 800 (enough for 3 full scripts)
- **Output contract:** Strict JSON with `{ scripts: [...] }` key, exactly 3 items
- **Validation:** Runtime `.length !== 3` guard before TypeScript cast to prevent crash on partial responses

---

## TypeScript Safety

| Risk | Mitigation |
|------|-----------|
| `scripts` tuple vs array mismatch | Runtime length guard before `as [AdScript, AdScript, AdScript]` cast |
| `CreditTransaction.usdcAmount` required | Set to `0` explicitly (matches `unlockService.ts` pattern) |
| `CreditTransaction.network` required | Set to `'mock'` explicitly |
| `scored` null in retry path | Retry only renders after `adCopy` check; outer `if (!scored)` guard already passed |
| `generateAdCopy` export | Uses `export async function` named export |

---

## Verification

```bash
yarn ts:check             # zero errors
yarn start --reset-cache  # Metro cold start
yarn ios                  # launch on simulator
```

**Test flow:**
1. Open any product with score ≥ 9 (premium)
2. Unlock it (3–5 credits) → balance decrements ✓
3. Scroll to "AI Ad Copy" section → "Generate Ad Scripts — 1 credit" button visible ✓
4. Tap → balance shows −1 in Credits tab ✓
5. Wait ~1–2s → 3 script cards appear (TikTok, Meta, Google) ✓
6. Tap share on any card → native share sheet opens ✓
7. Navigate away and back → scripts still show (cached, no re-charge) ✓
8. Test with 0 credits → insufficient warning + "Buy Credits →" link ✓
9. Simulate Gemini failure (remove API key) → State C renders, retry does not re-charge ✓
