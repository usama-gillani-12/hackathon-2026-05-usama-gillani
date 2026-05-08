import { Product } from '../types/product';
import { normalizeFakeStore } from '../utils/normalizeProduct';

const ENDPOINT = 'https://fakestoreapi.com/products';

export async function fetchFakeStoreProducts(): Promise<Product[]> {
  const res = await fetch(ENDPOINT);
  if (!res.ok) {
    throw new Error(`FakeStore returned ${res.status}`);
  }
  const json = await res.json();
  if (!Array.isArray(json)) {
    throw new Error('FakeStore returned an unexpected payload');
  }
  return json.map(normalizeFakeStore);
}

export async function pingFakeStore(): Promise<boolean> {
  try {
    const res = await fetch('https://fakestoreapi.com/products?limit=1');
    return res.ok;
  } catch {
    return false;
  }
}
