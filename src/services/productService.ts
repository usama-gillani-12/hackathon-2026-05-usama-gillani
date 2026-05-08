import { fetchDummyJsonProducts, pingDummyJson } from '../api/dummyJsonApi';
import { fetchFakeStoreProducts, pingFakeStore } from '../api/fakeStoreApi';
import { fetchSocialBuzzScore, isYoutubeKeyConfigured } from '../api/youtubeApi';
import { fetchAmazonBestSellers, fetchAmazonDeals, isAmazonKeyConfigured, pingAmazon } from '../api/amazonApi';
import { mockProducts } from '../mocks/mockProducts';
import { Product, ScoredProduct } from '../types/product';
import { buildScore } from './scoringService';

export interface ProductSourceStatus {
  amazon: 'ok' | 'failed' | 'missing';
  dummyJson: 'ok' | 'failed' | 'unknown';
  fakeStore: 'ok' | 'failed' | 'unknown';
  youtube: 'configured' | 'missing';
  activeSource: 'amazon' | 'dummyjson' | 'fakestore' | 'mock';
}

export interface LoadProductsResult {
  products: ScoredProduct[];
  sourceStatus: ProductSourceStatus;
}

let cachedResult: LoadProductsResult | null = null;

async function gatherProducts(forceMock: boolean): Promise<{ raw: Product[]; status: ProductSourceStatus }> {
  const status: ProductSourceStatus = {
    amazon: isAmazonKeyConfigured() ? 'failed' : 'missing',
    dummyJson: 'unknown',
    fakeStore: 'unknown',
    youtube: isYoutubeKeyConfigured() ? 'configured' : 'missing',
    activeSource: 'mock',
  };

  if (forceMock) {
    status.activeSource = 'mock';
    return { raw: mockProducts, status };
  }

  // Amazon first — fetch multiple high-demand categories + deals in parallel
  if (isAmazonKeyConfigured()) {
    try {
      const CATEGORIES = [
        'electronics',
        'kitchen',
        'sports',
        'beauty',
        'pets',
      ];
      const [categoryResults, deals] = await Promise.all([
        Promise.allSettled(CATEGORIES.map((cat) => fetchAmazonBestSellers(cat))),
        fetchAmazonDeals().catch(() => [] as Product[]),
      ]);
      const amzProducts: Product[] = [];
      for (const result of categoryResults) {
        if (result.status === 'fulfilled') amzProducts.push(...result.value);
      }
      amzProducts.push(...deals);
      if (amzProducts.length === 0) throw new Error('All Amazon category fetches failed');
      status.amazon = 'ok';
      status.activeSource = 'amazon';
      return { raw: [...mockProducts, ...amzProducts], status };
    } catch {
      status.amazon = 'failed';
    }
  }

  try {
    const dj = await fetchDummyJsonProducts();
    status.dummyJson = 'ok';
    status.activeSource = 'dummyjson';
    // Always blend in mock products so the demo's hero items (Pet Travel Water Bottle, etc.) appear.
    return { raw: [...mockProducts, ...dj], status };
  } catch {
    status.dummyJson = 'failed';
  }

  try {
    const fs = await fetchFakeStoreProducts();
    status.fakeStore = 'ok';
    status.activeSource = 'fakestore';
    return { raw: [...mockProducts, ...fs], status };
  } catch {
    status.fakeStore = 'failed';
  }

  status.activeSource = 'mock';
  return { raw: mockProducts, status };
}

export async function loadScoredProducts(options?: { forceMock?: boolean; refresh?: boolean }): Promise<LoadProductsResult> {
  if (cachedResult && !options?.refresh) return cachedResult;

  const { raw, status } = await gatherProducts(options?.forceMock === true);

  // De-dupe by id while preserving order — mock products win.
  const seen = new Set<string>();
  const unique: Product[] = [];
  for (const p of raw) {
    if (!seen.has(p.id)) {
      seen.add(p.id);
      unique.push(p);
    }
  }

  // Score everything in parallel. Each scoring call may hit YouTube (or mock) for buzz.
  const scored = await Promise.all(
    unique.map(async (product) => {
      const socialBuzz = await fetchSocialBuzzScore(product.title, product.category);
      return buildScore(product, { socialBuzz });
    }),
  );

  scored.sort((a, b) => b.winningScore - a.winningScore);

  cachedResult = { products: scored, sourceStatus: status };
  return cachedResult;
}

export function getCachedScoredProducts(): ScoredProduct[] {
  return cachedResult?.products ?? [];
}

export function findScoredProduct(productId: string): ScoredProduct | undefined {
  return cachedResult?.products.find((p) => p.product.id === productId);
}

export function clearProductCache(): void {
  cachedResult = null;
}

export async function probeProductSources(): Promise<ProductSourceStatus> {
  const [amzOk, djOk, fsOk] = await Promise.all([pingAmazon(), pingDummyJson(), pingFakeStore()]);
  return {
    amazon: isAmazonKeyConfigured() ? (amzOk ? 'ok' : 'failed') : 'missing',
    dummyJson: djOk ? 'ok' : 'failed',
    fakeStore: fsOk ? 'ok' : 'failed',
    youtube: isYoutubeKeyConfigured() ? 'configured' : 'missing',
    activeSource: amzOk ? 'amazon' : djOk ? 'dummyjson' : fsOk ? 'fakestore' : 'mock',
  };
}
