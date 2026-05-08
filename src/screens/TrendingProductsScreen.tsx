import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { EmptyState } from '../components/EmptyState';
import { ListFooterLoader } from '../components/ListFooterLoader';
import { ProductCard } from '../components/ProductCard';
import { ListSkeleton } from '../components/skeletons/ListSkeleton';
import { usePaginatedList } from '../hooks/usePaginatedList';
import { useProductsQuery, useUnlockedQuery } from '../hooks/queries';
import { colors, gradients } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { ms, s, vs } from '../theme/responsive';
import { Recommendation } from '../types/product';
import { BottomTabParamList } from '../types/navigation';

type Props = BottomTabScreenProps<BottomTabParamList, 'TrendingProducts'>;

type SortKey = 'score' | 'margin' | 'social';

const RECOMMENDATIONS: Recommendation[] = ['Test Now', 'Watch Closely', 'Research More', 'Avoid for Now'];
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'score', label: 'Top Score' },
  { key: 'margin', label: 'Best Margin' },
  { key: 'social', label: 'Most Buzz' },
];

export const TrendingProductsScreen: React.FC<Props> = () => {
  const navigation = useNavigation<any>();

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

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      {/* Hero banner */}
      <LinearGradient colors={gradients.heroDark} style={styles.hero}>
        <View style={styles.heroRow}>
          <View>
            <View style={styles.heroTitleRow}>
              <Text style={styles.heroTitle}>Trending</Text>
              <View style={styles.fireBadge}>
                <Text style={styles.fireBadgeText}>🔥</Text>
              </View>
            </View>
            <Text style={styles.heroSub}>
              {loading ? 'Loading…' : `${filtered.length} products · ${hotCount} hot`}
            </Text>
          </View>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{hotCount}</Text>
              <Text style={styles.heroStatLabel}>Hot</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatVal}>{filtered.length}</Text>
              <Text style={styles.heroStatLabel}>Total</Text>
            </View>
          </View>
        </View>

        {/* Sort tabs */}
        <View style={styles.sortRow}>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              onPress={() => setSortKey(opt.key)}
              style={[styles.sortTab, sortKey === opt.key && styles.sortTabActive]}
            >
              <Text style={[styles.sortTabText, sortKey === opt.key && styles.sortTabTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Filter row */}
      <Surface style={styles.filterPanel} elevation={1}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <FilterChip label="All" active={!recommendation} onPress={() => setRecommendation(null)} />
          {RECOMMENDATIONS.map((rec) => (
            <FilterChip
              key={rec}
              label={rec}
              active={recommendation === rec}
              onPress={() => setRecommendation(recommendation === rec ? null : rec)}
            />
          ))}
          <View style={styles.filterDivider} />
          <FilterChip
            label="⭐ Premium only"
            active={premiumOnly}
            onPress={() => setPremiumOnly(!premiumOnly)}
            premium
          />
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <FilterChip label="All categories" active={!category} onPress={() => setCategory(null)} />
          {categories.map((c) => (
            <FilterChip
              key={c}
              label={c.replace(/-/g, ' ')}
              active={category === c}
              onPress={() => setCategory(category === c ? null : c)}
            />
          ))}
        </ScrollView>
      </Surface>

      {loading ? (
        <ListSkeleton count={5} />
      ) : (
        <FlatList
          data={pagedProducts}
          keyExtractor={(item) => item.product.id}
          contentContainerStyle={styles.list}
          getItemLayout={(_, index) => ({ length: vs(110), offset: vs(110) * index, index })}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          renderItem={({ item }) => (
            <ProductCard
              scored={item}
              isLocked={item.isPremium && !unlockedSet.has(item.product.id)}
              onPress={() => navigation.navigate('ProductDetail', { productId: item.product.id })}
              onAction={() => navigation.navigate('ProductDetail', { productId: item.product.id })}
            />
          )}
          ListFooterComponent={
            <ListFooterLoader
              isLoadingMore={isLoadingMore}
              hasMore={hasMore}
              total={total}
              shown={pagedProducts.length}
              label="products"
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="No products match your filters"
              message="Try clearing a filter or refreshing."
              icon="🔍"
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const FilterChip: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
  premium?: boolean;
}> = ({ label, active, onPress, premium }) => (
  <Pressable
    onPress={onPress}
    style={[
      styles.chip,
      active && (premium ? styles.chipPremium : styles.chipActive),
    ]}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  // Hero
  hero: { paddingHorizontal: spacing.lg, paddingTop: vs(10), paddingBottom: vs(12) },
  heroRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: vs(12) },
  heroTitleRow: { flexDirection: 'row', alignItems: 'center', gap: ms(8) },
  heroTitle: { color: colors.white, fontSize: ms(26), fontWeight: '900', letterSpacing: -0.5 },
  fireBadge: {
    backgroundColor: 'rgba(245,158,11,0.2)', borderRadius: radius.pill,
    paddingHorizontal: s(8), paddingVertical: vs(2),
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.4)',
  },
  fireBadgeText: { fontSize: ms(14) },
  heroSub: { color: 'rgba(255,255,255,0.45)', fontSize: ms(12), marginTop: vs(2) },
  heroStats: { flexDirection: 'row', alignItems: 'center', gap: ms(16) },
  heroStat: { alignItems: 'center' },
  heroStatVal: { color: colors.white, fontSize: ms(22), fontWeight: '800' },
  heroStatLabel: { color: 'rgba(255,255,255,0.4)', fontSize: ms(11) },
  heroStatDivider: { width: 1, height: ms(32), backgroundColor: 'rgba(255,255,255,0.15)' },

  // Sort tabs
  sortRow: { flexDirection: 'row', gap: s(8) },
  sortTab: {
    flex: 1, alignItems: 'center', paddingVertical: vs(8),
    borderRadius: radius.lg, backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  sortTabActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  sortTabText: { fontSize: ms(12), fontWeight: '700', color: 'rgba(255,255,255,0.5)' },
  sortTabTextActive: { color: colors.white },

  // Filters
  filterPanel: {
    backgroundColor: colors.card,
    paddingVertical: vs(6),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: vs(4),
    gap: ms(6),
  },
  filterDivider: { width: 1, height: ms(20), backgroundColor: colors.border, marginHorizontal: s(4) },
  chip: {
    borderRadius: radius.pill,
    backgroundColor: colors.mutedSoft,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: s(12),
    paddingVertical: vs(6),
  },
  chipActive: { backgroundColor: colors.heroMid, borderColor: colors.accent },
  chipPremium: { backgroundColor: colors.premiumSoft, borderColor: colors.premium },
  chipText: { fontSize: ms(12), fontWeight: '600', color: colors.muted },
  chipTextActive: { color: colors.white },
  list: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
});
