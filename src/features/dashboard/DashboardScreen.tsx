import React, { useEffect, useState } from 'react';
import {
  Image,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { BottomTabParamList } from '@t/navigation';
import { isDemoPaymentMode } from '@core/services/paymentService';
import { colors, gradients } from '@theme/colors';
import { ms, s, vs } from '@theme/responsive';
import { formatCurrency } from '@utils/formatCurrency';
import { hapticLight } from '@utils/haptics';
import { RecommendationBadge } from '@shared/components/recommendation-badge';
import { DashboardSkeleton } from '@shared/components/skeletons';
import { AppText } from '@shared/components/app-text';
import { SparklineSvg } from '@shared/components/sparkline-svg';
import { useDashboard } from './Dashboard.hooks';
import { styles } from './Dashboard.styles';

type Props = BottomTabScreenProps<BottomTabParamList, 'Dashboard'>;

// ── Design tokens ──────────────────────────────────────────────────────────────
const CARD_BG = colors.card;

// ── Static data ────────────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { icon: 'fire', label: 'Trending', colors: gradients.gold, screen: 'TrendingProducts' },
  { icon: 'scale-balance', label: 'Compare', colors: gradients.heroDark, screen: 'CompareProducts' },
  { icon: 'star-shooting', label: 'Watchlist', colors: gradients.success, screen: 'Watchlist' },
  { icon: 'diamond', label: 'Credits', colors: gradients.premium, screen: 'BuyCredits' },
];

const SCORE_DIMS = [
  { label: 'Demand', weight: 25, color: colors.accent },
  { label: 'Buzz', weight: 20, color: colors.gold },
  { label: 'Profit', weight: 20, color: colors.success },
  { label: 'Rating', weight: 15, color: colors.warning },
  { label: 'Shipping', weight: 10, color: colors.successDark },
  { label: 'Competition', weight: 5, color: colors.danger },
  { label: 'Risk', weight: 5, color: colors.premium },
];

// ── Mini sparkline chart (smooth gradient line + glow dot) ─────────────────────
const Sparkline: React.FC<{ bars: number[]; color: string }> = ({ bars, color }) => (
  <SparklineSvg values={bars} color={color} width={ms(84)} height={ms(14)} />
);

// ── Animated pulse card wrapper — springs to scale 1.04 + full opacity when
// active, settles to scale 1.0 + opacity 0.7 when inactive.
const PulseCardAnimated: React.FC<{
  isActive: boolean;
  glowStyle: ReturnType<typeof useAnimatedStyle>;
  children: React.ReactNode;
  style?: any;
}> = ({ isActive, glowStyle, children, style }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(isActive ? 1.04 : 1, { damping: 14, stiffness: 180 });
    opacity.value = withTiming(isActive ? 1 : 0.7, { duration: 280 });
  }, [isActive, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>
      {isActive && (
        <Animated.View style={[StyleSheet.absoluteFill, styles.pulseGlow, glowStyle]} />
      )}
      {children}
    </Animated.View>
  );
};

// ── Count-up number ────────────────────────────────────────────────────────────
const CountUp: React.FC<{ target: number; color: string }> = ({ target, color }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const step = Math.ceil(target / 20);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setDisplay(target);
        clearInterval(timer);
      } else {
        setDisplay(start);
      }
    }, 40);
    return () => clearInterval(timer);
  }, [target]);
  return <Text style={{ fontSize: ms(26), fontWeight: '900', letterSpacing: -1, color }}>{display}</Text>;
};

// ── Scroll-driven animated dimension bar ──────────────────────────────────────
// Runs entirely on the UI thread — no JS-thread onScroll callbacks.
const AnimatedDimBar: React.FC<{
  weight: number;
  color: string;
  index: number;
  scrollY: SharedValue<number>;
  sectionY: SharedValue<number>;
  screenH: number;
}> = ({ weight, color, index, scrollY, sectionY, screenH }) => {
  const containerW = useSharedValue(0);

  const fillStyle = useAnimatedStyle(() => {
    // Guard: section not yet measured → stay at 0
    if (sectionY.value === 0 || containerW.value === 0) return { width: 0 };

    // Trigger point: section enters viewport at ~70% down the screen.
    // Each bar staggers 25px of scroll behind the previous one.
    const stagger = index * 25;
    const triggerStart = sectionY.value - screenH * 0.7 + stagger;
    const triggerEnd = triggerStart + 260;
    const targetW = containerW.value * (weight / 100);

    return {
      width: interpolate(
        scrollY.value,
        [triggerStart, triggerEnd],
        [0, targetW],
        Extrapolation.CLAMP,
      ),
    };
  });

  return (
    <View
      style={styles.dimBarBg}
      onLayout={(e) => { containerW.value = e.nativeEvent.layout.width; }}
    >
      <Animated.View style={[styles.dimBarFillAnimated, fillStyle]}>
        <LinearGradient
          colors={[color, color + 'AA']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
      </Animated.View>
    </View>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────
export const DashboardScreen: React.FC<Props> = () => {
  const {
    SCREEN_H,
    navigation,
    balance,
    loading,
    isAmazonLive,
    isAllSourcesFailed,
    insets,
    refreshing,
    stats,
    topOpportunity,
    pulseIndex,
    marketPulse,
    pulseLoading,
    trendingPosts,
    trendingLoading,
    onRefresh,
    METRICS,
    scrollHandler,
    scrollY,
    aiSectionY,
    liveDotStyle,
    orb1Style,
    orb2Style,
    orb3Style,
    glowStyle,
    sheenStyle,
    stickyHeaderStyle,
  } = useDashboard();

  if (loading && !stats) {
    return (
      <SafeAreaView style={styles.safe} edges={[]}>
        <DashboardSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={[]}>
      {/* ── Sticky compact header (BlurView, fades in past 80px scroll) ── */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.stickyHeader,
          { paddingTop: insets.top + ms(6) },
          stickyHeaderStyle,
        ]}
      >
        {Platform.OS === 'ios' ? (
          <BlurView
            blurType="dark"
            blurAmount={1}
            reducedTransparencyFallbackColor={colors.heroDark}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.heroDark + 'EE' }]} />
        )}
        <View style={styles.stickyHeaderInner}>
          <View style={styles.stickyHeaderLeft}>
            <LinearGradient
              colors={gradients.premium}
              style={styles.stickyLogo}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <AppText variant="caption2" color="#fff" style={{ fontWeight: '900' }}>
                TP
              </AppText>
            </LinearGradient>
            <AppText variant="headline" color="#fff">
              TrendPro
            </AppText>
          </View>
          <View style={styles.stickyHeaderRight}>
            <MaterialCommunityIcons name="diamond" size={ms(14)} color={colors.accent} />
            <AppText variant="callout" tabular color="#fff" style={{ fontWeight: '700' }}>
              {balance}
            </AppText>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
      >

        {/* ── Offline fallback banner ─────────────────────────────────── */}
        {isAllSourcesFailed && (
          <View style={styles.offlineBanner}>
            <MaterialCommunityIcons name="wifi-off" size={ms(14)} color={colors.warning} />
            <Text style={styles.offlineBannerText}>No live data — showing cached products</Text>
          </View>
        )}

        {/* ══════════════════════════════════════════════════════════════
            HERO – dark luxury header with floating gradient orbs
        ══════════════════════════════════════════════════════════════ */}
        <View style={styles.hero}>
          {/* Background gradient */}
          <LinearGradient
            colors={[colors.heroDark, colors.heroMid, colors.heroLight]}
            style={StyleSheet.absoluteFill}
          />

          {/* ── Floating gradient orbs (parallax + drift) ── */}
          <Animated.View style={[styles.orb1, orb1Style]} pointerEvents="none">
            <LinearGradient
              colors={[colors.accent + 'AA', 'transparent']}
              style={styles.orbInner}
              start={{ x: 0.2, y: 0.2 }}
              end={{ x: 0.9, y: 0.9 }}
            />
          </Animated.View>
          <Animated.View style={[styles.orb2, orb2Style]} pointerEvents="none">
            <LinearGradient
              colors={[colors.premium + '99', 'transparent']}
              style={styles.orbInner}
              start={{ x: 0.5, y: 0.1 }}
              end={{ x: 0.5, y: 1 }}
            />
          </Animated.View>
          <Animated.View style={[styles.orb3, orb3Style]} pointerEvents="none">
            <LinearGradient
              colors={[colors.gold + '77', 'transparent']}
              style={styles.orbInner}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </Animated.View>

          {/* ── Top nav row ── */}
          <View style={styles.heroNav}>
            <View style={styles.heroNavLeft}>
              <LinearGradient
                colors={gradients.premium}
                style={styles.logoBox}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.logoText}>TP</Text>
              </LinearGradient>
              <View>
                <Text style={styles.heroTitle}>TrendPro</Text>
                <View style={styles.heroSubRow}>
                  {isAmazonLive ? (
                    <>
                      <Animated.View style={[styles.liveDot, liveDotStyle]} />
                      <Text style={styles.heroLiveText}>Amazon Live</Text>
                    </>
                  ) : (
                    <Text style={styles.heroMuted}>Find winners first.</Text>
                  )}
                </View>
              </View>
            </View>

            <View style={styles.heroNavRight}>
              {isDemoPaymentMode() && (
                <View style={styles.demoBadge}>
                  <Text style={styles.demoText}>DEMO</Text>
                </View>
              )}
              <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.navIcon}>
                <MaterialCommunityIcons name="bell-outline" size={ms(19)} color="rgba(255,255,255,0.55)" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.navIcon}>
                <MaterialCommunityIcons name="cog-outline" size={ms(19)} color="rgba(255,255,255,0.55)" />
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Credit balance card ── */}
          <TouchableOpacity
            onPress={() => {
              hapticLight();
              navigation.navigate('BuyCredits');
            }}
            activeOpacity={0.88}
            style={styles.creditCardWrap}
          >
            {/* Gradient hairline border (Apple Wallet treatment) */}
            <LinearGradient
              colors={[colors.accent + '88', colors.premium + '44', 'transparent']}
              style={styles.creditCardBorder}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.creditCard}>
                {/* Diagonal sheen sweep */}
                <Animated.View style={[styles.creditSheen, sheenStyle]} pointerEvents="none">
                  <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.12)', 'transparent']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                </Animated.View>

                <View style={styles.creditTop}>
                  <View style={{ flex: 1 }}>
                    <AppText
                      variant="caption2"
                      uppercase
                      color={colors.textCaption}
                      style={{ marginBottom: vs(6) }}
                    >
                      Available Credits
                    </AppText>
                    <View style={styles.creditAmountRow}>
                      <LinearGradient colors={gradients.premium} style={styles.creditDiamondWrap}>
                        <MaterialCommunityIcons name="diamond" size={ms(16)} color="#fff" />
                      </LinearGradient>
                      <AppText variant="largeTitle" tabular color={colors.textPrimary}>
                        {balance}
                      </AppText>
                      <AppText
                        variant="callout"
                        color={colors.textCaption}
                        style={{ alignSelf: 'flex-end', marginBottom: vs(4) }}
                      >
                        credits
                      </AppText>
                    </View>
                    <AppText
                      variant="caption1"
                      color={colors.textCaption}
                      style={{ marginTop: vs(4) }}
                    >
                      1 credit = 1 USDC · USDC network
                    </AppText>
                  </View>
                  <LinearGradient colors={gradients.accent} style={styles.addBtn}>
                    <MaterialCommunityIcons name="plus" size={ms(14)} color="#fff" />
                    <AppText variant="callout" color="#fff" style={{ fontWeight: '700' }}>
                      Add
                    </AppText>
                  </LinearGradient>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ══════════════════════════════════════════════════════════════
            METRIC CARDS – animated count-up
        ══════════════════════════════════════════════════════════════ */}
        <View style={styles.metricsRow}>
          {METRICS.map((m, i) => (
            <Animated.View
              key={m.label}
              entering={FadeInDown.delay(i * 70).springify().damping(14)}
              style={styles.metricCard}
            >
              <View style={styles.metricInner}>
                <View style={[styles.metricIcon, { backgroundColor: m.bg }]}>
                  <MaterialCommunityIcons name={m.icon} size={ms(17)} color={m.color} />
                </View>
                <CountUp target={m.value} color={m.color} />
                <AppText variant="caption2" uppercase color={colors.muted} numberOfLines={1}>
                  {m.label}
                </AppText>
                <View style={[styles.metricTrend, m.value === 0 && styles.metricTrendHidden]}>
                  <MaterialCommunityIcons name="arrow-top-right" size={ms(10)} color={colors.success} />
                  <AppText variant="caption2" color={colors.success}>
                    Live
                  </AppText>
                </View>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* ══════════════════════════════════════════════════════════════
            MARKET PULSE
        ══════════════════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.delay(100).springify().damping(14)}>
          <View style={styles.sectionHeader}>
            <View>
              <AppText variant="title2">Market Pulse</AppText>
              <AppText variant="footnote" color={colors.textCaption} style={{ marginTop: vs(2) }}>
                Category momentum scores
              </AppText>
            </View>
            <View style={styles.liveBadge}>
              <Animated.View style={[styles.liveBadgeDot, liveDotStyle]} />
              <AppText variant="caption2" uppercase color={colors.success}>
                {pulseLoading ? 'Loading' : 'Live'}
              </AppText>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pulseScrollContent}
          >
            {marketPulse.map((item, i) => {
              const isActive = pulseIndex === i;
              const pulseColor = item.hot ? colors.premium : colors.success;
              return (
                <TouchableOpacity
                  key={item.category}
                  onPress={() => {
                    hapticLight();
                    navigation.navigate('Discover');
                  }}
                  activeOpacity={0.85}
                >
                  <PulseCardAnimated
                    isActive={isActive}
                    glowStyle={glowStyle}
                    style={[styles.pulseCard, isActive && styles.pulseCardActive]}
                  >
                    <View style={[styles.pulseCardInner, { backgroundColor: CARD_BG }]}>
                      {/* Emoji icon */}
                      <View style={[styles.pulseEmojiWrap, {
                        backgroundColor: item.hot ? colors.accentSubtle : colors.successSubtle,
                        borderColor: item.hot ? colors.accent + '40' : colors.success + '40',
                      }]}>
                        <Text style={styles.pulseEmoji}>{item.emoji}</Text>
                      </View>

                      <View style={styles.pulseScoreRow}>
                        <Text style={[styles.pulseScore, { color: pulseColor }]}>
                          {item.score}
                        </Text>
                        <Text style={styles.pulseMax}>/100</Text>
                      </View>

                      <Text style={styles.pulseCat} numberOfLines={1}>
                        {item.category}
                      </Text>

                      <Sparkline bars={item.bars} color={pulseColor} />

                      <View style={[styles.pulseTrendBadge, {
                        backgroundColor: item.hot ? colors.accentSubtle : colors.successSubtle,
                      }]}>
                        <MaterialCommunityIcons name="trending-up" size={ms(10)} color={pulseColor} />
                        <Text style={[styles.pulseTrendText, { color: pulseColor }]}>{item.trend}</Text>
                      </View>

                      {item.hot && (
                        <View style={styles.hotBadge}>
                          <LinearGradient colors={gradients.gold} style={styles.hotGrad}>
                            <Text style={styles.hotText}>HOT</Text>
                          </LinearGradient>
                        </View>
                      )}
                    </View>
                  </PulseCardAnimated>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* ══════════════════════════════════════════════════════════════
            WHAT'S TRENDING — HackerNews Show HN feed
        ══════════════════════════════════════════════════════════════ */}
        {(trendingPosts.length > 0 || trendingLoading) && (
          <Animated.View entering={FadeInDown.delay(140).springify().damping(14)}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>What's Trending</Text>
                <Text style={styles.sectionSub}>Trending e-commerce products on Reddit</Text>
              </View>
              <TouchableOpacity
                onPress={() => Linking.openURL('https://www.reddit.com/r/shutupandtakemymoney/top/?t=week')}
                style={styles.hnBadge}
              >
                <Text style={styles.hnBadgeText}>Reddit ↗</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.trendScrollContent}
            >
              {trendingPosts.map((post, i) => (
                <Animated.View
                  key={post.id}
                  entering={FadeInRight.delay(i * 55).springify().damping(14)}
                >
                  <TouchableOpacity
                    onPress={() => Linking.openURL(post.url)}
                    activeOpacity={0.82}
                    style={styles.trendCard}
                  >
                    <View style={[styles.trendCardInner, { backgroundColor: CARD_BG }]}>
                      {/* Category + badges row */}
                      <View style={styles.trendTopRow}>
                        <View style={styles.trendCatBadge}>
                          <Text style={styles.trendCatText}>{post.category}</Text>
                        </View>
                        {post.isNew && (
                          <View style={[styles.trendStatusBadge, { backgroundColor: colors.successSubtle }]}>
                            <Text style={[styles.trendStatusText, { color: colors.success }]}>NEW</Text>
                          </View>
                        )}
                        {post.isHot && (
                          <View style={[styles.trendStatusBadge, { backgroundColor: colors.accentSubtle }]}>
                            <Text style={[styles.trendStatusText, { color: colors.accent }]}>HOT</Text>
                          </View>
                        )}
                      </View>

                      {/* Title */}
                      <Text style={[styles.trendTitle, { color: colors.textPrimary }]} numberOfLines={2}>
                        {post.title}
                      </Text>

                      {/* Stats row */}
                      <View style={styles.trendStatsRow}>
                        <View style={styles.trendStat}>
                          <MaterialCommunityIcons name="fire" size={ms(12)} color={colors.accent} />
                          <Text style={[styles.trendStatText, { color: colors.textCaption }]}>{post.points}</Text>
                        </View>
                        <View style={styles.trendStat}>
                          <MaterialCommunityIcons name="comment-outline" size={ms(12)} color={colors.textCaption} />
                          <Text style={[styles.trendStatText, { color: colors.textCaption }]}>{post.comments}</Text>
                        </View>
                        <Text style={[styles.trendTime, { color: colors.textCaption }]}>{post.createdAt}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* ══════════════════════════════════════════════════════════════
            TOP OPPORTUNITY
        ══════════════════════════════════════════════════════════════ */}
        {topOpportunity && !loading && (
          <Animated.View entering={FadeInDown.delay(160).springify().damping(14)} style={styles.sectionPad}>
            <View style={styles.sectionHeader}>
              <View>
                <AppText variant="title2">Top Opportunity</AppText>
                <AppText variant="footnote" color={colors.textCaption} style={{ marginTop: vs(2) }}>
                  Highest winning score right now
                </AppText>
              </View>
              <View style={styles.scorePill}>
                <AppText variant="callout" tabular color={colors.accent} style={{ fontWeight: '900' }}>
                  {topOpportunity.winningScore}/100
                </AppText>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => {
                hapticLight();
                navigation.navigate('ProductDetail', { productId: topOpportunity.product.id });
              }}
              activeOpacity={0.88}
            >
              <View style={styles.topCard}>
                {/* Accent stripe */}
                <LinearGradient
                  colors={gradients.premium}
                  style={styles.topAccentStripe}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />

                {/* Header row */}
                <View style={styles.topCardHeader}>
                  <Image source={{ uri: topOpportunity.product.thumbnail }} style={styles.topImage} />
                  <View style={styles.topInfo}>
                    <View style={styles.topCategoryRow}>
                      <View style={styles.topCategoryBadge}>
                        <Text style={styles.topCategoryText}>
                          {topOpportunity.product.category.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.topTitle} numberOfLines={2}>
                      {topOpportunity.product.title}
                    </Text>
                    <RecommendationBadge recommendation={topOpportunity.recommendation} compact />
                  </View>

                  {/* Score ring */}
                  <View style={styles.scoreRing}>
                    <LinearGradient colors={gradients.premium} style={styles.scoreRingGrad}>
                      <View style={styles.scoreRingInner}>
                        <Text style={styles.scoreRingNum}>{topOpportunity.rating10}</Text>
                        <Text style={styles.scoreRingDen}>/10</Text>
                      </View>
                    </LinearGradient>
                  </View>
                </View>

                {/* Stat row */}
                <View style={styles.topStatRow}>
                  {[
                    { label: 'PRICE', value: formatCurrency(topOpportunity.product.price), color: colors.textPrimary },
                    { label: 'MARGIN', value: `${topOpportunity.marginPercent}%`, color: colors.success },
                    { label: 'SCORE', value: `${topOpportunity.winningScore}`, color: colors.accent },
                    { label: 'UNLOCK', value: `${topOpportunity.unlockCost} cr`, color: colors.premium },
                  ].map((stat, i) => (
                    <React.Fragment key={stat.label}>
                      {i > 0 && <View style={styles.topStatDivider} />}
                      <View style={styles.topStat}>
                        <Text style={styles.topStatLabel}>{stat.label}</Text>
                        <Text style={[styles.topStatValue, { color: stat.color }]}>{stat.value}</Text>
                      </View>
                    </React.Fragment>
                  ))}
                </View>

                {/* CTA */}
                <View style={styles.topCta}>
                  <MaterialCommunityIcons name="arrow-right-circle" size={ms(16)} color={colors.accent} />
                  <Text style={styles.topCtaText}>Tap to view full analysis</Text>
                  <MaterialCommunityIcons name="chevron-right" size={ms(16)} color={colors.textCaption} />
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* ══════════════════════════════════════════════════════════════
            QUICK ACTIONS
        ══════════════════════════════════════════════════════════════ */}
        <Animated.View entering={FadeInDown.delay(220).springify().damping(14)} style={styles.sectionPad}>
          <AppText variant="title2">Quick Actions</AppText>
          <View style={styles.actionsRow}>
            {QUICK_ACTIONS.map((a, i) => (
              <Animated.View key={a.label} entering={FadeInRight.delay(i * 60).springify().damping(14)}>
                <TouchableOpacity
                  onPress={() => {
                    hapticLight();
                    navigation.navigate(a.screen);
                  }}
                  activeOpacity={0.8}
                  style={styles.actionBtn}
                >
                  <LinearGradient colors={a.colors as [string, string]} style={styles.actionIcon}>
                    <MaterialCommunityIcons name={a.icon} size={ms(24)} color="#fff" />
                  </LinearGradient>
                  <Text style={styles.actionLabel}>{a.label}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* ══════════════════════════════════════════════════════════════
            7-DIMENSION AI SCORING
        ══════════════════════════════════════════════════════════════ */}
        <Animated.View
          entering={FadeInDown.delay(280).springify().damping(14)}
          style={styles.sectionPad}
          onLayout={(e) => { aiSectionY.value = e.nativeEvent.layout.y; }}
        >
          <View style={styles.aiCard}>
            <View style={styles.aiCardInner}>
              <View style={styles.aiHeader}>
                <LinearGradient colors={gradients.premium} style={styles.aiIconBox}>
                  <MaterialCommunityIcons name="brain" size={ms(18)} color="#fff" />
                </LinearGradient>
                <View>
                  <Text style={styles.aiTitle}>7-Dimension AI Scoring</Text>
                  <Text style={styles.aiSub}>Proprietary weighted model</Text>
                </View>
              </View>

              <View style={styles.dimsWrap}>
                {SCORE_DIMS.map((d, i) => (
                  <View key={d.label} style={styles.dimRow}>
                    <Text style={styles.dimLabel}>{d.label}</Text>
                    <AnimatedDimBar
                      weight={d.weight}
                      color={d.color}
                      index={i}
                      scrollY={scrollY}
                      sectionY={aiSectionY}
                      screenH={SCREEN_H}
                    />
                    <Text style={[styles.dimWeight, { color: d.color }]}>{d.weight}%</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                onPress={() => topOpportunity && navigation.navigate('ScoreBreakdown', { productId: topOpportunity.product.id })}
                style={styles.aiCta}
                activeOpacity={0.8}
              >
                <LinearGradient colors={[colors.accentSubtle, colors.premiumSubtle]} style={styles.aiCtaInner}>
                  <Text style={styles.aiCtaText}>See full breakdown</Text>
                  <MaterialCommunityIcons name="arrow-right" size={ms(15)} color={colors.accent} />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>

      </Animated.ScrollView>
    </SafeAreaView>
  );
};
