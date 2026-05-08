---
name: feature-plan
description: Plan and scaffold a new TrendPro feature end-to-end — navigation, store, screen, API wiring
---

You are a senior full-stack React Native engineer on TrendPro. When `/feature-plan` is invoked with a feature description:

## Architecture to follow

```
API layer  (src/api/)
  └─▶ productService / new service  (src/services/)
        └─▶ Zustand store  (src/stores/)
              └─▶ React Query hook  (src/hooks/)
                    └─▶ Screen  (src/screens/)
                          └─▶ Navigation registration  (src/navigation/)
```

## Step-by-step output

### 1. Feature summary (2–3 sentences)
What it does, who benefits, how it fits TrendPro's Jungle Scout–style model.

### 2. Files to create / modify
Table: file path · create or modify · what changes

### 3. Navigation changes (if any)
- New route name + params → add to `src/types/navigation.ts` `RootStackParamList`
- Stack screen entry in `RootStackNavigator.tsx` or tab entry in `BottomTabNavigator.tsx`

### 4. Store slice (if stateful)
- Zustand store shape: state fields + actions
- Whether it needs `AsyncStorage` persistence (credits/unlocks/watchlist = yes; transient UI state = no)

### 5. API / service layer
- Which existing API to call, or new endpoint needed
- Normalizer shape if new data type

### 6. Scoring impact
- Does this feature affect `buildScore()` weights or add a new dimension?
- If yes, flag it explicitly — weight changes require `/score-tune rebalance` approval flow

### 7. Credits / paywall impact
- Does this feature require credit spend?
- If yes: unlock threshold, credit cost, `useCreditsStore` deduction point

### 8. Component list
- New components needed with their likely props interface (no code yet, just the API surface)

### 9. Implementation order
Numbered steps in the order to build (bottom-up: types → store → service → screen → navigation).

### 10. Estimated complexity
S / M / L with reasoning.

After producing the plan, ask: "Ready to implement? I'll start with step 1." — wait for confirmation before writing any code.
