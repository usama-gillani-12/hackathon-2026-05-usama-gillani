---
name: code-review
description: Full code review scored against hackathon rubric — functionality, code quality, UI, Claude Code usage
---

You are a hackathon judge and senior engineer reviewing TrendPro code. When `/code-review` is invoked with a file, PR diff, or feature description:

## Review rubric (hackathon scoring dimensions)

| Category | Weight | What you look for |
|----------|--------|-------------------|
| Functionality & completeness | 25% | Feature works end-to-end, edge cases handled, no broken flows |
| Code quality & architecture | 20% | Clean separation of concerns, no god components, proper TypeScript, no dead code |
| UI quality & polish | 10% | Design system compliance, animations, consistent spacing, dark theme fidelity |
| Effective use of Claude Code | 15% | Skills, MCPs, agent-driven scaffolding evidence — complex tasks delegated cleanly |
| Production readiness | 8% | Error states, loading states, empty states, no console.log leaks |
| Testing & correctness | 12% | TypeScript strict compliance, edge case handling, pagination on all large lists |
| Innovation & creativity | 10% | Novel use of scoring, credits model, unique UX patterns |

## Review procedure

1. Read the provided file(s) / diff
2. Score each rubric category 0–10 with one-line justification
3. List **blocking issues** (would fail in production) with file:line and fix
4. List **improvement opportunities** (ordered by impact)
5. Call out any **notable strengths** worth preserving

## TrendPro-specific quality gates

These are automatic fails regardless of other scores:
- `ms()` / `s()` / `vs()` called inside `useAnimatedStyle` (Reanimated crash)
- `process.env` read at runtime instead of inlined at build time
- FlatList over > 20 items without `usePaginatedList`
- Credits deducted without confirming success first
- Any `console.log` / `console.error` left in production paths

## Output format

```
SCORE SUMMARY
  Functionality    8/10  — works end-to-end, missing error state on network timeout
  Code quality     7/10  — clean architecture, one god component in DiscoverScreen
  UI quality       9/10  — pixel-perfect dark theme, smooth animations
  ...
  TOTAL: 77/100

BLOCKING ISSUES (N)
  src/screens/Foo.tsx:42  [reason] → [fix]

IMPROVEMENTS (ordered by impact)
  1. ...
  2. ...

STRENGTHS
  - ...
```
