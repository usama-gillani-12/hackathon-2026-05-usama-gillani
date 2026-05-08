import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { EmptyState } from '../components/EmptyState';
import { ListFooterLoader } from '../components/ListFooterLoader';
import { ProductCard } from '../components/ProductCard';
import { usePaginatedList } from '../hooks/usePaginatedList';
import {
  fetchAmazonBestSellers,
  fetchAmazonCategories,
  fetchAmazonDeals,
  isAmazonKeyConfigured,
} from '../api/amazonApi';
import { buildScore } from '../services/scoringService';
import { Product, ScoredProduct } from '../types/product';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { ms, s, vs } from '../theme/responsive';

// ─── Category configuration ──────────────────────────────────────────────────

interface Category {
  label: string;
  emoji: string;
  key: string; // matches the Amazon API category id
}

// Emoji per Amazon category id (from /categories?country=US response)
const CATEGORY_EMOJI: Record<string, string> = {
  electronics: '📱',
  beauty: '💄',
  'luxury-beauty': '✨',
  sports: '⚽',
  kitchen: '🏠',
  fashion: '👗',
  'fashion-womens': '👗',
  'fashion-mens': '👔',
  'fashion-girls': '🎀',
  'fashion-boys': '👦',
  'fashion-baby': '🍼',
  'fashion-luggage': '🧳',
  toys: '🧸',
  stripbooks: '📚',
  pets: '🐾',
  baby: '👶',
  drugstore: '💊',
  automotive: '🚗',
  computers: '💻',
  outdoor: '🌿',
  lighting: '💡',
  diy: '🔧',
  videogames: '🎮',
  mi: '🎸',
  'office-products': '📎',
  grocery: '🛒',
  handmade: '🧶',
  industrial: '⚙️',
  appliances: '🔌',
};

// Only show categories that carry physical, shippable products
const PHYSICAL_CATEGORY_IDS = new Set([
  'electronics', 'beauty', 'luxury-beauty', 'sports', 'kitchen',
  'fashion', 'fashion-womens', 'fashion-mens', 'fashion-girls', 'fashion-boys',
  'fashion-baby', 'fashion-luggage', 'toys', 'stripbooks', 'pets', 'baby',
  'drugstore', 'automotive', 'computers', 'outdoor', 'lighting', 'diy',
  'videogames', 'mi', 'office-products', 'grocery', 'handmade', 'industrial',
  'appliances',
]);

// Shown immediately while the API category list loads
const FALLBACK_CATEGORIES: Category[] = [
  { label: 'Electronics', emoji: '📱', key: 'electronics' },
  { label: 'Beauty', emoji: '💄', key: 'beauty' },
  { label: 'Sports & Outdoors', emoji: '⚽', key: 'sports' },
  { label: 'Home & Kitchen', emoji: '🏠', key: 'kitchen' },
  { label: 'Fashion', emoji: '👗', key: 'fashion' },
  { label: 'Toys & Games', emoji: '🧸', key: 'toys' },
  { label: 'Pet Supplies', emoji: '🐾', key: 'pets' },
  { label: 'Baby', emoji: '👶', key: 'baby' },
  { label: 'Health & Care', emoji: '💊', key: 'drugstore' },
  { label: 'Books', emoji: '📚', key: 'stripbooks' },
  { label: 'Automotive', emoji: '🚗', key: 'automotive' },
  { label: 'Computers', emoji: '💻', key: 'computers' },
  { label: 'Garden & Outdoors', emoji: '🌿', key: 'outdoor' },
  { label: 'Lighting', emoji: '💡', key: 'lighting' },
  { label: 'DIY & Tools', emoji: '🔧', key: 'diy' },
  { label: 'Video Games', emoji: '🎮', key: 'videogames' },
  { label: 'Music Instruments', emoji: '🎸', key: 'mi' },
  { label: 'Office Supplies', emoji: '📎', key: 'office-products' },
];

const TRENDING_SEARCHES = [
  'Wireless earbuds',
  'LED face mask',
  'Pet water fountain',
  'Posture corrector',
  'Mini projector',
];

function scoreProducts(products: Product[]): ScoredProduct[] {
  return products.map((p) => buildScore(p, { socialBuzz: 55 }));
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export const DiscoverScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const searchRef = useRef<TextInput>(null);

  // Category list — populated from API, falls back to FALLBACK_CATEGORIES
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

  // Load categories from API on mount so IDs are always up-to-date
  useEffect(() => {
    if (!isAmazonKeyConfigured()) return;
    setLoadingCategories(true);
    fetchAmazonCategories()
      .then((apiCats) => {
        const physical = apiCats
          .filter((c) => PHYSICAL_CATEGORY_IDS.has(c.id))
          .map((c) => ({
            label: c.name.trim(),
            emoji: CATEGORY_EMOJI[c.id] ?? '🛍️',
            key: c.id,
          }));
        if (physical.length > 0) {
          setCategories(physical);
          setSelectedCategory(physical[0]);
        }
      })
      .catch(() => { /* keep FALLBACK_CATEGORIES */ })
      .finally(() => setLoadingCategories(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBestSellers = useCallback(async (categoryKey: string) => {
    setLoadingBestSellers(true);
    setError(null);
    setBestSellers([]);
    try {
      const raw = await fetchAmazonBestSellers(categoryKey);
      if (raw.length === 0) {
        setError('No products found for this category. Try another one.');
      } else {
        setBestSellers(scoreProducts(raw));
      }
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
    } catch {
      // deals section is optional — silent fail is fine
    } finally {
      setLoadingDeals(false);
    }
  }, []);

  useEffect(() => {
    loadBestSellers(selectedCategory.key);
  }, [selectedCategory, loadBestSellers]);

  useEffect(() => {
    loadDeals();
  }, [loadDeals]);

  const filteredBestSellers = useMemo(
    () =>
      searchQuery.trim()
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

  if (!isAmazonKeyConfigured()) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Discover</Text>
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
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Discover</Text>
            <Text style={styles.subtitle}>Live Amazon intelligence</Text>
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live</Text>
          </View>
        </View>

        {/* Search bar */}
        <Pressable
          style={[styles.searchBar, searchFocused && styles.searchBarFocused]}
          onPress={() => searchRef.current?.focus()}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={ms(18)}
            color={searchFocused ? colors.accent : colors.muted}
          />
          <TextInput
            ref={searchRef}
            style={styles.searchInput}
            placeholder="Search products, categories…"
            placeholderTextColor={colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={ms(16)} color={colors.muted} />
            </TouchableOpacity>
          )}
        </Pressable>
      </View>

      {/* ── Category strip ── */}
      {!searchQuery && (
        <View style={styles.categoryStrip}>
          {loadingCategories ? (
            <ActivityIndicator
              size="small"
              color={colors.accent}
              style={styles.categoryLoader}
            />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}
              decelerationRate="fast"
            >
              {categories.map((cat) => {
                const active = cat.key === selectedCategory.key;
                return (
                  <Pressable
                    key={cat.key}
                    onPress={() => setSelectedCategory(cat)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={styles.chipEmoji}>{cat.emoji}</Text>
                    <Text
                      style={[styles.chipLabel, active && styles.chipLabelActive]}
                      numberOfLines={1}
                    >
                      {cat.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>
      )}

      {/* ── Trending search suggestions ── */}
      {searchQuery.length === 0 && searchFocused && (
        <Animated.View entering={FadeInDown.duration(200)} style={styles.suggestionsWrap}>
          <Text style={styles.suggestionsLabel}>TRENDING SEARCHES</Text>
          <View style={styles.suggestionChips}>
            {TRENDING_SEARCHES.map((term) => (
              <TouchableOpacity
                key={term}
                onPress={() => {
                  setSearchQuery(term);
                  searchRef.current?.blur();
                }}
                style={styles.suggestionChip}
              >
                <MaterialCommunityIcons name="trending-up" size={ms(12)} color={colors.accent} />
                <Text style={styles.suggestionText}>{term}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      )}

      {/* ── Product list ── */}
      <FlatList
        data={pagedBestSellers}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListHeaderComponent={
          <>
            {!searchQuery && (
              <LinearGradient
                colors={[colors.heroDark, colors.heroMid]}
                style={styles.categoryBanner}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.bannerEmoji}>{selectedCategory.emoji}</Text>
                <View style={styles.bannerContent}>
                  <Text style={styles.bannerLabel}>BEST SELLERS</Text>
                  <Text style={styles.bannerTitle} numberOfLines={1}>
                    {selectedCategory.label}
                  </Text>
                  <Text style={styles.bannerSub}>
                    {loadingBestSellers
                      ? 'Fetching live data…'
                      : `${total} products · Amazon US`}
                  </Text>
                </View>
                <View style={styles.bannerBadge}>
                  <MaterialCommunityIcons name="amazon" size={ms(20)} color="rgba(255,255,255,0.5)" />
                </View>
              </LinearGradient>
            )}

            <Text style={styles.sectionTitle}>
              {searchQuery
                ? `Results for "${searchQuery}" · ${total}`
                : `Best Sellers · ${selectedCategory.label}`}
            </Text>

            {loadingBestSellers && (
              <View style={styles.loadingWrap}>
                <ActivityIndicator color={colors.accent} size="small" />
                <Text style={styles.loadingText}>
                  Fetching {selectedCategory.label} from Amazon…
                </Text>
              </View>
            )}

            {error && !loadingBestSellers && (
              <View style={styles.errorWrap}>
                <MaterialCommunityIcons name="alert-circle-outline" size={ms(16)} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  onPress={() => loadBestSellers(selectedCategory.key)}
                  style={styles.retryBtn}
                >
                  <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        }
        ListFooterComponent={
          <>
            <ListFooterLoader
              isLoadingMore={isLoadingMore}
              hasMore={hasMore}
              total={total}
              shown={pagedBestSellers.length}
              label="products"
            />
            {bestSellers.length > 0 && !searchQuery && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: vs(24) }]}>
                  🔥 Deals &amp; Offers
                </Text>
                {loadingDeals ? (
                  <View style={styles.loadingWrap}>
                    <ActivityIndicator color={colors.accent} size="small" />
                    <Text style={styles.loadingText}>Loading deals…</Text>
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
              </>
            )}
          </>
        }
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 35).duration(280)}>
            <ProductCard
              scored={item}
              isLocked={false}
              onPress={() => handleProductPress(item)}
              style={{ marginBottom: spacing.md }}
            />
          </Animated.View>
        )}
        ListEmptyComponent={
          !loadingBestSellers && !error ? (
            <EmptyState
              icon={searchQuery ? '🔍' : '📦'}
              title={searchQuery ? `No results for "${searchQuery}"` : 'No products found'}
              message={
                searchQuery
                  ? 'Try a different search term.'
                  : 'Try another category or pull to refresh.'
              }
            />
          ) : null
        }
      />
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
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: vs(12),
  },
  title: { fontSize: ms(24), fontWeight: '800', color: colors.primary, letterSpacing: -0.5 },
  subtitle: { fontSize: ms(12), color: colors.muted, marginTop: vs(2) },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(5),
    backgroundColor: colors.successSoft,
    paddingHorizontal: s(12),
    paddingVertical: vs(6),
    borderRadius: radius.pill,
  },
  liveDot: { width: ms(7), height: ms(7), borderRadius: ms(4), backgroundColor: colors.success },
  liveText: { fontSize: ms(12), fontWeight: '700', color: colors.success },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    backgroundColor: colors.mutedSoft,
    borderRadius: radius.xl,
    paddingHorizontal: s(14),
    paddingVertical: vs(10),
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  searchBarFocused: { borderColor: colors.accent, backgroundColor: colors.white },
  searchInput: { flex: 1, fontSize: ms(14), color: colors.primary, padding: 0 },

  // Category strip — fixed height so it NEVER reflows when chip is selected
  categoryStrip: {
    height: vs(56),
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    justifyContent: 'center',
  },
  categoryLoader: { alignSelf: 'center' },
  categoryRow: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: s(8),
  },

  // Chips — fixed height, no paddingVertical so the height is always identical
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: vs(36),
    paddingHorizontal: s(14),
    gap: s(5),
    borderRadius: radius.pill,
    backgroundColor: colors.mutedSoft,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.heroMid,
    borderColor: colors.accent,
  },
  chipEmoji: { fontSize: ms(13) },
  chipLabel: { fontSize: ms(12), fontWeight: '600', color: colors.muted },
  chipLabelActive: { color: colors.white },

  // Suggestions
  suggestionsWrap: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: vs(14),
  },
  suggestionsLabel: {
    fontSize: ms(10),
    fontWeight: '700',
    color: colors.muted,
    letterSpacing: 0.8,
    marginBottom: vs(10),
  },
  suggestionChips: { flexDirection: 'row', flexWrap: 'wrap', gap: s(8) },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(5),
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
    paddingHorizontal: s(12),
    paddingVertical: vs(7),
  },
  suggestionText: { fontSize: ms(13), fontWeight: '600', color: colors.accent },

  // List
  list: { paddingHorizontal: spacing.lg, paddingTop: vs(16), paddingBottom: vs(32) },
  categoryBanner: {
    borderRadius: radius.xl,
    padding: ms(16),
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(12),
    marginBottom: vs(16),
  },
  bannerEmoji: { fontSize: ms(38) },
  bannerContent: { flex: 1 },
  bannerLabel: { fontSize: ms(10), fontWeight: '700', color: 'rgba(255,255,255,0.45)', letterSpacing: 1 },
  bannerTitle: { fontSize: ms(20), fontWeight: '800', color: colors.white, letterSpacing: -0.5 },
  bannerSub: { fontSize: ms(12), color: 'rgba(255,255,255,0.45)', marginTop: vs(2) },
  bannerBadge: {
    width: ms(40),
    height: ms(40),
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: ms(16),
    fontWeight: '800',
    color: colors.primary,
    marginBottom: vs(12),
    letterSpacing: -0.3,
  },
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    marginVertical: vs(14),
    backgroundColor: colors.mutedSoft,
    borderRadius: radius.lg,
    padding: ms(12),
  },
  loadingText: { fontSize: ms(13), color: colors.muted, fontWeight: '500', flex: 1 },
  errorWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    marginVertical: vs(12),
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.lg,
    padding: ms(12),
  },
  errorText: { fontSize: ms(13), color: colors.danger, flex: 1 },
  retryBtn: {
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    paddingHorizontal: s(10),
    paddingVertical: vs(5),
  },
  retryText: { fontSize: ms(12), fontWeight: '700', color: colors.white },
});
