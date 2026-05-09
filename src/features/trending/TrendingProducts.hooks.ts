import { useMemo, useState } from 'react';
import { useProductsQuery, useUnlockedQuery } from '@hooks/queries';
import { usePaginatedList } from '@hooks/usePaginatedList';
import { Recommendation } from '@t/product';

type SortKey = 'score' | 'margin' | 'social';

export const RECOMMENDATIONS: Recommendation[] = ['Test Now', 'Watch Closely', 'Research More', 'Avoid for Now'];
export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'score', label: 'Top Score' },
  { key: 'margin', label: 'Best Margin' },
  { key: 'social', label: 'Most Buzz' },
];

export function useTrendingProducts() {
  const { data: products = [], isLoading: loadingProducts } = useProductsQuery();
  const { data: unlockedSet = new Set<string>(), isLoading: loadingUnlocked } = useUnlockedQuery();

  const loading = loadingProducts || loadingUnlocked;

  const [category, setCategory] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('score');

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.product.category));
    return Array.from(set).slice(0, 8);
  }, [products]);

  const filtered = useMemo(() => {
    let list = products.slice();
    if (category) list = list.filter((p) => p.product.category === category);
    if (recommendation) list = list.filter((p) => p.recommendation === recommendation);
    if (premiumOnly) list = list.filter((p) => p.isPremium);
    list.sort((a, b) => {
      if (sortKey === 'margin') return b.marginPercent - a.marginPercent;
      if (sortKey === 'social') return b.scoreBreakdown.socialBuzz - a.scoreBreakdown.socialBuzz;
      return b.winningScore - a.winningScore;
    });
    return list;
  }, [products, category, recommendation, premiumOnly, sortKey]);

  const hotCount = filtered.filter((p) => p.winningScore >= 80).length;

  const { items: pagedProducts, total, hasMore, isLoadingMore, loadMore } = usePaginatedList(filtered, 15);

  return {
    loading,
    unlockedSet,
    category,
    setCategory,
    recommendation,
    setRecommendation,
    premiumOnly,
    setPremiumOnly,
    sortKey,
    setSortKey,
    categories,
    filtered,
    hotCount,
    pagedProducts,
    total,
    hasMore,
    isLoadingMore,
    loadMore,
  };
}
