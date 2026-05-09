import { REDDIT_TRENDING_URL } from '@constants';
import { TrendingPost } from '@t/market';

const SUBREDDIT_LABELS: Record<string, string> = {
  shutupandtakemymoney: 'Must Have',
  ineeeedit: 'Trending Find',
  didntknowiwantedthat: 'Discovery',
  buyitforlife: 'Built to Last',
};

function categoryFromSubreddit(sub: string): string {
  return SUBREDDIT_LABELS[sub.toLowerCase()] ?? 'Trending';
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diffMs / 3_600_000);
  if (hrs < 1) return 'just now';
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

interface RedditChildData {
  id: string;
  title: string;
  url_overridden_by_dest?: string;
  permalink: string;
  ups: number;
  num_comments: number;
  author: string;
  created_utc: number;
  subreddit: string;
  is_self: boolean;
  over_18: boolean;
}

interface RedditChild {
  data: RedditChildData;
}

export async function fetchTrendingPosts(): Promise<TrendingPost[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(`${REDDIT_TRENDING_URL}?t=week&limit=25`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'TrendPro/1.0',
        Accept: 'application/json',
      },
    });
    if (!res.ok) throw new Error(`Reddit ${res.status}`);

    const data = await res.json();
    const children: RedditChild[] = data?.data?.children ?? [];

    return children
      .map((c) => c.data)
      .filter((d) => d && !d.is_self && !d.over_18)
      .filter((d) => {
        const url = d.url_overridden_by_dest ?? '';
        return url && !url.includes('reddit.com');
      })
      .slice(0, 8)
      .map((d) => {
        const createdAt = new Date(d.created_utc * 1000).toISOString();
        const ageMs = Date.now() - new Date(createdAt).getTime();
        const ups = d.ups ?? 0;
        return {
          id: d.id,
          title: d.title,
          url: d.url_overridden_by_dest ?? `https://reddit.com${d.permalink}`,
          points: ups,
          comments: d.num_comments ?? 0,
          author: d.author ?? '',
          createdAt: timeAgo(createdAt),
          category: categoryFromSubreddit(d.subreddit),
          isNew: ageMs < 86_400_000,
          isHot: ups > 500,
        };
      });
  } finally {
    clearTimeout(timeout);
  }
}
