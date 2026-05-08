// Deterministic social-buzz scores (0–100) keyed by category for consistent demo runs.
// Used as the fallback when no YouTube API key is configured.
const CATEGORY_BUZZ: Record<string, number> = {
  pets: 88,
  electronics: 80,
  beauty: 92,
  fragrances: 70,
  groceries: 35,
  furniture: 55,
  smartphones: 78,
  laptops: 60,
  tablets: 55,
  'mens-shirts': 50,
  'mens-shoes': 65,
  'mens-watches': 60,
  'womens-bags': 78,
  'womens-dresses': 80,
  'womens-jewellery': 82,
  'womens-shoes': 70,
  'womens-watches': 60,
  'home-decoration': 76,
  lighting: 84,
  motorcycle: 50,
  automotive: 72,
  fitness: 86,
  baby: 78,
  kitchen: 74,
  'health-care': 70,
  general: 60,
};

const TITLE_BUZZ_BOOSTS: { keywords: string[]; boost: number }[] = [
  { keywords: ['led', 'rgb', 'smart', 'glow'], boost: 8 },
  { keywords: ['portable', 'mini', 'travel', 'foldable'], boost: 6 },
  { keywords: ['neck', 'fan', 'cooling'], boost: 5 },
  { keywords: ['baby', 'pet', 'puppy'], boost: 5 },
  { keywords: ['printer', 'thermal'], boost: 4 },
  { keywords: ['vacuum', 'cleaner'], boost: 3 },
];

function hashString(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function getMockSocialBuzz(category: string, title: string): number {
  const cat = (category || 'general').toLowerCase();
  const base = CATEGORY_BUZZ[cat] ?? 60;
  const t = title.toLowerCase();
  let boost = 0;
  TITLE_BUZZ_BOOSTS.forEach(({ keywords, boost: b }) => {
    if (keywords.some((k) => t.includes(k))) boost += b;
  });
  // Deterministic jitter so two products in the same category aren't identical.
  const jitter = (hashString(title) % 9) - 4;
  return Math.max(10, Math.min(100, base + boost + jitter));
}
