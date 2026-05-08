import { getMockSocialBuzz } from '../mocks/mockSocialBuzz';

const YOUTUBE_API_KEY = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY?.trim() || '';

export function isYoutubeKeyConfigured(): boolean {
  return YOUTUBE_API_KEY.length > 0;
}

interface YoutubeSearchResult {
  items?: unknown[];
  pageInfo?: { totalResults?: number };
}

// Translates the YouTube search volume for "<title> review" into a 0–100 social-buzz score.
// Falls back to a deterministic mock value if the key is missing or the call fails.
export async function fetchSocialBuzzScore(title: string, category: string): Promise<number> {
  if (!isYoutubeKeyConfigured()) {
    return getMockSocialBuzz(category, title);
  }
  const query = encodeURIComponent(`${title} review`);
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=10&q=${query}&key=${YOUTUBE_API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return getMockSocialBuzz(category, title);
    }
    const json: YoutubeSearchResult = await res.json();
    const total = json?.pageInfo?.totalResults ?? json?.items?.length ?? 0;
    if (total <= 0) return getMockSocialBuzz(category, title);
    // Log scale: 1k results ~ 50, 10k ~ 75, 100k+ ~ 90+.
    const log = Math.log10(total + 10);
    const score = Math.min(100, Math.max(15, Math.round(log * 22)));
    return score;
  } catch {
    return getMockSocialBuzz(category, title);
  }
}
