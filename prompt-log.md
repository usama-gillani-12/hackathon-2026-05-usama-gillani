# TrendPro — Prompt Log

**Hackathon:** Let's AI Hackathon · May 7–9 2026  
**Format:** Each entry has the prompt (or paraphrase), what worked/failed, and the lesson.

---

## 5 Best Prompts

---

### BEST-01 · Scoring engine scaffold

**Prompt:**
> "Build `scoringService.ts` with a `buildScore(product, { socialBuzz })` pure function. It must compute 7 dimensions: Demand (25%), Social Buzz (20%), Profit Potential (20%), Product Rating (15%), Shipping Ease (10%), Competition inverted (5%), Risk inverted (5%). Use lookup tables for competition/shipping/risk keyed by category string. Output a `ScoredProduct` type with winningScore (0-100), rating10 (1-10), recommendation enum, isPremium flag, unlockCost, bestAudience, bestAdAngle, aiSummary, whyTrending, risksToWatch. Make it pure — no side effects, no imports from React."

**Why it worked:**
- Gave Claude the exact weight breakdown upfront — no ambiguity
- Specified the output type completely before asking for the implementation
- Explicitly said "pure function, no side effects" which prevented unwanted store imports
- Naming the lookup table pattern meant Claude organised the code exactly as intended

**Result:** First-try working implementation. Zero back-and-forth on structure.

**Lesson:** For complex pure logic, spec the output shape and constraints before describing the algorithm. Claude builds toward the destination, not through exploration.

---

### BEST-02 · Navigation tree with conditional routing

**Prompt:**
> "Create `AppNavigator.tsx` using React Navigation v6. Rules: (1) if `useSettingsStore.onboardingComplete` is false, show OnboardingScreen; (2) if Supabase session is null, show AuthNavigator; (3) otherwise show RootStackNavigator. Use a fade animation between root screens. Show ActivityIndicator on `colors.background` while stores are hydrating (`hydrated` and `authInitialized` flags). Import stores from Zustand, not context."

**Why it worked:**
- The three conditional routing rules were numbered and ordered — Claude implemented them in exactly that priority
- Specifying the loading state behaviour prevented a blank flash bug
- Naming the store flags exactly (`hydrated`, `authInitialized`) eliminated guessing

**Lesson:** For navigation logic, write the routing rules as a numbered priority list. Claude treats them as an if/else chain in that exact order.

---

### BEST-03 · Mock data generation

**Prompt:**
> "Generate 8 mock `Product[]` entries for `src/mocks/mockProducts.ts`. Each should represent a different winning dropshipping niche: at least 1 pet product, 1 beauty, 1 kitchen gadget, 1 fitness, 1 home decor. Give each realistic Amazon-style data: title, price ($8–$85), rating (3.8–4.9), stock (50–1500), discountPercent (10–40), category matching the scoring engine lookup keys. IDs must be strings starting with 'mock-'. Export as `export const mockProducts: Product[]`."

**Why it worked:**
- Named the exact niches required instead of saying "make them varied"
- Gave price, rating, stock, and discount ranges so the scores would be interesting
- Specified that category strings must match the scoring engine lookup keys — prevented a subtle mismatch bug
- The ID prefix requirement made mock vs. live data easy to distinguish in debugging

**Lesson:** When generating test data, specify the constraints that matter to downstream logic (category key matching, ID format). Generic "make it realistic" produces generic data that breaks things.

---

### BEST-04 · Pagination hook

**Prompt:**
> "Create `src/hooks/usePaginatedList.ts`. It's a generic hook: `usePaginatedList<T>(source: T[], pageSize: number)`. Internally tracks `page` (starts at 1). Returns `{ items: T[], total: number, hasMore: boolean, isLoadingMore: boolean, loadMore: () => void }`. `items` is `source.slice(0, page * pageSize)`. `loadMore` increments page but sets `isLoadingMore` to true for 1 tick. Reset page to 1 whenever `source` reference changes (use useEffect with source as dep). Export the hook."

**Why it worked:**
- The entire algorithm was described in 4 sentences — page tracking, slice formula, loadMore behaviour, reset trigger
- Specifying "1 tick" for `isLoadingMore` set clear expectations on the async behaviour
- The source reference change reset was explicitly called out — this is the subtle behaviour that prevents stale pagination after filter changes

**Lesson:** For hooks with non-obvious state transitions, describe each transition explicitly rather than the overall goal. The tricky parts are the transitions, not the happy path.

---

### BEST-05 · Auth form with field-level validation

**Prompt:**
> "Build `LoginScreen.tsx` with react-hook-form + yup. Schema: email (required, valid email format), password (required, min 6 chars). Mode: `onTouched`. Show field-level errors as small red text below each input — not a banner. Input border: blue on focus, red if error, green on success. Map Supabase errors to human-friendly messages via `mapAuthError()` in `useAuthStore` — show as a red banner above the CTA. Clear server errors when user types in any field. Dark gradient background matching `gradients.heroDark`."

**Why it worked:**
- Each UI behaviour was stated as a rule: border states, error location, banner vs. field error distinction
- The Supabase error mapping was delegated to an already-planned store function — Claude respected the boundary
- "Clear server errors when user types" is the kind of UX detail that gets forgotten — stating it explicitly baked it in

**Lesson:** Form UX has many invisible details (when errors appear/clear, where they live, what colours signal what). State every rule explicitly — Claude won't invent good UX defaults on its own.

---

## 3 Worst Prompts

---

### WORST-01 · Vague "make it look good"

**Prompt:**
> "Make the dashboard screen look better."

**What failed:**
Claude changed font sizes, added arbitrary padding, and swapped colors that broke the theme system. None of the changes matched the actual design tokens. Had to revert and write a specific `/ui-review` prompt instead.

**Lesson:** Visual improvement prompts must reference specific components, specific issues, and specific token names. "Look better" means nothing without a baseline and target.

---

### WORST-02 · Asking Claude to design the architecture from scratch

**Prompt:**
> "Design the state management for TrendPro."

**What failed:**
Claude proposed Redux Toolkit with RTK Query — a perfectly reasonable answer to the question, but the wrong one for this project. It took two follow-up prompts to redirect to Zustand. The architectural decision should have been made by the human first and handed to Claude to implement.

**Lesson:** Never ask Claude to make architectural decisions — give it the decision and ask for implementation. Claude optimises for common patterns, not project-specific constraints.

---

### WORST-03 · Multi-concern single prompt

**Prompt:**
> "Build the entire product detail screen including score breakdown, AI summary, test plan, premium lock, and unlock flow with credits."

**What failed:**
Claude produced a 400-line monolith with hardcoded colors, missing error states, and the unlock logic tangled into the UI component. It took longer to untangle than if each concern had been its own prompt.

**Lesson:** One prompt = one concern. Break complex screens into: (1) layout + static data, (2) state wiring, (3) premium/lock logic, (4) animations. Sequential focused prompts produce cleaner code than a single mega-prompt.
