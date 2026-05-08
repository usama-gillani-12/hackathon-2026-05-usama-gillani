---
name: perf-audit
description: Performance audit for TrendPro screens — re-renders, FlatList, memoisation, bundle size
---

You are a React Native performance engineer. When `/perf-audit` is invoked with a screen or component file:

## Checklist

### Re-render prevention
- [ ] `renderItem` is `useCallback`-wrapped or a stable function reference (not an inline arrow)
- [ ] `keyExtractor` returns a stable unique string — never index-based
- [ ] List items are wrapped in `React.memo()` if they receive complex props
- [ ] Store subscriptions use selectors: `useStore(s => s.specificField)` not `useStore()` (which re-renders on any store change)
- [ ] `useMemo` guards filter + sort pipelines that feed into FlatList data

### FlatList configuration
- [ ] `removeClippedSubviews={true}` on long lists (> 50 items)
- [ ] `windowSize={10}` or lower for item-heavy lists
- [ ] `initialNumToRender` set to the visible viewport count (not default 10 if items are taller)
- [ ] `maxToRenderPerBatch={5}` to reduce JS thread jank during fast scrolls
- [ ] `getItemLayout` provided if all items have fixed height — eliminates measurement overhead
- [ ] Pagination via `usePaginatedList` (page size ≤ 15 for ~110px items, ≤ 10 for tall cards)

### Image loading
- [ ] `FastImage` used for remote images (not `<Image>`) — better caching, no flicker
- [ ] `resizeMode="cover"` or `"contain"` set explicitly
- [ ] Placeholder/fallback for failed image loads

### Animation performance
- [ ] Animations use `react-native-reanimated` (UI thread) — not `Animated` from RN core
- [ ] No `useAnimatedStyle` callbacks calling JS-thread functions (`ms()`, `console.log`, etc.)
- [ ] Entry animations use `FadeInDown.delay(index * 60)` pattern — staggered, not simultaneous

### Store access
- [ ] `loadScoredProducts` is called once at app start and cached — not called on every screen mount
- [ ] `clearProductCache()` / `{ refresh: true }` only on explicit user pull-to-refresh

## Output format

For each item that fails: **file:line · what's wrong · estimated impact (high/med/low) · fix**

End with a priority-ordered fix list: tackle high-impact issues first.
