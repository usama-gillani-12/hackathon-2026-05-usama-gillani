import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
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
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { EmptyState } from '@shared/components/empty-state';
import { ListFooterLoader } from '@shared/components/list-footer-loader';
import { ProductCard } from '@shared/components/product-card';
import { SearchBar } from '@shared/components/search-bar';
import { DiscoverSkeleton } from '@shared/components/skeletons';
import { isAmazonKeyConfigured } from '@core/api/amazonApi';
import { ScoredProduct } from '@t/product';
import { colors, gradients } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { ms, s, vs } from '@theme/responsive';
import { hapticLight, hapticMedium } from '@utils/haptics';
import { AppText } from '@shared/components/app-text';
import { useDiscover, Category } from './Discover.hooks';
import { styles } from './Discover.styles';

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
  const {
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
  } = useDiscover();

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
