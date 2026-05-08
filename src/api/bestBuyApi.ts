import { Product } from '../types/product';
import { BestBuyRawProduct, normalizeBestBuy } from '../utils/normalizeProduct';
import { BESTBUY_BASE_URL } from '../constants';

const API_KEY = process.env.EXPO_PUBLIC_BESTBUY_API_KEY?.trim() || '';

export function isBestBuyKeyConfigured(): boolean {
  return API_KEY.length > 0;
}

// Fields we actually need — keeps responses small and fast
const SHOW_FIELDS = [
  'sku',
  'name',
  'salePrice',
  'regularPrice',
  'customerReviewAverage',
  'customerReviewCount',
  'manufacturer',
  'department',
  'class',
  'image',
  'onlineAvailability',
  'shortDescription',
].join(',');

// Six category keyword searches that map well to our scoring-engine categories.
// bestSellingRank sort surfaces genuinely popular products in each niche.
const CATEGORY_SEARCHES: Array<{ filter: string; fallbackCategory?: string }> = [
  { filter: '(search=fitness tracker)' },
  { filter: '(search=smart home device)' },
  { filter: '(search=kitchen appliance)' },
  { filter: '(search=beauty device)' },
  { filter: '(search=pet care)' },
  { filter: '(department="Computers & Tablets")' },
];

async function fetchCategory(filter: string): Promise<Product[]> {
  const url =
    `${BESTBUY_BASE_URL}/products${filter}` +
    `?apiKey=${API_KEY}` +
    `&show=${SHOW_FIELDS}` +
    `&pageSize=10` +
    `&sort=bestSellingRank.asc` +
    `&format=json`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Best Buy ${filter} returned ${res.status}`);

  const json = await res.json();
  const products: BestBuyRawProduct[] = json?.products ?? [];
  return products
    .filter((p) => p.name && (p.salePrice ?? 0) > 0 && p.image)
    .map(normalizeBestBuy);
}

export async function fetchBestBuyProducts(): Promise<Product[]> {
  if (!isBestBuyKeyConfigured()) return [];

  const results = await Promise.allSettled(
    CATEGORY_SEARCHES.map((s) => fetchCategory(s.filter)),
  );

  const products: Product[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled') products.push(...r.value);
  }
  return products;
}

export async function pingBestBuy(): Promise<boolean> {
  if (!isBestBuyKeyConfigured()) return false;
  try {
    const url =
      `${BESTBUY_BASE_URL}/products(search=laptop)` +
      `?apiKey=${API_KEY}&show=sku&pageSize=1&format=json`;
    const res = await fetch(url);
    return res.ok;
  } catch {
    return false;
  }
}
