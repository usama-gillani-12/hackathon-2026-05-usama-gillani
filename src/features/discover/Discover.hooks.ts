import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import {
  fetchAmazonBestSellers,
  fetchAmazonCategories,
  fetchAmazonDeals,
  isAmazonKeyConfigured,
} from '@core/api/amazonApi';
import { buildScore } from '@core/services/scoringService';
import { usePaginatedList } from '@hooks/usePaginatedList';
import { Product, ScoredProduct } from '@t/product';
import { hapticLight, hapticMedium } from '@utils/haptics';
import { analytics } from '@core/services/analyticsService';

// ─── Constants ────────────────────────────────────────────────────────────────

const RECENT_SEARCHES_KEY = '@trendpro/recent_searches';
const MAX_RECENT = 5;

export interface Category {
  label: string;
  emoji: string;
  key: string;
}

const CATEGORY_EMOJI: Record<string, string> = {
  electronics: '📱', beauty: '💄', 'luxury-beauty': '✨', sports: '⚽',
  kitchen: '🏠', fashion: '👗', 'fashion-womens': '👗', 'fashion-mens': '👔',
  'fashion-girls': '🎀', 'fashion-boys': '👦', 'fashion-baby': '🍼',
  'fashion-luggage': '🧳', toys: '🧸', stripbooks: '📚', pets: '🐾',
  baby: '👶', drugstore: '💊', automotive: '🚗', computers: '💻',
  outdoor: '🌿', lighting: '💡', diy: '🔧', videogames: '🎮',
  mi: '🎸', 'office-products': '📎', grocery: '🛒', handmade: '🧶',
  industrial: '⚙️', appliances: '🔌',
};

const PHYSICAL_CATEGORY_IDS = new Set([
  'electronics', 'beauty', 'luxury-beauty', 'sports', 'kitchen',
  'fashion', 'fashion-womens', 'fashion-mens', 'fashion-girls', 'fashion-boys',
  'fashion-baby', 'fashion-luggage', 'toys', 'stripbooks', 'pets', 'baby',
  'drugstore', 'automotive', 'computers', 'outdoor', 'lighting', 'diy',
  'videogames', 'mi', 'office-products', 'grocery', 'handmade', 'industrial',
  'appliances',
]);

export const FALLBACK_CATEGORIES: Category[] = [
  { label: 'Electronics', emoji: '📱', key: 'electronics' },
  { label: 'Beauty', emoji: '💄', key: 'beauty' },
  { label: 'Sports', emoji: '⚽', key: 'sports' },
  { label: 'Home & Kitchen', emoji: '🏠', key: 'kitchen' },
  { label: 'Fashion', emoji: '👗', key: 'fashion' },
  { label: 'Toys & Games', emoji: '🧸', key: 'toys' },
  { label: 'Pets', emoji: '🐾', key: 'pets' },
  { label: 'Baby', emoji: '👶', key: 'baby' },
  { label: 'Health', emoji: '💊', key: 'drugstore' },
  { label: 'Books', emoji: '📚', key: 'stripbooks' },
  { label: 'Automotive', emoji: '🚗', key: 'automotive' },
  { label: 'Computers', emoji: '💻', key: 'computers' },
  { label: 'Outdoors', emoji: '🌿', key: 'outdoor' },
  { label: 'Lighting', emoji: '💡', key: 'lighting' },
  { label: 'DIY & Tools', emoji: '🔧', key: 'diy' },
  { label: 'Video Games', emoji: '🎮', key: 'videogames' },
  { label: 'Instruments', emoji: '🎸', key: 'mi' },
  { label: 'Office', emoji: '📎', key: 'office-products' },
];

function scoreProducts(products: Product[]): ScoredProduct[] {
  return products.map((p) => buildScore(p, { socialBuzz: 55 }));
}

// ─── Recent searches persistence ─────────────────────────────────────────────

async function loadRecentSearches(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveRecentSearch(query: string, current: string[]): Promise<string[]> {
  const trimmed = query.trim();
  if (!trimmed) return current;
  const deduped = [trimmed, ...current.filter((q) => q !== trimmed)].slice(0, MAX_RECENT);
  try {
    await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(deduped));
  } catch { /* silent */ }
  return deduped;
}

async function clearRecentSearches(): Promise<void> {
  try {
    await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch { /* silent */ }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDiscover() {
  const navigation = useNavigation<any>();

  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>(FALLBACK_CATEGORIES[0]);

  const [bestSellers, setBestSellers] = useState<ScoredProduct[]>([]);
  const [deals, setDeals] = useState<ScoredProduct[]>([]);
  const [loadingBestSellers, setLoadingBestSellers] = useState(false);
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load categories from API
  useEffect(() => {
    loadRecentSearches().then(setRecentSearches);
    if (!isAmazonKeyConfigured()) return;
    setLoadingCategories(true);
    fetchAmazonCategories()
      .then((apiCats) => {
        const physical = apiCats
          .filter((c) => PHYSICAL_CATEGORY_IDS.has(c.id))
          .map((c) => ({ label: c.name.trim(), emoji: CATEGORY_EMOJI[c.id] ?? '🛍️', key: c.id }));
        if (physical.length > 0) { setCategories(physical); setSelectedCategory(physical[0]); }
      })
      .catch(() => { /* keep fallback */ })
      .finally(() => setLoadingCategories(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBestSellers = useCallback(async (categoryKey: string) => {
    setLoadingBestSellers(true);
    setError(null);
    setBestSellers([]);
    try {
      const raw = await fetchAmazonBestSellers(categoryKey);
      if (raw.length === 0) setError('No products found for this category. Try another one.');
      else setBestSellers(scoreProducts(raw));
    } catch {
      setError('Could not load products. Check your connection and try again.');
    } finally {
      setLoadingBestSellers(false);
    }
  }, []);

  const loadDeals = useCallback(async () => {
    setLoadingDeals(true);
    try {
      const raw = await fetchAmazonDeals();
      setDeals(scoreProducts(raw));
    } catch { /* silent */ }
    finally { setLoadingDeals(false); }
  }, []);

  useEffect(() => { loadBestSellers(selectedCategory.key); }, [selectedCategory, loadBestSellers]);
  useEffect(() => { loadDeals(); }, [loadDeals]);

  const filteredBestSellers = useMemo(
    () => searchQuery.trim()
      ? bestSellers.filter(
          (s) =>
            s.product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.product.category.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : bestSellers,
    [bestSellers, searchQuery],
  );

  const { items: pagedBestSellers, total, hasMore, isLoadingMore, loadMore } =
    usePaginatedList(filteredBestSellers, 12);

  const handleProductPress = (scored: ScoredProduct) => {
    navigation.navigate('ProductDetail', { productId: scored.product.id });
  };

  const commitSearch = async (query: string) => {
    if (!query.trim()) return;
    const updated = await saveRecentSearch(query, recentSearches);
    setRecentSearches(updated);
  };

  const applyQuery = (query: string) => {
    hapticLight();
    setSearchQuery(query);
    setSearchFocused(false);
    commitSearch(query);
    if (query.trim()) {
      analytics.searchPerformed(query.trim(), filteredBestSellers.length);
    }
  };

  const handleCancelSearch = () => {
    setSearchFocused(false);
    setSearchQuery('');
  };

  const handleClearRecent = async () => {
    hapticMedium();
    await clearRecentSearches();
    setRecentSearches([]);
  };

  // Show suggestions panel when focused and no text typed yet
  const showSuggestions = searchFocused && searchQuery.length === 0;

  return {
    categories,
    loadingCategories,
    selectedCategory,
    setSelectedCategory,
    bestSellers,
    deals,
    loadingBestSellers,
    loadingDeals,
    error,
    searchQuery,
    setSearchQuery,
    searchFocused,
    setSearchFocused,
    recentSearches,
    pagedBestSellers,
    total,
    hasMore,
    isLoadingMore,
    loadMore,
    handleProductPress,
    commitSearch,
    applyQuery,
    handleCancelSearch,
    handleClearRecent,
    showSuggestions,
    loadBestSellers,
  };
}
