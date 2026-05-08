import { REDDIT_BASE_URL } from '../constants';
import { MarketPulseItem } from '../types/market';

const CATEGORY_CONFIG = [
  { category: 'Electronics', subreddit: 'gadgets', emoji: '📱' },
  { category: 'Beauty', subreddit: 'SkincareAddiction', emoji: '💄' },
  { category: 'Kitchen', subreddit: 'Cooking', emoji: '🍳' },
  { category: 'Fitness', subreddit: 'fitness', emoji: '💪' },
  { category: 'Pet Supplies', subreddit: 'Pets', emoji: '🐾' },
  { category: 'Fashion', subreddit: 'streetwear', emoji: '👗' },
] as const;

// Log-scale normalization: maps raw Reddit upvote counts to 0–100.
// ceiling=50000 means a post with 50k+ upvotes scores 100.
function logNormalize(value: number, ceiling = 50000): number {
  if (value <= 0) return 0;
  return Math.min(100, Math.round((Math.log10(value + 1) / Math.log10(ceiling)) * 100));
}

async function fetchCategoryPulse(
  config: (typeof CATEGORY_CONFIG)[number],
  signal: AbortSignal,
): Promise<MarketPulseItem> {
  const res = await fetch(
    `${REDDIT_BASE_URL}/r/${config.subreddit}/hot.json?limit=10&raw_json=1`,
    { headers: { 'User-Agent': 'TrendPro/1.0' }, signal },
  );
  if (!res.ok) throw new Error(`Reddit r/${config.subreddit} ${res.status}`);

  const data = await res.json();
  const posts: any[] = (data?.data?.children ?? [])
    .slice(0, 5)
    .map((c: any) => c.data)
    .filter((p: any) => !p.stickied); // skip pinned mod posts

  if (posts.length === 0) throw new Error('No posts');

  const rawScores: number[] = posts.map((p) => Math.max(0, p.score as number));
  const maxRaw = Math.max(...rawScores, 1);

  // Sparkline: 5 bars, each scaled to the highest post in this category
  const bars = rawScores.map((s) => Math.round((s / maxRaw) * 100));

  // Momentum score: log-normalized average upvotes
  const avg = rawScores.reduce((a, b) => a + b, 0) / rawScores.length;
  const score = logNormalize(avg);

  // Trend: derived from top post's upvote ratio (quality signal)
  // upvote_ratio 0.7 → 0%, 0.85 → +15%, 0.95 → +25%
  const topRatio: number = posts[0]?.upvote_ratio ?? 0.8;
  const trendPct = Math.round((topRatio - 0.7) * 100);
  const trend = trendPct >= 0 ? `+${trendPct}%` : `${trendPct}%`;

  // Hot if strong engagement or very high community agreement
  const hot = score >= 72 || topRatio > 0.92;

  return { category: config.category, score, trend, hot, emoji: config.emoji, bars };
}

// ── Per-category Reddit buzz (used by scoring engine) ─────────────────────────

// Extended mapping covers all product categories in the scoring engine
const PRODUCT_CATEGORY_SUBREDDIT: Record<string, string> = {
  electronics: 'gadgets',
  smartphones: 'gadgets',
  laptops: 'gadgets',
  beauty: 'SkincareAddiction',
  fragrances: 'fragrance',
  kitchen: 'Cooking',
  'kitchen-accessories': 'Cooking',
  fitness: 'fitness',
  pets: 'Pets',
  baby: 'beyondthebump',
  'home-decoration': 'malelivingspace',
  lighting: 'malelivingspace',
  furniture: 'malelivingspace',
  'mens-shirts': 'streetwear',
  'mens-shoes': 'streetwear',
  'womens-dresses': 'femalefashionadvice',
  'womens-shoes': 'femalefashionadvice',
  'womens-bags': 'femalefashionadvice',
  automotive: 'cars',
  motorcycle: 'motorcycles',
  groceries: 'EatCheapAndHealthy',
  'health-care': 'Supplements',
  general: 'flipping',
};

// Session-scoped cache: normalized category → 0-100 score.
// Avoids re-fetching the same subreddit for every product in a category.
const redditBuzzCache = new Map<string, number>();

export async function fetchRedditBuzzByCategory(category: string): Promise<number> {
  const cat = (category ?? 'general').toLowerCase();
  if (redditBuzzCache.has(cat)) return redditBuzzCache.get(cat)!;

  const subreddit = PRODUCT_CATEGORY_SUBREDDIT[cat] ?? 'flipping';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(
      `${REDDIT_BASE_URL}/r/${subreddit}/hot.json?limit=5&raw_json=1`,
      { headers: { 'User-Agent': 'TrendPro/1.0' }, signal: controller.signal },
    );
    if (!res.ok) {
      redditBuzzCache.set(cat, 50);
      return 50;
    }

    const data = await res.json();
    const posts: any[] = (data?.data?.children ?? [])
      .slice(0, 5)
      .map((c: any) => c.data)
      .filter((p: any) => !p.stickied);

    if (posts.length === 0) {
      redditBuzzCache.set(cat, 50);
      return 50;
    }

    const rawScores: number[] = posts.map((p) => Math.max(0, p.score as number));
    const avg = rawScores.reduce((a, b) => a + b, 0) / rawScores.length;
    const score = logNormalize(avg);

    redditBuzzCache.set(cat, score);
    return score;
  } catch {
    redditBuzzCache.set(cat, 50);
    return 50;
  } finally {
    clearTimeout(timeout);
  }
}

// ── Static fallback used when Reddit is unreachable
export const MARKET_PULSE_FALLBACK: MarketPulseItem[] = [
  { category: 'Electronics', score: 84, trend: '+12%', hot: true,  emoji: '📱', bars: [40, 55, 48, 70, 84] },
  { category: 'Beauty',       score: 91, trend: '+28%', hot: true,  emoji: '💄', bars: [60, 72, 68, 85, 91] },
  { category: 'Kitchen',      score: 76, trend: '+8%',  hot: false, emoji: '🍳', bars: [65, 60, 70, 72, 76] },
  { category: 'Fitness',      score: 88, trend: '+19%', hot: true,  emoji: '💪', bars: [50, 65, 72, 80, 88] },
  { category: 'Pet Supplies', score: 79, trend: '+11%', hot: false, emoji: '🐾', bars: [60, 65, 72, 75, 79] },
  { category: 'Fashion',      score: 72, trend: '+5%',  hot: false, emoji: '👗', bars: [65, 68, 66, 70, 72] },
];

export async function fetchMarketPulse(): Promise<MarketPulseItem[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const results = await Promise.allSettled(
      CATEGORY_CONFIG.map((c) => fetchCategoryPulse(c, controller.signal)),
    );

    const items: MarketPulseItem[] = results.map((r, i) => {
      if (r.status === 'fulfilled') return r.value;
      // Individual category failed — fall back to static entry for that slot
      return MARKET_PULSE_FALLBACK[i];
    });

    return items;
  } finally {
    clearTimeout(timeout);
  }
}
