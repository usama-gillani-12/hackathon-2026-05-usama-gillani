# TrendPro — Hackathon Reflection

**Hackathon:** Let's AI Hackathon · May 7–9 2026  
**Project:** TrendPro — AI-powered dropshipping product intelligence  
**Builder:** Solo build · React Native CLI + Claude Code

---

## What Went Well

**The scoring engine came together faster than expected.** Describing the 7-dimension formula with exact weights and output shape in a single prompt produced a working `buildScore()` function on the first attempt. This was the most technically complex piece and it needed the least iteration — clear proof that upfront spec clarity is the biggest time multiplier.

**The service layer abstraction paid off immediately.** Defining `PaymentService` as an interface before writing `MockPaymentService` meant every screen that handles credits is already wired for production. Swapping in a real payment provider post-hackathon requires zero screen changes. This kind of architecture-first thinking, enforced through prompts, produced genuinely production-ready code.

**Mock data as a first-class concern.** Prepending `mockProducts` to the feed before live API results meant the app always looked great during development — no "empty state because the API is down" frustration. This kept momentum high across all three days.

**Claude Code's plan mode caught one critical wrong turn.** During the navigation setup, the initial plan had `DrawerNavigator` wrapping `BottomTabNavigator` incorrectly — the drawer would have hidden the tab bar. Plan mode surfaced this in 2 minutes rather than 2 hours of debugging. The hackathon rule "plan mode for any task > 30 min" is not optional advice — it's a time-save guarantee.

---

## What I'd Do Differently

**Write CLAUDE.md before touching any code.** Even with prior knowledge of this rule, the CLAUDE.md was written alongside the first code files rather than as the absolute first file. The architectural decisions in CLAUDE.md shape every prompt that follows — it should be prompt zero.

**Break the product detail screen into smaller prompts.** The first attempt at the product detail screen was a single large prompt that produced a monolith. Splitting into (layout → state → premium lock → animations) would have been faster and produced cleaner separations.

**Log prompts in real time.** The prompt log was reconstructed from memory at the end of Day 1 rather than logged as each prompt was written. Real-time logging would have captured the exact phrasing of the prompts that worked — the reconstructions are close but not exact.

---

## Biggest Claude Code Insight

**Constraints are instructions.** Every constraint you give Claude — "pure function," "no side effects," "import from theme not hardcoded," "reset on source reference change" — is code Claude writes for you. Constraints don't limit Claude; they focus it. A prompt with 3 constraints produces better code than a prompt with 0 constraints and 3 paragraphs of context.

The inverse is also true: vague prompts ("make it look better," "design the architecture") produce the most average answer Claude can give, not the right answer for this specific project.

---

## Would I Use This Workflow Again?

Yes, without hesitation — with one adjustment: treat the prompt as the design document. In a normal dev workflow, a design doc comes first and code comes second. With Claude Code, the prompt IS the design doc. Time invested sharpening a prompt before sending it returns 3–5× in implementation quality and iteration speed.

The multi-loop pattern (Plan → Code → Audit → Test → QA → Multi-role review) felt heavyweight before Day 1. By Day 2 it felt essential. The audit loop in particular caught three type errors and one missing guard clause that a code reviewer would have flagged in a PR review — except it caught them in seconds, not 24 hours later.

**TrendPro in 3 days would have taken 3 weeks solo-coding without Claude Code.** That is not an exaggeration.
