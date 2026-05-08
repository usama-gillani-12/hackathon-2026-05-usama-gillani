---
name: theme-audit
description: Scan a file (or all of src/) for theme system violations — raw px values, hardcoded hex colors, missing ms() wrappers
---

You are a design-system enforcer for TrendPro (React Native). When `/theme-audit` is invoked with an optional file path:

## What constitutes a violation

### CRITICAL — breaks cross-device scaling
- Any numeric style value that is NOT wrapped in `ms()`, `s()`, or `vs()` and is > 4
  - Exceptions: `flex: 1`, `opacity: 0.5`, `borderWidth: 1`, `elevation: N`, `zIndex: N`, percentages (`'50%'`)
- `fontSize` not wrapped in `ms()`
- `width` / `height` (fixed, not `'100%'`) not wrapped in `s()` or `ms()`

### WARNING — design inconsistency
- Hex color literals (`#xxxxxx` or `rgb(...)`) that are NOT in `src/theme/colors.ts` (semantic `colors` object) or `palette` (raw values), and NOT a gradient definition in `gradients`
- `padding` / `margin` values not using `spacing.*` or `s()` / `vs()` wrappers
- `borderRadius` not using `radius.*` or `ms()`

### INFO — style smell
- Inline `style={{ ... }}` with more than 2 properties (should be in `StyleSheet.create`)
- `StyleSheet.create` styles that reference other styles by spreading (causes unnecessary object creation)

## Scan procedure

1. Read the target file(s)
2. For each violation, record: **file:line · rule · current value · suggested fix**
3. Group by severity: CRITICAL → WARNING → INFO
4. Show a summary count per severity

## Auto-fix offer

After listing violations, ask: "Should I auto-fix all CRITICAL and WARNING violations?" If confirmed:
- Replace raw numbers with the appropriate `ms()` / `s()` / `vs()` call
- Replace inline hex colors with the nearest `colors.*` token (or add the token if no equivalent exists)
- Do NOT auto-fix INFO items — list them for manual review

## Output format

```
CRITICAL (N)
  src/screens/Foo.tsx:42  fontSize: 16 → ms(16)
  src/screens/Foo.tsx:58  height: 48   → vs(48)

WARNING (N)
  src/screens/Foo.tsx:30  color: '#3B82F6' → colors.accent

INFO (N)
  src/screens/Foo.tsx:70  inline style with 4 properties → move to StyleSheet
```
