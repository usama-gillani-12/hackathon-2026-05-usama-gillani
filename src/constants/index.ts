// ─── Scoring ──────────────────────────────────────────────────────────────────
export const SCORE_WEIGHTS = {
  demand: 0.25,
  socialBuzz: 0.20,
  profitPotential: 0.20,
  rating: 0.15,
  shippingEase: 0.10,
  competition: 0.05,
  risk: 0.05,
} as const;

export const PREMIUM_THRESHOLD = 9;
export const UNLOCK_COST_9 = 3;
export const UNLOCK_COST_10 = 5;

// ─── Pagination ───────────────────────────────────────────────────────────────
export const PAGE_SIZE_PRODUCTS = 15;
export const PAGE_SIZE_WATCHLIST = 10;
export const PAGE_SIZE_TRANSACTIONS = 20;
export const PAGE_SIZE_DISCOVER = 12;

// ─── Payment / credits ────────────────────────────────────────────────────────
export const MOCK_PAYMENT_LATENCY_MS = 1400;

// ─── Cache ────────────────────────────────────────────────────────────────────
export const PRODUCT_CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

// ─── UI timing ────────────────────────────────────────────────────────────────
export const SKELETON_MIN_SHOW_MS = 400;
export const TOAST_DURATION_MS = 3000;

// ─── API ──────────────────────────────────────────────────────────────────────
export const RAPIDAPI_HOST = 'real-time-amazon-data.p.rapidapi.com';
export const DUMMYJSON_BASE_URL = 'https://dummyjson.com';
export const FAKESTORE_BASE_URL = 'https://fakestoreapi.com';
export const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';

// ─── Deep-link / navigation ───────────────────────────────────────────────────
export const APP_SCHEME = 'trendpro';
