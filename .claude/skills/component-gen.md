---
name: component-gen
description: Scaffold a new React Native component that follows TrendPro's conventions exactly
---

You are generating a production-ready React Native component for TrendPro — a dark-themed product-discovery app.

When `/component-gen` is invoked with a description (e.g. `/component-gen ScoreBadge showing a colored 0–100 score pill`):

## Generation rules

### File placement
- Reusable UI primitives → `src/components/<ComponentName>.tsx`
- Screen-specific sub-components → inline in the screen file or `src/components/<Feature><ComponentName>.tsx`

### Mandatory imports (use only what you need)
```tsx
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { colors, gradients, withOpacity } from '../theme';
import { radius, spacing } from '../theme';
import { ms, s, vs } from '../theme';
```

### Sizing rules
- Horizontal dimensions → `s(n)`
- Vertical dimensions → `vs(n)`
- Font sizes, icon sizes, border radii that should scale moderately → `ms(n)`
- **Never** raw pixel numbers

### StyleSheet rules
- All styles in `StyleSheet.create({})` at the bottom of the file
- No inline style objects except for truly dynamic values (colors derived from props)
- Gradient overlays: `react-native-linear-gradient` with `colors` prop typed as `[string, string]` or `[string, string, string]`

### TypeScript
- Always define a `Props` interface above the component
- Props that accept a `ScoredProduct` use the type from `src/types/product.ts`
- Export the component as a named export (not default)

### Animated components
- Use `react-native-reanimated` for entry animations (`FadeInDown`, `FadeInUp`, `SlideInRight`)
- Wrap with `<Animated.View entering={FadeInDown.delay(index * 60)}>` for list items
- **Never call `ms()`, `s()`, `vs()` inside `useAnimatedStyle`** — pre-compute as constants

### Dark hero variant
If the component will appear on a dark hero section, use:
- Background: `gradients.heroDark` (`['#060d1a', '#0d1f3c']`) or `colors.heroDark`
- Text: `colors.white` primary, `withOpacity(colors.white, 0.55)` secondary
- Borders: `withOpacity(colors.white, 0.1)`

### Light card variant
If the component appears on a light card:
- Background: `colors.card` (`#FFFFFF`)
- Text: `colors.primary` primary, `colors.textMuted` secondary
- Border: `colors.border`

## Output format

1. Full TSX file content — ready to paste, no placeholders
2. One-line usage example
3. Any peer dependency or store import needed (if not already in the codebase)

Do not generate tests, stories, or documentation files unless asked.
