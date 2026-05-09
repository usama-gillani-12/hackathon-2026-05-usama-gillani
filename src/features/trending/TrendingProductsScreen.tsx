import React from 'react';
import { FlatList, Pressable, ScrollView, TouchableOpacity, View } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { EmptyState } from '@shared/components/empty-state';
import { ListFooterLoader } from '@shared/components/list-footer-loader';
import { ProductCard } from '@shared/components/product-card';
import { ListSkeleton } from '@shared/components/skeletons';
import { colors, gradients } from '@theme/colors';
import { Recommendation } from '@t/product';
import { BottomTabParamList } from '@t/navigation';
import { useTrendingProducts, RECOMMENDATIONS, SORT_OPTIONS } from './TrendingProducts.hooks';
import { styles } from './TrendingProducts.styles';

type Props = BottomTabScreenProps<BottomTabParamList, 'TrendingProducts'>;

export const TrendingProductsScreen: React.FC<Props> = () => {
  const navigation = useNavigation<any>();

  const {
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
  } = useTrendingProducts();

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
