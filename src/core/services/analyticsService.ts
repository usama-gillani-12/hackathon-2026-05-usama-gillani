import { posthog } from '@core/lib/posthog';

export const analytics = {
  identify(userId: string, traits?: Record<string, string>) {
    posthog.identify(userId, traits);
  },

  reset() {
    posthog.reset();
  },

  screen(name: string) {
    posthog.screen(name);
  },

  // ── Auth ──────────────────────────────────────────────────────────────────
  userSignedIn(userId: string, email: string) {
    posthog.identify(userId, { email });
    posthog.capture('user_signed_in', { email });
  },

  userSignedUp(userId: string, email: string, fullName: string) {
    posthog.identify(userId, { email, name: fullName });
    posthog.capture('user_signed_up', { email, full_name: fullName });
  },

  userSignedOut() {
    posthog.capture('user_signed_out');
    posthog.reset();
  },

  // ── Products ──────────────────────────────────────────────────────────────
  productViewed(productId: string, productTitle: string, score: number) {
    posthog.capture('product_viewed', { product_id: productId, product_title: productTitle, score });
  },

  productUnlocked(productId: string, productTitle: string, cost: number) {
    posthog.capture('product_unlocked', {
      product_id: productId,
      product_title: productTitle,
      credits_spent: cost,
    });
  },

  // ── Watchlist ─────────────────────────────────────────────────────────────
  productWatchlisted(productId: string) {
    posthog.capture('product_watchlisted', { product_id: productId });
  },

  productUnwatchlisted(productId: string) {
    posthog.capture('product_unwatchlisted', { product_id: productId });
  },

  // ── Credits ───────────────────────────────────────────────────────────────
  creditsPurchased(packageId: string, credits: number, usdcAmount: number) {
    posthog.capture('credits_purchased', {
      package_id: packageId,
      credits,
      usdc_amount: usdcAmount,
    });
  },

  // ── Discovery ─────────────────────────────────────────────────────────────
  searchPerformed(query: string, resultCount: number) {
    posthog.capture('search_performed', { query, result_count: resultCount });
  },
};
