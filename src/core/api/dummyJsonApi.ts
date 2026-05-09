import { Product } from '@t/product';
import { normalizeDummyJson } from '@utils/normalizeProduct';

const ENDPOINT = 'https://dummyjson.com/products?limit=50';

export async function fetchDummyJsonProducts(): Promise<Product[]> {
  const res = await fetch(ENDPOINT);
  if (!res.ok) {
    throw new Error(`DummyJSON returned ${res.status}`);
  }
  const json = await res.json();
  if (!json?.products || !Array.isArray(json.products)) {
    throw new Error('DummyJSON returned an unexpected payload');
  }
  return json.products.map(normalizeDummyJson);
}

export async function pingDummyJson(): Promise<boolean> {
  try {
    const res = await fetch('https://dummyjson.com/products?limit=1');
    return res.ok;
  } catch {
    return false;
  }
}
