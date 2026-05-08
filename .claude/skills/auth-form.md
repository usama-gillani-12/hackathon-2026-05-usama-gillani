---
name: auth-form
description: Audit or update TrendPro auth form validation — react-hook-form + yup schemas, field-level UX, and Supabase error mapping
---

You are a senior React Native engineer working on TrendPro's authentication screens.

When `/auth-form` is invoked with argument `login`, `signup`, or `both`:

## Files to read first
- `src/screens/auth/LoginScreen.tsx`
- `src/screens/auth/SignupScreen.tsx`
- `src/stores/useAuthStore.ts` — contains `mapAuthError()` for Supabase error mapping

## Validation stack

TrendPro uses **react-hook-form** + **yup** + **@hookform/resolvers**.

```
mode: 'onTouched'   → validates on first blur per field, then live on change
```

### Login schema (yup)
```ts
email:    required · .email()
password: required · .min(6)
```

### Signup schema (yup)
```ts
name:            required · .min(2) · letters/spaces/hyphens/apostrophes only
email:           required · .email()
password:        required · .min(8) · must contain letter · must contain number
confirmPassword: required · .oneOf([ref('password')], 'Passwords do not match')
```

## UX rules

### Field-level errors
- Show error text **below** the input (`styles.fieldError`) — never only in a top banner
- `inputRowError` style (red border + red-tinted background) on the `View` wrapping the `TextInput` when `errors.fieldName` exists
- Error text clears as soon as the user fixes the field (onTouched mode handles this)

### Server errors (Supabase)
- Shown in `errorBanner` above the CTA button
- Map raw Supabase messages via `mapAuthError()` in `useAuthStore.ts`:
  | Raw message (contains) | User-friendly message |
  |---|---|
  | invalid login credentials / invalid credentials | Incorrect email or password. Please try again. |
  | email not confirmed | Please confirm your email address before signing in. |
  | user already registered / already registered | An account with this email already exists. Try signing in instead. |
  | too many requests / rate limit | Too many attempts. Please wait a moment and try again. |
  | weak password | Password is too weak. Use at least 8 characters with a mix of letters and numbers. |
  | network / fetch / failed to fetch | Network error. Check your connection and try again. |
- Server errors clear when user starts typing in any field (`setServerError(null)` in `onChangeText`)

### Focus / border states (priority order, highest wins)
1. `inputRowError` — red border when `errors.field` exists
2. `inputRowFocused` — blue glow when focused
3. `inputRowSuccess` — green border (confirm password only, when match + no error)
4. Default — dim border

### Password strength meter (signup only)
- Shown between password input and its error text
- Only visible when `!errors.password` (hide meter while there's a format error)
- `weak` (1 bar, red) / `fair` (2 bars, amber) / `strong` (3 bars, green)

### Confirm password match indicator
- `✓ Passwords match` in `styles.successText` (green) when `watchedConfirm.length > 0 && passwords equal && !errors.confirmPassword`

## What to check / fix in an audit

1. **Schema coverage** — are all fields validated? Are messages specific enough?
2. **Mode** — must be `onTouched` (not `onChange` which fires on every keystroke from the start, not `onSubmit` which only fires late)
3. **Field errors rendering** — every `<Controller>` must render `{errors.field && <Text style={styles.fieldError}>{errors.field.message}</Text>}`
4. **inputRowError style** — must be applied to the input container `View`, not the `TextInput` itself
5. **Server error mapping** — `mapAuthError()` in `useAuthStore.ts` must cover all Supabase error patterns
6. **Server error clearing** — `setServerError(null)` must be called inside `onChangeText` handlers
7. **Form submission** — button must call `handleSubmit(onSubmit)`, not call `onSubmit` directly (bypasses validation)
8. **Keyboard submit** — last field's `onSubmitEditing` must also call `handleSubmit(onSubmit)`

## Output format

For an **audit**: numbered issue list with file:line, severity (critical/warn/style), problem, fix.
For an **update**: implement the fix inline, then summarise what changed.
