import { useMemo } from 'react';
import { colors } from '@theme/colors';
import {
  useProductsQuery,
  useUnlockedQuery,
  useWatchlistQuery,
  useRemoveFromWatchlistMutation,
  useSetWatchlistStatusMutation,
} from '@hooks/queries';
import { usePaginatedList } from '@hooks/usePaginatedList';
import { ScoredProduct, WatchlistItem, WatchlistStatus } from '@t/product';

export const STATUS_OPTIONS: WatchlistStatus[] = ['Watching', 'Testing', 'Avoided'];

export const STATUS_CONFIG: Record<WatchlistStatus, { icon: string; color: string; bg: string }> = {
  Watching: { icon: 'eye-outline', color: colors.accent, bg: colors.accentSoft },
  Testing: { icon: 'beaker-outline', color: colors.success, bg: colors.successSoft },
  Avoided: { icon: 'close-circle-outline', color: colors.danger, bg: colors.dangerSoft },
};

export interface WatchEntry {
  scored: ScoredProduct;
  item: WatchlistItem;
}

export function useWatchlist() {
  const { data: products = [], isLoading: loadingProducts } = useProductsQuery();
  const { data: watchlistItems = [], isLoading: loadingWatchlist } = useWatchlistQuery();
  const { data: unlockedSet = new Set<string>() } = useUnlockedQuery();

  const removeMutation = useRemoveFromWatchlistMutation();
  const setStatusMutation = useSetWatchlistStatusMutation();

  const loading = loadingProducts || loadingWatchlist;

  const entries = useMemo<WatchEntry[]>(() => {
    return watchlistItems
      .map((item) => {
        const scored = products.find((p) => p.product.id === item.productId);
        return scored ? { scored, item } : null;
      })
      .filter((x): x is WatchEntry => x !== null);
  }, [watchlistItems, products]);

  const { items: pagedEntries, total, hasMore, isLoadingMore, loadMore } = usePaginatedList(entries, 10);

  return {
    loading,
    unlockedSet,
    entries,
    pagedEntries,
    total,
    hasMore,
    isLoadingMore,
    loadMore,
    removeMutation,
    setStatusMutation,
  };
}
