import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@t/navigation';
import { usePaginatedList } from '@hooks/usePaginatedList';
import { loadScoredProducts } from '@core/services/productService';
import { getUnlockedIdSet } from '@core/services/unlockService';
import { ScoredProduct } from '@t/product';
import { formatCurrency } from '@utils/formatCurrency';

type Props = NativeStackScreenProps<RootStackParamList, 'CompareProducts'>;

export const MAX_SELECTED = 3;

export const COMPARE_ROWS = [
  { label: 'Score', getValue: (p: ScoredProduct) => `${p.winningScore} pts`, highlight: (p: ScoredProduct, all: ScoredProduct[]) => p.winningScore === Math.max(...all.map((x) => x.winningScore)) },
  { label: 'Rating', getValue: (p: ScoredProduct) => `${p.rating10}/10`, highlight: () => false },
  { label: 'Price', getValue: (p: ScoredProduct) => formatCurrency(p.product.price), highlight: () => false },
  { label: 'Margin', getValue: (p: ScoredProduct) => `${p.marginPercent}%`, highlight: (p: ScoredProduct, all: ScoredProduct[]) => p.marginPercent === Math.max(...all.map((x) => x.marginPercent)) },
  { label: 'Social Buzz', getValue: (p: ScoredProduct) => `${Math.round(p.scoreBreakdown.socialBuzz)}/100`, highlight: () => false },
  { label: 'Competition', getValue: (p: ScoredProduct) => `${Math.round(p.scoreBreakdown.competition)}/100`, highlight: () => false },
  { label: 'Risk', getValue: (p: ScoredProduct) => `${Math.round(p.scoreBreakdown.risk)}/100`, highlight: () => false },
  { label: 'Shipping', getValue: (p: ScoredProduct) => `${Math.round(p.scoreBreakdown.shippingEase)}/100`, highlight: () => false },
  { label: 'Verdict', getValue: (p: ScoredProduct) => p.recommendation, highlight: () => false },
];

export function useCompareProducts(route: Props['route']) {
  const initialId = route.params?.initialProductId;
  const [products, setProducts] = useState<ScoredProduct[]>([]);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<string[]>(initialId ? [initialId] : []);
  const [loading, setLoading] = useState(true);
  const [showCompare, setShowCompare] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [{ products: scored }, ids] = await Promise.all([loadScoredProducts(), getUnlockedIdSet()]);
    setProducts(scored);
    setUnlocked(ids);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const toggle = (id: string) => {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_SELECTED) return prev;
      return [...prev, id];
    });
  };

  const { items: pagedProducts, total, hasMore, isLoadingMore, loadMore } = usePaginatedList(products, 15);

  const selectedProducts = useMemo(
    () => selected.map((id) => products.find((p) => p.product.id === id)).filter(Boolean) as ScoredProduct[],
    [selected, products],
  );

  const winner = useMemo(() => {
    if (selectedProducts.length < 2) return null;
    return selectedProducts.reduce((best, p) => (p.winningScore > best.winningScore ? p : best), selectedProducts[0]);
  }, [selectedProducts]);

  return {
    products,
    unlocked,
    selected,
    loading,
    showCompare,
    setShowCompare,
    toggle,
    pagedProducts,
    total,
    hasMore,
    isLoadingMore,
    loadMore,
    selectedProducts,
    winner,
  };
}
