import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { EmptyState } from '../components/EmptyState';
import { ListFooterLoader } from '../components/ListFooterLoader';
import { ProductCard } from '../components/ProductCard';
import { SearchBar } from '../components/SearchBar';
import { DiscoverSkeleton } from '../components/skeletons/DiscoverSkeleton';
import { usePaginatedList } from '../hooks/usePaginatedList';
import {
  fetchAmazonBestSellers,
  fetchAmazonCategories,
  fetchAmazonDeals,
  isAmazonKeyConfigured,
} from '../api/amazonApi';
import { buildScore } from '../services/scoringService';
import { Product, ScoredProduct } from '../types/product';
import { colors, gradients } from '../theme/colors';
import { radius, spacing, shadow } from '../theme/spacing';
import { ms, s, vs } from '../theme/responsive';
import { hapticLight, hapticMedium } from '../utils/haptics';
import { AppText } from '../components/AppText';

// ─── Constants ────────────────────────────────────────────────────────────────

const RECENT_SEARCHES_KEY = '@trendpro/recent_searches';
const MAX_RECENT = 5;

interface Category {
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

const FALLBACK_CATEGORIES: Category[] = [
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

// ─── Category chip with spring bounce ─────────────────────────────────────────

const CategoryChip: React.FC<{
  category: Category;
  active: boolean;
  onPress: () => void;
}> = ({ category, active, onPress }) => {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    hapticLight();
    scale.value = withSpring(0.92, { damping: 12, stiffness: 300 }, () => {
      scale.value = withSpring(1, { damping: 14, stiffness: 260 });
    });
    onPress();
  };

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        style={[styles.chip, active && styles.chipActive]}
      >
        {active ? (
          <LinearGradient
            colors={gradients.premium}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.chipGradient}
          >
            <AppText style={styles.chipEmoji}>{category.emoji}</AppText>
            <AppText variant="caption1" color={colors.white} style={styles.chipLabelActive} numberOfLines={1}>
              {category.label}
            </AppText>
          </LinearGradient>
        ) : (
          <View style={styles.chipInner}>
            <AppText style={styles.chipEmoji}>{category.emoji}</AppText>
            <AppText variant="caption1" color={colors.textCaption} style={styles.chipLabel} numberOfLines={1}>
              {category.label}
            </AppText>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── Screen ──────────────────────────────────────────────────────────────────

export const DiscoverScreen: React.FC = () => {
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

  if (!isAmazonKeyConfigured()) {
    return (
      <SafeAreaView style={styles.safe} edges={[]}>
        <View style={styles.header}>
          <AppText variant="title2" color={colors.textPrimary}>Discover</AppText>
        </View>
        <EmptyState
          icon="🔑"
          title="RapidAPI Key Required"
          message={
            'Add EXPO_PUBLIC_RAPIDAPI_KEY to your .env file.\n\n' +
            '1. Sign up at rapidapi.com\n' +
            '2. Subscribe to "Real-Time Amazon Data" (free tier)\n' +
            '3. Copy your X-RapidAPI-Key and paste it in .env\n' +
            '4. Restart Metro: yarn start'
          }
          style={{ flex: 1 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={[]}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <AppText variant="title2" color={colors.textPrimary} style={styles.title}>Discover</AppText>
            <AppText variant="caption1" color={colors.textCaption}>Live Amazon intelligence</AppText>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <AppText variant="caption2" color={colors.success} uppercase>Live</AppText>
          </View>
        </View>

        {/* iOS-native search bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={(t) => { setSearchQuery(t); }}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => {
            if (searchQuery.trim()) commitSearch(searchQuery);
            setSearchFocused(false);
          }}
          onCancel={handleCancelSearch}
          focused={searchFocused}
        />
      </View>

      {/* ── Recent / trending suggestions overlay ── */}
      {showSuggestions && (
        <Animated.View entering={FadeInDown.duration(180)} style={styles.suggestionsPanel}>
          {recentSearches.length > 0 ? (
            <>
              <View style={styles.suggestionsHeader}>
                <AppText variant="caption2" color={colors.textCaption} uppercase style={styles.suggestionsLabel}>
                  Recent
                </AppText>
                <TouchableOpacity onPress={handleClearRecent} hitSlop={{ top: 6, bottom: 6 }}>
                  <AppText variant="footnote" color={colors.accent}>Clear</AppText>
                </TouchableOpacity>
              </View>
              {recentSearches.map((term) => (
                <TouchableOpacity
                  key={term}
                  onPress={() => applyQuery(term)}
                  style={styles.recentRow}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="history" size={ms(15)} color={colors.textCaption} />
                  <AppText variant="body" color={colors.textPrimary} style={styles.recentText}>{term}</AppText>
                  <MaterialCommunityIcons name="arrow-top-left" size={ms(14)} color={colors.textCaption} />
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <>
              <AppText variant="caption2" color={colors.textCaption} uppercase style={styles.suggestionsLabel}>
                Trending searches
              </AppText>
              <View style={styles.trendingChips}>
                {['Wireless earbuds', 'LED face mask', 'Pet fountain', 'Posture corrector', 'Mini projector'].map((term) => (
                  <TouchableOpacity
                    key={term}
                    onPress={() => applyQuery(term)}
                    style={styles.trendingChip}
                    activeOpacity={0.75}
                  >
                    <MaterialCommunityIcons name="trending-up" size={ms(11)} color={colors.accent} />
                    <AppText variant="caption1" color={colors.accent}>{term}</AppText>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </Animated.View>
      )}

      {/* ── Category chip strip ── */}
      {!searchQuery && (
        <View style={styles.categoryStrip}>
          {loadingCategories ? (
            <ActivityIndicator size="small" color={colors.accent} style={{ alignSelf: 'center' }} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}
              decelerationRate="fast"
            >
              {categories.map((cat) => (
                <CategoryChip
                  key={cat.key}
                  category={cat}
                  active={cat.key === selectedCategory.key}
                  onPress={() => setSelectedCategory(cat)}
                />
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* ── Product list / skeleton / error ── */}
      {loadingBestSellers && bestSellers.length === 0 ? (
        <DiscoverSkeleton />
      ) : (
        <FlatList
          data={pagedBestSellers}
          keyExtractor={(item) => item.product.id}
          style={styles.flatList}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListHeaderComponent={
            <>
              {/* Category banner */}
              {!searchQuery && (
                <Animated.View entering={FadeIn.duration(300)}>
                  <LinearGradient
                    colors={[colors.heroDark, colors.heroMid]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.categoryBanner}
                  >
                    <AppText style={styles.bannerEmoji}>{selectedCategory.emoji}</AppText>
                    <View style={styles.bannerContent}>
                      <AppText variant="caption2" color="rgba(255,255,255,0.45)" uppercase style={styles.bannerLabel}>
                        Best Sellers
                      </AppText>
                      <AppText variant="title3" color={colors.white} numberOfLines={1} style={styles.bannerTitle}>
                        {selectedCategory.label}
                      </AppText>
                      <AppText variant="caption1" color="rgba(255,255,255,0.45)">
                        {loadingBestSellers ? 'Fetching live data…' : `${total} products · Amazon US`}
                      </AppText>
                    </View>
                    <View style={styles.bannerBadge}>
                      <MaterialCommunityIcons name="amazon" size={ms(20)} color="rgba(255,255,255,0.5)" />
                    </View>
                  </LinearGradient>
                </Animated.View>
              )}

              {/* Section title */}
              <AppText variant="headline" color={colors.textPrimary} style={styles.sectionTitle}>
                {searchQuery ? `Results for "${searchQuery}" · ${total}` : `Best Sellers · ${selectedCategory.label}`}
              </AppText>

              {/* Error state */}
              {error && !loadingBestSellers && (
                <Animated.View entering={FadeIn.duration(200)} style={styles.errorCard}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={ms(18)} color={colors.danger} />
                  <View style={{ flex: 1, gap: vs(6) }}>
                    <AppText variant="footnote" color={colors.danger}>{error}</AppText>
                    <TouchableOpacity
                      onPress={() => { hapticMedium(); loadBestSellers(selectedCategory.key); }}
                      style={styles.retryBtn}
                    >
                      <AppText variant="caption2" color={colors.white} uppercase>Retry</AppText>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              )}
            </>
          }
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 30).duration(260)}>
              <ProductCard
                scored={item}
                isLocked={false}
                onPress={() => handleProductPress(item)}
                style={{ marginBottom: spacing.md }}
              />
            </Animated.View>
          )}
          ListFooterComponent={
            <>
              <ListFooterLoader
                isLoadingMore={isLoadingMore}
                hasMore={hasMore}
                total={total}
                shown={pagedBestSellers.length}
                label="products"
              />
              {/* Deals section */}
              {bestSellers.length > 0 && !searchQuery && (
                <View style={{ marginTop: vs(8) }}>
                  <AppText variant="headline" color={colors.textPrimary} style={styles.sectionTitle}>
                    🔥 Deals &amp; Offers
                  </AppText>
                  {loadingDeals ? (
                    <View style={styles.loadingWrap}>
                      <ActivityIndicator color={colors.accent} size="small" />
                      <AppText variant="footnote" color={colors.textCaption}>Loading deals…</AppText>
                    </View>
                  ) : deals.length > 0 ? (
                    deals.map((scored) => (
                      <ProductCard
                        key={scored.product.id}
                        scored={scored}
                        isLocked={false}
                        onPress={() => handleProductPress(scored)}
                        style={{ marginBottom: spacing.md }}
                      />
                    ))
                  ) : null}
                </View>
              )}
            </>
          }
          ListEmptyComponent={
            !loadingBestSellers && !error ? (
              <View style={styles.emptyWrap}>
                 <AppText style={styles.emptyIllu}>{searchQuery ? '🔍' : '📦'}</AppText> 
                <AppText variant="title3" color={colors.textPrimary} center style={styles.emptyTitle}>
                  {searchQuery ? `No results for "${searchQuery}"` : 'No products found'}
                </AppText>
                <AppText variant="body" color={colors.textCaption} center style={styles.emptySub}>
                  {searchQuery ? 'Try a different search term.' : 'Try another category or pull to refresh.'}
                </AppText>
                {searchQuery ? (
                  <TouchableOpacity
                    onPress={() => { hapticLight(); setSearchQuery(''); }}
                    style={styles.emptyResetBtn}
                  >
                    <LinearGradient
                      colors={gradients.premium}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={styles.emptyResetBtnInner}
                    >
                      <AppText variant="callout" color={colors.white}>Clear search</AppText>
                    </LinearGradient>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  // Header
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: vs(8),
    paddingBottom: vs(12),
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: vs(10),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: { letterSpacing: -0.4 },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(5),
    backgroundColor: colors.successSoft,
    paddingHorizontal: s(10),
    paddingVertical: vs(5),
    borderRadius: radius.pill,
  },
  liveDot: { width: ms(7), height: ms(7), borderRadius: ms(4), backgroundColor: colors.success },

  // Suggestions panel
  suggestionsPanel: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: vs(12),
    paddingBottom: vs(14),
    gap: vs(4),
    ...shadow.sm,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(6),
  },
  suggestionsLabel: { letterSpacing: ms(0.8) },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    paddingVertical: vs(10),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  recentText: { flex: 1 },
  trendingChips: { flexDirection: 'row', flexWrap: 'wrap', gap: s(8), marginTop: vs(6) },
  trendingChip: {
    flexDirection: 'row', alignItems: 'center', gap: s(4),
    backgroundColor: colors.accentSubtle,
    borderRadius: radius.pill,
    paddingHorizontal: s(12), paddingVertical: vs(6),
    borderWidth: 1, borderColor: colors.accentSoft,
  },

  // Category strip
  categoryStrip: {
    height: vs(54),
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    justifyContent: 'center',
  },
  categoryRow: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: s(8),
  },
  chip: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceVariant,
  },
  chipActive: { borderColor: colors.accent },
  chipGradient: {
    flexDirection: 'row', alignItems: 'center',
    height: vs(36), paddingHorizontal: s(12), gap: s(5),
  },
  chipInner: {
    flexDirection: 'row', alignItems: 'center',
    height: vs(36), paddingHorizontal: s(12), gap: s(5),
  },
  chipEmoji: { fontSize: ms(13) },
  chipLabel: { fontWeight: '600' },
  chipLabelActive: { fontWeight: '700' },

  // List
  flatList: { flex: 1 },
  list: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingTop: vs(14), paddingBottom: vs(40) },
  categoryBanner: {
    borderRadius: radius.xl,
    padding: ms(16),
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(12),
    marginBottom: vs(14),
    ...shadow.md,
  },
  bannerEmoji: { fontSize: ms(38) },
  bannerContent: { flex: 1, gap: vs(2) },
  bannerLabel: { letterSpacing: ms(1) },
  bannerTitle: { letterSpacing: -0.4 },
  bannerBadge: {
    width: ms(40), height: ms(40), borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { marginBottom: vs(12) },

  loadingWrap: {
    flexDirection: 'row', alignItems: 'center', gap: s(10),
    marginVertical: vs(10),
  },

  errorCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: s(10),
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.dangerSoft,
    padding: ms(14),
    marginBottom: vs(14),
  },
  retryBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    paddingHorizontal: s(10), paddingVertical: vs(4),
  },

  // Empty state
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(48),
    gap: vs(10),
  },
  emptyIllu: { fontSize: ms(56), marginBottom: vs(4) },
  emptyTitle: { letterSpacing: -0.3 },
  emptySub: { maxWidth: s(240), lineHeight: ms(22) },
  emptyResetBtn: {
    borderRadius: radius.pill, overflow: 'hidden',
    marginTop: vs(8),
    ...shadow.sm, shadowColor: colors.premium,
  },
  emptyResetBtnInner: { paddingHorizontal: s(24), paddingVertical: vs(12) },
});
