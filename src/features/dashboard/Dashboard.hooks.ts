import { useCallback, useEffect, useRef, useState } from 'react';
import { useWindowDimensions } from 'react-native';
import {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCreditStore } from '@core/stores/useCreditStore';
import { useProductStore } from '@core/stores/useProductStore';
import { getUnlockedIdSet } from '@core/services/unlockService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@theme/colors';
import { ms } from '@theme/responsive';
import { hapticLight } from '@utils/haptics';
import { DashboardStats, ScoredProduct } from '@t/product';
import { MarketPulseItem, TrendingPost } from '@t/market';
import { fetchMarketPulse, MARKET_PULSE_FALLBACK } from '@core/api/redditMarketApi';
import { fetchTrendingPosts } from '@core/api/redditTrendingApi';

export function useDashboard() {
  const { width: SCREEN_W, height: SCREEN_H } = useWindowDimensions();
  const navigation = useNavigation<any>();
  const balance = useCreditStore((s) => s.balance);
  const initCredits = useCreditStore((s) => s.initialize);
  const loadProducts = useProductStore((s) => s.load);
  const products = useProductStore((s) => s.products);
  const loading = useProductStore((s) => s.loading);
  const sourceStatus = useProductStore((s) => s.sourceStatus);
  const isAmazonLive = sourceStatus?.amazon === 'ok';
  const isAllSourcesFailed =
    !!sourceStatus &&
    sourceStatus.activeSource === 'mock' &&
    (sourceStatus.amazon === 'failed' ||
      sourceStatus.dummyJson === 'failed' ||
      sourceStatus.fakeStore === 'failed');

  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topOpportunity, setTopOpportunity] = useState<ScoredProduct | null>(null);
  const [pulseIndex, setPulseIndex] = useState(0);
  const [marketPulse, setMarketPulse] = useState<MarketPulseItem[]>(MARKET_PULSE_FALLBACK);
  const marketPulseLenRef = useRef(MARKET_PULSE_FALLBACK.length);
  const [pulseLoading, setPulseLoading] = useState(false);
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(false);

  const insets = useSafeAreaInsets();

  // ── Animated live dot (UI thread via Reanimated)
  const liveDotScale = useSharedValue(1);
  useEffect(() => {
    liveDotScale.value = withRepeat(
      withSequence(withTiming(1.5, { duration: 900 }), withTiming(1, { duration: 900 })),
      -1,
      false,
    );
  }, []);
  const liveDotStyle = useAnimatedStyle(() => ({ transform: [{ scale: liveDotScale.value }] }));

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
      if (items.length > 0) {
        setMarketPulse(items);
        marketPulseLenRef.current = items.length;
      }
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
        // Read length from ref so this callback is never a useFocusEffect dependency
        setPulseIndex((i) => (i + 1) % (marketPulseLenRef.current || 1));
      }, 2800);
      return () => clearInterval(interval);
    }, [load, loadPulse, loadTrending]),
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

  return {
    // dimensions
    SCREEN_W,
    SCREEN_H,
    // navigation
    navigation,
    // store values
    balance,
    products,
    loading,
    sourceStatus,
    isAmazonLive,
    isAllSourcesFailed,
    // safe area
    insets,
    // local state
    refreshing,
    stats,
    topOpportunity,
    pulseIndex,
    marketPulse,
    pulseLoading,
    trendingPosts,
    trendingLoading,
    // derived
    METRICS,
    // handlers
    onRefresh,
    load,
    loadPulse,
    loadTrending,
    // animated scroll
    scrollHandler,
    scrollY,
    aiSectionY,
    // animated styles
    liveDotStyle,
    orb1Style,
    orb2Style,
    orb3Style,
    glowStyle,
    sheenStyle,
    stickyHeaderStyle,
  };
}
