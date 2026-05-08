import { HN_ALGOLIA_URL } from '../constants';
import { TrendingPost } from '../types/market';

// Maps title keywords → human-readable category label
const CATEGORY_RULES: Array<{ keywords: string[]; label: string }> = [
  { keywords: ['ai', 'gpt', 'llm', 'ml', 'machine learning', 'openai', 'claude', 'gemini'], label: 'AI / Tech' },
  { keywords: ['amazon', 'shopify', 'ecommerce', 'e-commerce', 'dropship', 'fba'], label: 'E-Commerce' },
  { keywords: ['saas', 'startup', 'b2b', 'api', 'dashboard', 'analytics'], label: 'SaaS' },
  { keywords: ['app', 'mobile', 'ios', 'android', 'react native'], label: 'Mobile' },
  { keywords: ['product', 'launch', 'built', 'made', 'created', 'open source'], label: 'Product Launch' },
];

function detectCategory(title: string): string {
  const lower = title.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) return rule.label;
  }
  return 'Trending';
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diffMs / 3_600_000);
  if (hrs < 1) return 'just now';
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

interface HNHit {
  objectID: string;
  title?: string;
  story_title?: string;
  url?: string;
  points?: number;
  num_comments?: number;
  author?: string;
  created_at?: string;
}

export async function fetchTrendingPosts(): Promise<TrendingPost[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    // "Show HN" stories from the last 30 days, sorted newest-first
    const since = Math.floor((Date.now() - 30 * 24 * 3_600_000) / 1000);
    const res = await fetch(
      `${HN_ALGOLIA_URL}/search_by_date?query=show+hn&tags=story&hitsPerPage=8&numericFilters=points%3E5,created_at_i%3E${since}`,
      { signal: controller.signal },
    );
    if (!res.ok) throw new Error(`HN Algolia ${res.status}`);

    const data = await res.json();
    const hits: HNHit[] = data?.hits ?? [];

    return hits
      .filter((h) => h.title || h.story_title)
      .map((h) => {
        const title = (h.title ?? h.story_title ?? '').replace(/^Show HN:\s*/i, '');
        const createdAt = h.created_at ?? new Date().toISOString();
        const ageMs = Date.now() - new Date(createdAt).getTime();
        const points = h.points ?? 0;
        return {
          id: h.objectID,
          title,
          url: h.url ?? `https://news.ycombinator.com/item?id=${h.objectID}`,
          points,
          comments: h.num_comments ?? 0,
          author: h.author ?? '',
          createdAt: timeAgo(createdAt),
          category: detectCategory(title),
          isNew: ageMs < 86_400_000,   // < 24 hrs
          isHot: points > 100,
        };
      });
  } finally {
    clearTimeout(timeout);
  }
}
