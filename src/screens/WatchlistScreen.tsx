import React, { useMemo } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, Chip, Surface, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { EmptyState } from '../components/EmptyState';
import { ListFooterLoader } from '../components/ListFooterLoader';
import { ProductCard } from '../components/ProductCard';
import { ListSkeleton } from '../components/skeletons/ListSkeleton';
import { usePaginatedList } from '../hooks/usePaginatedList';
import {
  useProductsQuery,
  useUnlockedQuery,
  useWatchlistQuery,
  useRemoveFromWatchlistMutation,
  useSetWatchlistStatusMutation,
} from '../hooks/queries';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { ms, s, vs } from '../theme/responsive';
import { ScoredProduct, WatchlistItem, WatchlistStatus } from '../types/product';
import { BottomTabParamList } from '../types/navigation';

type Props = BottomTabScreenProps<BottomTabParamList, 'Watchlist'>;

const STATUS_OPTIONS: WatchlistStatus[] = ['Watching', 'Testing', 'Avoided'];

const STATUS_CONFIG: Record<WatchlistStatus, { icon: string; color: string; bg: string }> = {
  Watching: { icon: 'eye-outline', color: colors.accent, bg: colors.accentSoft },
  Testing: { icon: 'beaker-outline', color: colors.success, bg: colors.successSoft },
  Avoided: { icon: 'close-circle-outline', color: colors.danger, bg: colors.dangerSoft },
};

interface WatchEntry {
  scored: ScoredProduct;
  item: WatchlistItem;
}

export const WatchlistScreen: React.FC<Props> = () => {
  const navigation = useNavigation<any>();

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

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={[]}>
        <ListSkeleton count={4} />
      </SafeAreaView>
    );
  }

  if (entries.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={[]}>
        <View style={styles.emptyWrap}>
          <MaterialCommunityIcons name="star-outline" size={ms(56)} color={colors.border} />
          <Text style={styles.emptyTitle}>Watchlist is empty</Text>
          <Text style={styles.emptySub}>Save products from any detail screen to track them here.</Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('TrendingProducts')}
            style={styles.emptyBtn}
            buttonColor={colors.accent}
          >
            Browse Trending Products
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      <View style={styles.summaryBar}>
        {STATUS_OPTIONS.map((s) => {
          const count = entries.filter((e) => e.item.status === s).length;
          const cfg = STATUS_CONFIG[s];
          return (
            <View key={s} style={styles.summaryItem}>
              <View style={[styles.summaryIcon, { backgroundColor: cfg.bg }]}>
                <MaterialCommunityIcons name={cfg.icon} size={ms(14)} color={cfg.color} />
              </View>
              <Text style={styles.summaryCount}>{count}</Text>
              <Text style={styles.summaryLabel}>{s}</Text>
            </View>
          );
        })}
      </View>

      <FlatList
        data={pagedEntries}
        keyExtractor={(e) => e.item.productId}
        contentContainerStyle={styles.content}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={
          <ListFooterLoader
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            total={total}
            shown={pagedEntries.length}
            label="watchlist items"
          />
        }
        renderItem={({ item }) => {
          const cfg = STATUS_CONFIG[item.item.status];
          return (
            <Surface style={styles.entryCard} elevation={1}>
              <View style={styles.entryHeader}>
                <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
                  <MaterialCommunityIcons name={cfg.icon} size={ms(12)} color={cfg.color} />
                  <Text style={[styles.statusText, { color: cfg.color }]}>{item.item.status.toUpperCase()}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => removeMutation.mutate(item.item.productId)}
                  style={styles.removeBtn}
                >
                  <MaterialCommunityIcons name="trash-can-outline" size={ms(16)} color={colors.danger} />
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>

              <ProductCard
                scored={item.scored}
                isLocked={item.scored.isPremium && !unlockedSet.has(item.scored.product.id)}
                onPress={() => navigation.navigate('ProductDetail', { productId: item.scored.product.id })}
                onAction={() => navigation.navigate('ProductDetail', { productId: item.scored.product.id })}
              />

              <View style={styles.statusChips}>
                {STATUS_OPTIONS.map((s) => (
                  <Chip
                    key={s}
                    selected={item.item.status === s}
                    onPress={() =>
                      setStatusMutation.mutate({ productId: item.item.productId, status: s })
                    }
                    style={[styles.statusChip, item.item.status === s && { backgroundColor: colors.primary }]}
                    textStyle={[styles.statusChipText, item.item.status === s && { color: colors.white }]}
                    compact
                  >
                    {s}
                  </Chip>
                ))}
              </View>
            </Surface>
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: ms(20), fontWeight: '700', color: colors.primary },
  emptySub: { fontSize: ms(14), color: colors.muted, textAlign: 'center' },
  emptyBtn: { marginTop: spacing.sm, borderRadius: radius.lg },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.lg,
  },
  summaryItem: { flexDirection: 'row', alignItems: 'center', gap: ms(6) },
  summaryIcon: { width: ms(24), height: ms(24), borderRadius: ms(6), alignItems: 'center', justifyContent: 'center' },
  summaryCount: { fontSize: ms(16), fontWeight: '800', color: colors.primary },
  summaryLabel: { fontSize: ms(12), color: colors.muted },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xxxl },
  entryCard: { borderRadius: radius.lg, backgroundColor: colors.card, overflow: 'hidden' },
  entryHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingTop: spacing.md,
  },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: ms(4),
    borderRadius: radius.pill, paddingHorizontal: s(10), paddingVertical: vs(4),
  },
  statusText: { fontSize: ms(10), fontWeight: '700', letterSpacing: ms(0.5) },
  removeBtn: { flexDirection: 'row', alignItems: 'center', gap: ms(4), padding: ms(4) },
  removeText: { fontSize: ms(12), color: colors.danger, fontWeight: '600' },
  statusChips: {
    flexDirection: 'row', gap: ms(6),
    paddingHorizontal: spacing.md, paddingBottom: spacing.md, paddingTop: vs(4),
  },
  statusChip: { backgroundColor: colors.mutedSoft, borderRadius: radius.pill },
  statusChipText: { fontSize: ms(11), color: colors.primary },
});
