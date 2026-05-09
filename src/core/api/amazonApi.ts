import { Product } from '@t/product';
import { normalizeAmazonProduct } from '@utils/normalizeProduct';

const BASE_URL = 'https://real-time-amazon-data.p.rapidapi.com';
const HOST = 'real-time-amazon-data.p.rapidapi.com';

export function isAmazonKeyConfigured(): boolean {
  return !!process.env.EXPO_PUBLIC_RAPIDAPI_KEY;
}

function buildHeaders(): Record<string, string> {
  return {
    'X-RapidAPI-Key': process.env.EXPO_PUBLIC_RAPIDAPI_KEY ?? '',
    'X-RapidAPI-Host': HOST,
  };
}

export async function fetchAmazonBestSellers(category = 'Electronics'): Promise<Product[]> {
  if (!isAmazonKeyConfigured()) return [];

  const url = `${BASE_URL}/best-sellers?category=${encodeURIComponent(category)}&country=US`;
  const res = await fetch(url, { headers: buildHeaders() });
  if (!res.ok) throw new Error(`Amazon best-sellers returned ${res.status}`);

  const json = await res.json();
  const items: unknown[] = json?.data?.best_sellers ?? [];
  return items.map((item) => normalizeAmazonProduct(item as AmazonRawProduct));
}

export async function fetchAmazonDeals(): Promise<Product[]> {
  if (!isAmazonKeyConfigured()) return [];

  const url = `${BASE_URL}/deals-and-offers?country=US`;
  const res = await fetch(url, { headers: buildHeaders() });
  if (!res.ok) throw new Error(`Amazon deals returned ${res.status}`);

  const json = await res.json();
  const items: unknown[] = json?.data?.deals ?? [];
  return items.map((item) => normalizeAmazonProduct(item as AmazonRawProduct));
}

export async function fetchAmazonProductDetail(asin: string): Promise<AmazonDetailFields | null> {
  if (!isAmazonKeyConfigured()) return null;

  const url = `${BASE_URL}/product-details?asin=${encodeURIComponent(asin)}&country=US`;
  const res = await fetch(url, { headers: buildHeaders() });
  if (!res.ok) return null;

  const json = await res.json();
  const data = json?.data;
  if (!data) return null;

  return {
    asin,
    salesRank: typeof data.sales_rank === 'number' ? data.sales_rank : undefined,
    salesVolume: typeof data.sales_volume === 'string' ? data.sales_volume : undefined,
    description: typeof data.product_description === 'string' ? data.product_description : '',
  };
}

export async function pingAmazon(): Promise<boolean> {
  if (!isAmazonKeyConfigured()) return false;
  try {
    const url = `${BASE_URL}/best-sellers?category=Electronics&country=US`;
    const res = await fetch(url, { headers: buildHeaders() });
    return res.ok;
  } catch {
    return false;
  }
}

export interface AmazonRawProduct {
  asin?: string;
  product_title?: string;
  product_price?: string;
  product_original_price?: string;
  product_star_rating?: string;
  product_num_ratings?: number;
  product_url?: string;
  product_photo?: string;
  product_num_offers_listings?: number;
  is_prime?: boolean;
  climate_pledge_friendly?: boolean;
  sales_volume?: string;
  department?: string;
  category?: string;
  rank?: number;
  deal_price?: string;
}

export interface AmazonDetailFields {
  asin: string;
  salesRank?: number;
  salesVolume?: string;
  description: string;
}

export interface AmazonCategory {
  id: string;
  name: string;
}

export async function fetchAmazonCategories(country = 'US'): Promise<AmazonCategory[]> {
  if (!isAmazonKeyConfigured()) return [];
  const url = `${BASE_URL}/categories?country=${country}`;
  const res = await fetch(url, { headers: buildHeaders() });
  if (!res.ok) return [];
  const json = await res.json();
  const data: unknown[] = Array.isArray(json?.data) ? json.data : [];
  return data.filter(
    (c): c is AmazonCategory =>
      typeof (c as AmazonCategory).id === 'string' &&
      typeof (c as AmazonCategory).name === 'string',
  );
}
