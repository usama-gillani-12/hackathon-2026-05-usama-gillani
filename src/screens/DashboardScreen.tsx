import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated as RNAnimated,
  Dimensions,
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  type SharedValue,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { BottomTabParamList } from '../types/navigation';
import { useCreditStore } from '../stores/useCreditStore';
import { useProductStore } from '../stores/useProductStore';
import { getUnlockedIdSet } from '../services/unlockService';
import { isDemoPaymentMode } from '../services/paymentService';
import { colors, gradients } from '../theme/colors';
import { spacing, radius, shadow, glowShadow } from '../theme/spacing';
import { ms, s, vs } from '../theme/responsive';
import { formatCurrency } from '../utils/formatCurrency';
import { hapticLight } from '../utils/haptics';
import { RecommendationBadge } from '../components/RecommendationBadge';
import { DashboardSkeleton } from '../components/skeletons/DashboardSkeleton';
import { AppText } from '../components/AppText';
import { SparklineSvg } from '../components/SparklineSvg';
import { DashboardStats, ScoredProduct } from '../types/product';
import { MarketPulseItem, TrendingPost } from '../types/market';
import { fetchMarketPulse, MARKET_PULSE_FALLBACK } from '../api/redditMarketApi';
import { fetchTrendingPosts } from '../api/redditTrendingApi';

type Props = BottomTabScreenProps<BottomTabParamList, 'Dashboard'>;

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ── Design tokens ──────────────────────────────────────────────────────────────
const BG = colors.background;
const CARD_BG = colors.card;
const CARD_BORDER = colors.border;
const GLASS = colors.surfaceVariant;
const GLASS_BORDER = colors.border;

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
  <SparklineSvg values={bars} color={color} width={ms(80)} height={ms(22)} />
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
  return <Text style={[countStyles.num, { color }]}>{display}</Text>;
};

const countStyles = StyleSheet.create({
  num: { fontSize: ms(26), fontWeight: '900', letterSpacing: -1 },
});

// ── Scroll-driven animated dimension bar ──────────────────────────────────────
// Runs entirely on the UI thread — no JS-thread onScroll callbacks.
const AnimatedDimBar: React.FC<{
  weight: number;
  color: string;
  index: number;
  scrollY: SharedValue<number>;
  sectionY: SharedValue<number>;
}> = ({ weight, color, index, scrollY, sectionY }) => {
  const containerW = useSharedValue(0);

  const fillStyle = useAnimatedStyle(() => {
    // Guard: section not yet measured → stay at 0
    if (sectionY.value === 0 || containerW.value === 0) return { width: 0 };

    // Trigger point: section enters viewport at ~70% down the screen.
    // Each bar staggers 25px of scroll behind the previous one.
    const stagger = index * 25;
    const triggerStart = sectionY.value - SCREEN_H * 0.7 + stagger;
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
  const navigation = useNavigation<any>();
  const balance = useCreditStore((s) => s.balance);
  const initCredits = useCreditStore((s) => s.initialize);
  const loadProducts = useProductStore((s) => s.load);
  const products = useProductStore((s) => s.products);
  const loading = useProductStore((s) => s.loading);
  const sourceStatus = useProductStore((s) => s.sourceStatus);
  const isAmazonLive = sourceStatus?.amazon === 'ok';

  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topOpportunity, setTopOpportunity] = useState<ScoredProduct | null>(null);
  const [pulseIndex, setPulseIndex] = useState(0);
  const [marketPulse, setMarketPulse] = useState<MarketPulseItem[]>(MARKET_PULSE_FALLBACK);
  const [pulseLoading, setPulseLoading] = useState(false);
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(false);

  const insets = useSafeAreaInsets();

  // ── Animated live dot
  const liveDotAnim = useRef(new RNAnimated.Value(1)).current;
  useEffect(() => {
    RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(liveDotAnim, { toValue: 1.5, duration: 900, useNativeDriver: true }),
        RNAnimated.timing(liveDotAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ]),
    ).start();
  }, [liveDotAnim]);

  // ── Scroll position (drives parallax, sticky header, AI section bars)
  const scrollY = useSharedValue(0);
  const aiSectionY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  // ── Orb float + parallax (orbs drift up at 0.4× scroll for depth)
  const orb1Y = useSharedValue(0);
  const orb2Y = useSharedValue(0);
  const orb3Y = useSharedValue(0);

  useEffect(() => {
    orb1Y.value = withRepeat(
      withSequence(withTiming(-18, { duration: 3400 }), withTiming(0, { duration: 3400 })),
      -1,
      false,
    );
    orb2Y.value = withRepeat(
      withSequence(withTiming(14, { duration: 2800 }), withTiming(0, { duration: 2800 })),
      -1,
      false,
    );
    orb3Y.value = withRepeat(
      withSequence(withTiming(-10, { duration: 4200 }), withTiming(0, { duration: 4200 })),
      -1,
      false,
    );
  }, []);

  const orb1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: orb1Y.value + scrollY.value * -0.45 }],
  }));
  const orb2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: orb2Y.value + scrollY.value * -0.3 }],
  }));
  const orb3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: orb3Y.value + scrollY.value * -0.2 }],
  }));

  // ── Pulse card glow
  const glowOpacity = useSharedValue(0.4);
  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 1200 }), withTiming(0.4, { duration: 1200 })),
      -1,
      false,
    );
  }, []);
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));

  // ── Credit card sheen — single diagonal sweep on mount, then again every 8s
  const sheenX = useSharedValue(-1);
  useEffect(() => {
    sheenX.value = withRepeat(
      withSequence(
        withTiming(-1, { duration: 0 }),
        withTiming(1, { duration: 1400 }),
        withTiming(1, { duration: 6600 }),
      ),
      -1,
      false,
    );
  }, []);
  const sheenStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(sheenX.value, [-1, 1], [-SCREEN_W * 0.6, SCREEN_W * 0.6]) }],
    opacity: interpolate(sheenX.value, [-1, -0.8, 0, 0.8, 1], [0, 0.6, 0.9, 0.6, 0], Extrapolation.CLAMP),
  }));

  // ── Sticky compact header — fades in past 80px, fully visible at 140px
  const stickyHeaderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [80, 140], [0, 1], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(scrollY.value, [80, 140], [-8, 0], Extrapolation.CLAMP),
      },
    ],
  }));

  // ── Data loading
  const buildStats = useCallback(async (prods: ScoredProduct[]) => {
    const unlockedSet = await getUnlockedIdSet();
    const premium = prods.filter((p) => p.isPremium).length;
    const rising = prods.filter((p) => p.winningScore >= 70).length;
    const top = prods.find((p) => !p.isPremium || unlockedSet.has(p.product.id)) ?? prods[0];
    setStats({
      productsScanned: prods.length,
      risingTrends: rising,
      premiumOpportunities: premium,
      productsUnlocked: unlockedSet.size,
    });
    setTopOpportunity(top ?? null);
  }, []);

  const load = useCallback(async (refresh = false) => {
    await initCredits();
    await loadProducts({ refresh });
    await buildStats(useProductStore.getState().products);
    setRefreshing(false);
  }, []);

  const loadPulse = useCallback(async () => {
    setPulseLoading(true);
    try {
      const items = await fetchMarketPulse();
      setMarketPulse(items);
    } catch {
      // fallback already set as initial state
    } finally {
      setPulseLoading(false);
    }
  }, []);

  const loadTrending = useCallback(async () => {
    setTrendingLoading(true);
    try {
      const posts = await fetchTrendingPosts();
      setTrendingPosts(posts);
    } catch {
      // section stays hidden when empty
    } finally {
      setTrendingLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(false);
      loadPulse();
      loadTrending();
      const interval = setInterval(() => {
        setPulseIndex((i) => (i + 1) % marketPulse.length);
      }, 2800);
      return () => clearInterval(interval);
    }, [load, loadPulse, loadTrending, marketPulse.length]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    load(true);
  };

  const METRICS = [
    { label: 'Scanned', value: stats?.productsScanned ?? 0, icon: 'magnify', color: colors.accent, bg: colors.accentSubtle },
    { label: 'Rising', value: stats?.risingTrends ?? 0, icon: 'trending-up', color: colors.success, bg: colors.successSubtle },
    { label: 'Premium', value: stats?.premiumOpportunities ?? 0, icon: 'diamond', color: colors.premium, bg: colors.premiumSubtle },
    { label: 'Unlocked', value: stats?.productsUnlocked ?? 0, icon: 'lock-open-outline', color: colors.warning, bg: colors.warningSubtle },
  ];

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
                      <RNAnimated.View style={[styles.liveDot, { transform: [{ scale: liveDotAnim }] }]} />
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
              <RNAnimated.View style={[styles.liveBadgeDot, { transform: [{ scale: liveDotAnim }] }]} />
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

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  content: { paddingBottom: spacing.xxxl + ms(20) },

  // ── Hero
  hero: {
    overflow: 'hidden',
    paddingBottom: spacing.xl,
  },
  orb1: {
    position: 'absolute',
    width: ms(260),
    height: ms(260),
    borderRadius: ms(130),
    top: -ms(60),
    left: -ms(60),
    overflow: 'hidden',
  },
  orb2: {
    position: 'absolute',
    width: ms(220),
    height: ms(220),
    borderRadius: ms(110),
    top: ms(30),
    right: -ms(80),
    overflow: 'hidden',
  },
  orb3: {
    position: 'absolute',
    width: ms(160),
    height: ms(160),
    borderRadius: ms(80),
    bottom: -ms(40),
    left: ms(80),
    overflow: 'hidden',
  },
  orbInner: { flex: 1 },

  heroNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: vs(14),
    marginBottom: spacing.lg,
  },
  heroNavLeft: { flexDirection: 'row', alignItems: 'center', gap: ms(12) },
  logoBox: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(14),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: ms(4) },
    shadowOpacity: 0.4,
    shadowRadius: ms(10),
    elevation: 6,
  },
  logoText: { color: '#fff', fontSize: ms(17), fontWeight: '900' },
  heroTitle: { color: '#fff', fontSize: ms(20), fontWeight: '900', letterSpacing: -0.6 },
  heroSubRow: { flexDirection: 'row', alignItems: 'center', gap: s(5), marginTop: vs(2) },
  liveDot: { width: ms(7), height: ms(7), borderRadius: ms(4), backgroundColor: colors.success },
  heroLiveText: { color: colors.success, fontSize: ms(12), fontWeight: '700' },
  heroMuted: { color: 'rgba(255,255,255,0.38)', fontSize: ms(12) },
  heroNavRight: { flexDirection: 'row', alignItems: 'center', gap: s(6) },
  demoBadge: {
    backgroundColor: 'rgba(192,139,48,0.25)',
    borderRadius: radius.pill,
    paddingHorizontal: s(10),
    paddingVertical: vs(3),
    borderWidth: 1,
    borderColor: 'rgba(192,139,48,0.45)',
  },
  demoText: { color: colors.accent, fontSize: ms(10), fontWeight: '900', letterSpacing: 0.8 },
  navIcon: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(11),
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  // Credit card
  creditCardWrap: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.xxl,
    ...shadow.lg,
    ...glowShadow(colors.accent),
  },
  creditCardBorder: {
    borderRadius: radius.xxl,
    padding: 1,
  },
  creditCard: {
    borderRadius: radius.xxl - 1,
    padding: ms(18),
    backgroundColor: CARD_BG,
    overflow: 'hidden',
  },
  creditSheen: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: ms(140),
    left: 0,
  },
  creditTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  creditLabel: { color: colors.textCaption, fontSize: ms(10), fontWeight: '700', letterSpacing: 1.2, marginBottom: vs(6) },
  creditAmountRow: { flexDirection: 'row', alignItems: 'center', gap: s(8) },
  creditDiamondWrap: {
    width: ms(30),
    height: ms(30),
    borderRadius: ms(9),
    alignItems: 'center',
    justifyContent: 'center',
  },
  creditAmount: { color: colors.textPrimary, fontSize: ms(30), fontWeight: '900', letterSpacing: -1 },
  creditUnit: { color: colors.textCaption, fontSize: ms(14), fontWeight: '600', alignSelf: 'flex-end', marginBottom: vs(4) },
  creditSub: { color: colors.textCaption, fontSize: ms(11), marginTop: vs(4) },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(4),
    borderRadius: radius.pill,
    paddingHorizontal: s(16),
    paddingVertical: vs(10),
  },
  addBtnText: { color: '#fff', fontSize: ms(14), fontWeight: '700' },

  // ── Metrics
  metricsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: s(10),
  },
  metricCard: { flex: 1 },
  metricInner: {
    flex: 1,
    minHeight: ms(132),
    borderRadius: radius.xxl,
    padding: ms(12),
    alignItems: 'center',
    justifyContent: 'center',
    gap: vs(4),
    backgroundColor: CARD_BG,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.06)',
    ...shadow.md,
  },
  metricIcon: {
    width: ms(34),
    height: ms(34),
    borderRadius: ms(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: { fontSize: ms(10), color: colors.muted, fontWeight: '600', letterSpacing: 0.3 },
  metricTrend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(2),
    marginTop: vs(2),
  },
  metricTrendHidden: { opacity: 0 },

  // ── Sticky compact header
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  stickyHeaderInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: vs(10),
  },
  stickyHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: s(8) },
  stickyHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: s(10),
    paddingVertical: vs(5),
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  stickyLogo: {
    width: ms(28),
    height: ms(28),
    borderRadius: ms(9),
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Section headers
  sectionPad: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xxxl,
    marginBottom: vs(12),
  },
  sectionTitle: { fontSize: ms(20), fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.4 },
  sectionSub: { fontSize: ms(12), color: colors.textCaption, marginTop: vs(2) },

  // Live badge
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(5),
    backgroundColor: colors.successSubtle,
    paddingHorizontal: s(11),
    paddingVertical: vs(5),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderSuccess,
  },
  liveBadgeDot: { width: ms(6), height: ms(6), borderRadius: ms(3), backgroundColor: colors.success },
  liveBadgeText: { color: colors.success, fontSize: ms(10), fontWeight: '800', letterSpacing: 0.8 },

  // ── Market Pulse
  pulseScrollContent: { paddingHorizontal: spacing.lg, gap: s(10), paddingBottom: vs(4) },
  pulseCard: {
    borderRadius: radius.xxl,
    overflow: 'hidden',
  },
  pulseCardActive: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  pulseGlow: {
    borderRadius: radius.xxl,
    backgroundColor: colors.accentSubtle,
  },
  pulseCardInner: {
    width: ms(108),
    padding: ms(12),
    alignItems: 'center',
    gap: vs(5),
  },
  pulseEmojiWrap: {
    width: ms(46),
    height: ms(46),
    borderRadius: ms(23),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  pulseEmoji: { fontSize: ms(24) },
  pulseScoreRow: { flexDirection: 'row', alignItems: 'baseline', gap: s(1) },
  pulseScore: { fontSize: ms(24), fontWeight: '900', letterSpacing: -0.5 },
  pulseMax: { fontSize: ms(11), color: colors.textCaption, fontWeight: '600' },
  pulseCat: { fontSize: ms(10), fontWeight: '700', textAlign: 'center', color: colors.textCaption },
  pulseTrendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(3),
    borderRadius: radius.pill,
    paddingHorizontal: s(7),
    paddingVertical: vs(3),
  },
  pulseTrendText: { fontSize: ms(10), fontWeight: '700' },
  hotBadge: { position: 'absolute', top: vs(7), right: s(7), borderRadius: radius.pill, overflow: 'hidden' },
  hotGrad: { paddingHorizontal: s(6), paddingVertical: vs(2) },
  hotText: { color: '#fff', fontSize: ms(8), fontWeight: '900', letterSpacing: 0.8 },

  // ── Top Opportunity
  topCard: {
    borderRadius: radius.xxl,
    overflow: 'hidden',
    backgroundColor: CARD_BG,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.06)',
    ...shadow.md,
  },
  topAccentStripe: { height: ms(3) },
  topCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: ms(16),
    gap: ms(12),
  },
  topImage: {
    width: ms(70),
    height: ms(70),
    borderRadius: radius.lg,
    backgroundColor: colors.heroLight,
  },
  topInfo: { flex: 1 },
  topCategoryRow: { marginBottom: vs(4) },
  topCategoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(192,139,48,0.2)',
    borderRadius: radius.sm,
    paddingHorizontal: s(8),
    paddingVertical: vs(2),
    borderWidth: 1,
    borderColor: 'rgba(192,139,48,0.3)',
  },
  topCategoryText: { fontSize: ms(9), fontWeight: '800', color: colors.accent, letterSpacing: 1 },
  topTitle: { fontSize: ms(14), fontWeight: '700', color: colors.textPrimary, lineHeight: ms(20), marginBottom: vs(6) },
  scoreRing: {
    width: ms(52),
    height: ms(52),
    borderRadius: ms(26),
    overflow: 'hidden',
    padding: ms(2),
  },
  scoreRingGrad: { flex: 1, borderRadius: ms(24), padding: ms(2) },
  scoreRingInner: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: ms(22),
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreRingNum: { color: colors.textPrimary, fontSize: ms(16), fontWeight: '900', lineHeight: ms(18) },
  scoreRingDen: { color: colors.textCaption, fontSize: ms(9) },

  topStatRow: {
    flexDirection: 'row',
    marginHorizontal: ms(16),
    marginBottom: ms(12),
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.lg,
    padding: ms(12),
  },
  topStat: { flex: 1, alignItems: 'center' },
  topStatLabel: { fontSize: ms(9), color: colors.textCaption, fontWeight: '700', letterSpacing: 0.6 },
  topStatValue: { fontSize: ms(14), fontWeight: '900', color: colors.textPrimary, marginTop: vs(3) },
  topStatDivider: { width: 1, backgroundColor: colors.divider, marginVertical: vs(2) },

  scorePill: {
    backgroundColor: colors.premiumSubtle,
    borderRadius: radius.pill,
    paddingHorizontal: s(12),
    paddingVertical: vs(5),
    borderWidth: 1,
    borderColor: colors.premium,
  },
  scorePillText: { color: colors.accent, fontSize: ms(13), fontWeight: '900' },

  topCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(6),
    paddingBottom: ms(14),
  },
  topCtaText: { color: colors.textCaption, fontSize: ms(12), fontWeight: '600', flex: 1, textAlign: 'center' },

  // ── Quick Actions
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: vs(12),
  },
  actionBtn: { alignItems: 'center', gap: ms(9), flex: 1 },
  actionIcon: {
    width: ms(58),
    height: ms(58),
    borderRadius: ms(20),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: ms(4) },
    shadowOpacity: 0.35,
    shadowRadius: ms(8),
    elevation: 5,
  },
  actionLabel: { fontSize: ms(11), fontWeight: '700', color: colors.textSecondary },

  // ── AI Score card
  aiCard: {
    borderRadius: radius.xxl,
    overflow: 'hidden',
    marginTop: spacing.sm,
    backgroundColor: CARD_BG,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.06)',
    ...shadow.md,
  },
  aiCardInner: { padding: ms(18) },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(12),
    marginBottom: vs(18),
  },
  aiIconBox: {
    width: ms(40),
    height: ms(40),
    borderRadius: ms(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiTitle: { fontSize: ms(16), fontWeight: '900', color: colors.textPrimary },
  aiSub: { fontSize: ms(12), color: colors.muted, marginTop: vs(2) },

  dimsWrap: { gap: vs(10), marginBottom: vs(16) },
  dimRow: { flexDirection: 'row', alignItems: 'center', gap: s(10) },
  dimLabel: { width: ms(72), fontSize: ms(11), color: colors.muted, fontWeight: '600' },
  dimBarBg: {
    flex: 1,
    height: ms(6),
    backgroundColor: colors.divider,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  dimBarFill: { height: '100%', borderRadius: radius.pill },
  dimBarFillAnimated: { height: '100%', borderRadius: radius.pill, overflow: 'hidden' },
  dimWeight: { width: ms(34), fontSize: ms(11), fontWeight: '800', textAlign: 'right' },

  aiCta: { borderRadius: radius.xl, overflow: 'hidden' },
  aiCtaInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(6),
    padding: ms(12),
    borderRadius: radius.xl,
  },
  aiCtaText: { color: colors.accent, fontSize: ms(13), fontWeight: '700' },

  // ── What's Trending (HN)
  hnBadge: {
    backgroundColor: 'rgba(255,102,0,0.15)',
    borderRadius: radius.pill,
    paddingHorizontal: s(12),
    paddingVertical: vs(5),
    borderWidth: 1,
    borderColor: 'rgba(255,102,0,0.3)',
  },
  hnBadgeText: { color: '#FF6600', fontSize: ms(11), fontWeight: '700', letterSpacing: 0.3 },

  trendScrollContent: { paddingHorizontal: spacing.lg, gap: s(10), paddingBottom: vs(4) },
  trendCard: {
    borderRadius: radius.xxl,
    overflow: 'hidden',
  },
  trendCardInner: {
    width: ms(190),
    height: ms(155),
    padding: ms(14),
  },
  trendTopRow: { flexDirection: 'row', alignItems: 'center', gap: s(6), flexWrap: 'wrap' },
  trendCatBadge: {
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.sm,
    paddingHorizontal: s(7),
    paddingVertical: vs(2),
  },
  trendCatText: { color: colors.textCaption, fontSize: ms(9), fontWeight: '700', letterSpacing: 0.4 },
  trendStatusBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: s(6),
    paddingVertical: vs(2),
  },
  trendStatusText: { fontSize: ms(9), fontWeight: '900', letterSpacing: 0.6 },
  trendTitle: {
    fontSize: ms(13),
    fontWeight: '700',
    color: '#F1F5F9',
    lineHeight: ms(19),
    flex: 1,
    marginVertical: vs(6),
  },
  trendStatsRow: { flexDirection: 'row', alignItems: 'center', gap: s(10) },
  trendStat: { flexDirection: 'row', alignItems: 'center', gap: s(3) },
  trendStatText: { color: 'rgba(255,255,255,0.5)', fontSize: ms(11), fontWeight: '600' },
  trendTime: { color: 'rgba(255,255,255,0.3)', fontSize: ms(10), marginLeft: 'auto' },
});
