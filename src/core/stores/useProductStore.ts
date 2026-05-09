import { create } from 'zustand';
import {
  loadScoredProducts,
  clearProductCache,
  ProductSourceStatus,
} from '@core/services/productService';
import { ScoredProduct } from '@t/product';

interface ProductState {
  products: ScoredProduct[];
  loading: boolean;
  sourceStatus: ProductSourceStatus | null;
  load: (opts?: { forceMock?: boolean; refresh?: boolean }) => Promise<void>;
  clearCache: () => void;
  findById: (id: string) => ScoredProduct | undefined;
}

export const useProductStore = create<ProductState>()((set, get) => ({
  products: [],
  loading: false,
  sourceStatus: null,

  load: async (opts) => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const result = await loadScoredProducts(opts);
      set({ products: result.products, sourceStatus: result.sourceStatus, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  clearCache: () => {
    clearProductCache();
    set({ products: [], sourceStatus: null });
  },

  findById: (id) => get().products.find((p) => p.product.id === id),
}));
