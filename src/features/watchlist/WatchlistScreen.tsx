import React from 'react';
import { FlatList, TouchableOpacity, View } from 'react-native';
import { Text, Chip, Surface, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { EmptyState } from '@shared/components/empty-state';
import { ListFooterLoader } from '@shared/components/list-footer-loader';
import { ProductCard } from '@shared/components/product-card';
import { ListSkeleton } from '@shared/components/skeletons';
import { colors } from '@theme/colors';
import { ms } from '@theme/responsive';
import { BottomTabParamList } from '@t/navigation';
import { useWatchlist, STATUS_OPTIONS, STATUS_CONFIG } from './Watchlist.hooks';
import { styles } from './Watchlist.styles';

type Props = BottomTabScreenProps<BottomTabParamList, 'Watchlist'>;

export const WatchlistScreen: React.FC<Props> = () => {
  const navigation = useNavigation<any>();

  const {
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
  } = useWatchlist();

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
