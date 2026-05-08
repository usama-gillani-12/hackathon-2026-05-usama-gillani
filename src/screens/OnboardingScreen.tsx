import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useSettingsStore } from '../stores/useSettingsStore';
import { colors, gradients } from '../theme/colors';
import { radius, shadow } from '../theme/spacing';
import { ms, s, vs } from '../theme/responsive';
import { hapticLight, hapticMedium, hapticSuccess } from '../utils/haptics';
import { AppText } from '../components/AppText';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width: SCREEN_W } = Dimensions.get('window');

const SOCIAL_PROOFS = [
  'Find winners 30 days early',
  '$2.4M in tracked products',
  'Trusted by 10k+ sellers',
] as const;

// ── Slide 1 illustration — live discovery chart ───────────────────────────────

const IllustrationDiscover: React.FC = () => {
  const bar1H = useSharedValue(0);
  const bar2H = useSharedValue(0);
  const bar3H = useSharedValue(0);
  const bar4H = useSharedValue(0);
  const badgeY = useSharedValue(0);
  const scoreScale = useSharedValue(0);

  useEffect(() => {
    bar1H.value = withDelay(100, withTiming(1, { duration: 700 }));
    bar2H.value = withDelay(220, withTiming(1, { duration: 700 }));
    bar3H.value = withDelay(340, withTiming(1, { duration: 700 }));
    bar4H.value = withDelay(460, withTiming(1, { duration: 700 }));
    scoreScale.value = withDelay(700, withSpring(1, { damping: 14, stiffness: 120 }));
    badgeY.value = withRepeat(
      withSequence(withTiming(-6, { duration: 1600 }), withTiming(0, { duration: 1600 })),
      -1, false,
    );
  }, []);

  const BAR_HEIGHTS = [vs(48), vs(72), vs(58), vs(90)];
  const BAR_COLORS: [string, string][] = [
    ['rgba(192,139,48,0.35)', 'rgba(192,139,48,0.7)'],
    ['rgba(192,139,48,0.5)', 'rgba(192,139,48,0.85)'],
    ['rgba(192,139,48,0.4)', 'rgba(192,139,48,0.75)'],
    [colors.premium, colors.accent],
  ];

  const bar1Style = useAnimatedStyle(() => ({ height: BAR_HEIGHTS[0] * bar1H.value }));
  const bar2Style = useAnimatedStyle(() => ({ height: BAR_HEIGHTS[1] * bar2H.value }));
  const bar3Style = useAnimatedStyle(() => ({ height: BAR_HEIGHTS[2] * bar3H.value }));
  const bar4Style = useAnimatedStyle(() => ({ height: BAR_HEIGHTS[3] * bar4H.value }));
  const barStyles = [bar1Style, bar2Style, bar3Style, bar4Style];

  const badgeStyle = useAnimatedStyle(() => ({ transform: [{ translateY: badgeY.value }] }));
  const scoreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
    opacity: scoreScale.value,
  }));

  return (
    <View style={illu.root}>
      {/* Background glow */}
      <LinearGradient
        colors={['rgba(192,139,48,0.12)', 'transparent']}
        style={illu.glow}
      />

      {/* Glass card */}
      <View style={illu.card}>
        <View style={illu.cardHeader}>
          <View style={illu.cardDot} />
          <View style={[illu.cardDot, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
          <View style={[illu.cardDot, { backgroundColor: 'rgba(255,255,255,0.12)' }]} />
        </View>

        {/* Chart bars */}
        <View style={illu.chartArea}>
          {BAR_COLORS.map((cols, i) => (
            <View key={i} style={illu.barWrap}>
              <Animated.View style={[illu.barBase, barStyles[i]]}>
                <LinearGradient colors={cols} style={{ flex: 1, borderRadius: ms(4) }} />
              </Animated.View>
            </View>
          ))}
        </View>

        {/* X-axis labels */}
        <View style={illu.xAxis}>
          {['Jan', 'Feb', 'Mar', 'Apr'].map((m) => (
            <AppText key={m} variant="caption2" color="rgba(255,255,255,0.3)" style={illu.xLabel}>
              {m}
            </AppText>
          ))}
        </View>
      </View>

      {/* Floating hot badge */}
      <Animated.View style={[illu.hotBadge, badgeStyle]}>
        <LinearGradient colors={gradients.premium} style={illu.hotBadgeInner}>
          <AppText variant="caption2" color={colors.white} uppercase>🔥 Trending</AppText>
        </LinearGradient>
      </Animated.View>

      {/* Score chip */}
      <Animated.View style={[illu.scoreChip, scoreStyle]}>
        <LinearGradient colors={gradients.gold} style={illu.scoreChipInner}>
          <AppText variant="caption2" color={colors.white} uppercase tabular>9.4</AppText>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

// ── Slide 2 illustration — AI scoring rings ───────────────────────────────────

const IllustrationScore: React.FC = () => {
  const ringScale = useSharedValue(0);
  const ring2Scale = useSharedValue(0);
  const badge1X = useSharedValue(0);
  const badge2X = useSharedValue(0);
  const badge3X = useSharedValue(0);

  useEffect(() => {
    ringScale.value = withDelay(80, withSpring(1, { damping: 16, stiffness: 100 }));
    ring2Scale.value = withDelay(220, withSpring(1, { damping: 14, stiffness: 90 }));

    badge1X.value = withRepeat(
      withSequence(withTiming(4, { duration: 2000 }), withTiming(-4, { duration: 2000 })), -1, false,
    );
    badge2X.value = withRepeat(
      withSequence(withTiming(-5, { duration: 2400 }), withTiming(5, { duration: 2400 })), -1, false,
    );
    badge3X.value = withRepeat(
      withSequence(withTiming(3, { duration: 1800 }), withTiming(-3, { duration: 1800 })), -1, false,
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({ transform: [{ scale: ringScale.value }], opacity: ringScale.value }));
  const ring2Style = useAnimatedStyle(() => ({ transform: [{ scale: ring2Scale.value }], opacity: ring2Scale.value * 0.5 }));
  const badge1Style = useAnimatedStyle(() => ({ transform: [{ translateX: badge1X.value }] }));
  const badge2Style = useAnimatedStyle(() => ({ transform: [{ translateX: badge2X.value }] }));
  const badge3Style = useAnimatedStyle(() => ({ transform: [{ translateX: badge3X.value }] }));

  const DIMS = [
    { label: 'Demand', color: colors.accent, pct: 94 },
    { label: 'Buzz', color: colors.success, pct: 81 },
    { label: 'Profit', color: colors.premium, pct: 88 },
  ];

  return (
    <View style={illu.root}>
      <LinearGradient colors={['rgba(46,125,90,0.10)', 'transparent']} style={illu.glow} />

      {/* Outer ring */}
      <Animated.View style={[illu.outerRing, ring2Style]} />
      <Animated.View style={[illu.innerRing, ringStyle]}>
        {/* Score number */}
        <View style={illu.scoreCenter}>
          <AppText variant="largeTitle" color={colors.white} tabular style={illu.scoreBig}>8.9</AppText>
          <AppText variant="caption2" color="rgba(255,255,255,0.4)" uppercase>Score</AppText>
        </View>
      </Animated.View>

      {/* Dimension badges */}
      <Animated.View style={[illu.dimBadge, illu.dimBadge1, badge1Style]}>
        <View style={[illu.dimDot, { backgroundColor: DIMS[0].color }]} />
        <AppText variant="caption2" color="rgba(255,255,255,0.8)">{DIMS[0].label}</AppText>
        <AppText variant="caption2" color={DIMS[0].color} tabular> {DIMS[0].pct}%</AppText>
      </Animated.View>
      <Animated.View style={[illu.dimBadge, illu.dimBadge2, badge2Style]}>
        <View style={[illu.dimDot, { backgroundColor: DIMS[1].color }]} />
        <AppText variant="caption2" color="rgba(255,255,255,0.8)">{DIMS[1].label}</AppText>
        <AppText variant="caption2" color={DIMS[1].color} tabular> {DIMS[1].pct}%</AppText>
      </Animated.View>
      <Animated.View style={[illu.dimBadge, illu.dimBadge3, badge3Style]}>
        <View style={[illu.dimDot, { backgroundColor: DIMS[2].color }]} />
        <AppText variant="caption2" color="rgba(255,255,255,0.8)">{DIMS[2].label}</AppText>
        <AppText variant="caption2" color={DIMS[2].color} tabular> {DIMS[2].pct}%</AppText>
      </Animated.View>
    </View>
  );
};

// ── Slide 3 illustration — credits / value ────────────────────────────────────

const IllustrationStart: React.FC = () => {
  const cardScale = useSharedValue(0);
  const creditPulse = useSharedValue(1);
  const starFloat = useSharedValue(0);

  useEffect(() => {
    cardScale.value = withDelay(100, withSpring(1, { damping: 15, stiffness: 110 }));
    creditPulse.value = withRepeat(
      withSequence(withTiming(1.06, { duration: 1000 }), withTiming(1, { duration: 1000 })),
      -1, true,
    );
    starFloat.value = withRepeat(
      withSequence(withTiming(-8, { duration: 2200 }), withTiming(0, { duration: 2200 })),
      -1, false,
    );
  }, []);

  const cardStyle = useAnimatedStyle(() => ({ transform: [{ scale: cardScale.value }], opacity: cardScale.value }));
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: creditPulse.value }] }));
  const starStyle = useAnimatedStyle(() => ({ transform: [{ translateY: starFloat.value }] }));

  return (
    <View style={illu.root}>
      <LinearGradient colors={['rgba(192,139,48,0.14)', 'transparent']} style={illu.glow} />

      {/* Credit card */}
      <Animated.View style={[illu.creditCard, cardStyle]}>
        <LinearGradient
          colors={['#1A1A1A', '#2D2D2D']}
          style={{ flex: 1, borderRadius: ms(16), padding: s(16) }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <AppText variant="caption2" color="rgba(255,255,255,0.4)" uppercase>TrendPro Credits</AppText>
            <MaterialCommunityIcons name="diamond" size={ms(14)} color={colors.premium} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: ms(4), marginTop: vs(10) }}>
            <AppText variant="title1" color={colors.white} tabular style={{ fontSize: ms(36) }}>2</AppText>
            <AppText variant="subhead" color="rgba(255,255,255,0.5)">free credits</AppText>
          </View>
          {/* Gold shimmer line */}
          <LinearGradient
            colors={[colors.premium, colors.accent, 'transparent']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ height: 1, marginTop: vs(12), opacity: 0.5 }}
          />
        </LinearGradient>
        {/* Hairline border */}
        <LinearGradient
          colors={[colors.premium, 'transparent', colors.accent]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      </Animated.View>

      {/* Pulsing "free" badge */}
      <Animated.View style={[illu.freeBadge, pulseStyle]}>
        <LinearGradient colors={gradients.premium} style={illu.freeBadgeInner}>
          <MaterialCommunityIcons name="gift-outline" size={ms(11)} color={colors.white} />
          <AppText variant="caption2" color={colors.white} uppercase> No card needed</AppText>
        </LinearGradient>
      </Animated.View>

      {/* Floating stars */}
      <Animated.View style={[illu.star1, starStyle]}>
        <MaterialCommunityIcons name="star" size={ms(12)} color={colors.premium} />
      </Animated.View>
      <View style={illu.star2}>
        <MaterialCommunityIcons name="star" size={ms(8)} color="rgba(192,139,48,0.4)" />
      </View>
    </View>
  );
};

// ── Illustration styles ────────────────────────────────────────────────────────

const illu = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: ms(260),
    height: ms(260),
    borderRadius: ms(130),
    top: '10%',
  },

  // Slide 1 — chart
  card: {
    width: s(220),
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: ms(16),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: s(14),
    ...shadow.md,
  },
  cardHeader: { flexDirection: 'row', gap: s(4), marginBottom: vs(10) },
  cardDot: { width: ms(7), height: ms(7), borderRadius: ms(4), backgroundColor: colors.premium },
  chartArea: { flexDirection: 'row', alignItems: 'flex-end', gap: s(8), height: vs(90) },
  barWrap: { flex: 1, justifyContent: 'flex-end' },
  barBase: { width: '100%', borderRadius: ms(4), overflow: 'hidden' },
  xAxis: { flexDirection: 'row', marginTop: vs(6), gap: s(8) },
  xLabel: { flex: 1, textAlign: 'center' },

  hotBadge: {
    position: 'absolute',
    top: '10%',
    right: s(24),
    borderRadius: radius.pill,
    overflow: 'hidden',
    ...shadow.sm,
  },
  hotBadgeInner: {
    paddingHorizontal: s(10),
    paddingVertical: vs(5),
  },

  scoreChip: {
    position: 'absolute',
    bottom: '14%',
    left: s(24),
    borderRadius: radius.pill,
    overflow: 'hidden',
    ...shadow.sm,
  },
  scoreChipInner: {
    paddingHorizontal: s(12),
    paddingVertical: vs(6),
  },

  // Slide 2 — score rings
  outerRing: {
    width: ms(200),
    height: ms(200),
    borderRadius: ms(100),
    borderWidth: 1,
    borderColor: 'rgba(46,125,90,0.3)',
    position: 'absolute',
  },
  innerRing: {
    width: ms(150),
    height: ms(150),
    borderRadius: ms(75),
    borderWidth: 2,
    borderColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(46,125,90,0.08)',
    ...shadow.sm,
  },
  scoreCenter: { alignItems: 'center' },
  scoreBig: { lineHeight: ms(42) },

  dimBadge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: s(10),
    paddingVertical: vs(5),
    gap: s(4),
  },
  dimBadge1: { top: '8%', right: s(20) },
  dimBadge2: { bottom: '22%', left: s(12) },
  dimBadge3: { bottom: '8%', right: s(28) },
  dimDot: { width: ms(6), height: ms(6), borderRadius: ms(3) },

  // Slide 3 — credits card
  creditCard: {
    width: s(240),
    height: vs(110),
    borderRadius: ms(16),
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(192,139,48,0.25)',
    ...shadow.lg,
    shadowColor: colors.premium,
  },
  freeBadge: {
    position: 'absolute',
    bottom: '12%',
    right: s(20),
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  freeBadgeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(10),
    paddingVertical: vs(5),
  },
  star1: { position: 'absolute', top: '10%', left: s(30) },
  star2: { position: 'absolute', top: '25%', right: s(22) },
});

// ── Slide data ─────────────────────────────────────────────────────────────────

interface Slide {
  id: string;
  illustration: React.ReactNode;
  eyebrow: string;
  title: string;
  highlight: string;
  body: string;
  accentColor: string;
}

const SLIDES: Slide[] = [
  {
    id: 'discover',
    illustration: <IllustrationDiscover />,
    eyebrow: 'STEP 01 / 03',
    title: 'Find products that',
    highlight: 'sell before others find them.',
    body: 'TrendPro scans live Amazon catalogs and social buzz signals to surface what is trending right now — not last month.',
    accentColor: colors.accent,
  },
  {
    id: 'score',
    illustration: <IllustrationScore />,
    eyebrow: 'STEP 02 / 03',
    title: 'AI scores every deal',
    highlight: 'across 7 winning dimensions.',
    body: 'Demand, profit, competition, social buzz, shipping, rating and risk — each weighted into one clean score you can act on.',
    accentColor: colors.success,
  },
  {
    id: 'start',
    illustration: <IllustrationStart />,
    eyebrow: 'STEP 03 / 03',
    title: 'Start finding',
    highlight: 'your first winner today.',
    body: 'Two free credits. No credit card. Find your first winning product in under 3 minutes.',
    accentColor: colors.premium,
  },
];

// ── Worm dot ──────────────────────────────────────────────────────────────────

const DOT_INACTIVE = ms(6);
const DOT_ACTIVE = ms(24);

const WormDot: React.FC<{ index: number; scrollX: Animated.SharedValue<number> }> = ({
  index, scrollX,
}) => {
  const style = useAnimatedStyle(() => {
    const w = interpolate(
      scrollX.value,
      [(index - 1) * SCREEN_W, index * SCREEN_W, (index + 1) * SCREEN_W],
      [DOT_INACTIVE, DOT_ACTIVE, DOT_INACTIVE],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      scrollX.value,
      [(index - 1) * SCREEN_W, index * SCREEN_W, (index + 1) * SCREEN_W],
      [0.3, 1, 0.3],
      Extrapolation.CLAMP,
    );
    return {
      width: withSpring(w, { damping: 18, stiffness: 220 }),
      opacity,
    };
  });
  return <Animated.View style={[dotStyles.dot, style]} />;
};

const dotStyles = StyleSheet.create({
  dot: { height: ms(6), borderRadius: ms(3), backgroundColor: colors.accent },
});

// ── Social proof rotator ───────────────────────────────────────────────────────

const SocialProof: React.FC = () => {
  const [proofIndex, setProofIndex] = useState(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const id = setInterval(() => {
      opacity.value = withTiming(0, { duration: 300 }, () => {
        // Note: runOnJS would be cleaner but setInterval + state is fine here
      });
      setTimeout(() => {
        setProofIndex((i) => (i + 1) % SOCIAL_PROOFS.length);
        opacity.value = withTiming(1, { duration: 300 });
      }, 320);
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[proofStyles.wrap, style]}>
      <MaterialCommunityIcons name="check-circle-outline" size={ms(12)} color={colors.accent} />
      <AppText variant="caption1" color="rgba(255,255,255,0.45)">
        {SOCIAL_PROOFS[proofIndex]}
      </AppText>
    </Animated.View>
  );
};

const proofStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: ms(5) },
});

// ── Main screen ───────────────────────────────────────────────────────────────

export const OnboardingScreen: React.FC<Props> = () => {
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useSharedValue(0);
  const markOnboardingComplete = useSettingsStore((s) => s.markOnboardingComplete);
  const isLast = index === SLIDES.length - 1;

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const handleMomentumEnd = useCallback((e: any) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    setIndex(i);
  }, []);

  const goNext = () => {
    hapticLight();
    if (index < SLIDES.length - 1) {
      const next = index + 1;
      scrollRef.current?.scrollTo({ x: next * SCREEN_W, animated: true });
      setIndex(next);
    }
  };

  const finish = () => {
    hapticSuccess();
    markOnboardingComplete();
  };

  const handleApple = () => {
    hapticMedium();
    if (__DEV__) console.log('[Onboarding] Apple sign up — stub');
    finish();
  };

  const handleEmail = () => {
    hapticLight();
    finish();
  };

  // Orb float
  const orb1Y = useSharedValue(0);
  const orb2Y = useSharedValue(0);
  useEffect(() => {
    orb1Y.value = withRepeat(
      withSequence(withTiming(-20, { duration: 4000 }), withTiming(0, { duration: 4000 })), -1, false,
    );
    orb2Y.value = withRepeat(
      withSequence(withTiming(15, { duration: 5200 }), withTiming(-10, { duration: 5200 })), -1, false,
    );
  }, []);
  const orb1Style = useAnimatedStyle(() => ({ transform: [{ translateY: orb1Y.value }] }));
  const orb2Style = useAnimatedStyle(() => ({ transform: [{ translateY: orb2Y.value }] }));

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient colors={['#0A0A0A', '#141414', '#1A1A1A']} style={StyleSheet.absoluteFill} />

      {/* Orbs */}
      <Animated.View style={[styles.orb1, orb1Style]} pointerEvents="none">
        <LinearGradient colors={['rgba(192,139,48,0.18)', 'transparent']} style={{ flex: 1 }} />
      </Animated.View>
      <Animated.View style={[styles.orb2, orb2Style]} pointerEvents="none">
        <LinearGradient colors={['rgba(46,125,90,0.12)', 'transparent']} style={{ flex: 1 }} />
      </Animated.View>

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.wordmarkRow}>
            <MaterialCommunityIcons name="trending-up" size={ms(16)} color={colors.accent} />
            <AppText variant="headline" color={colors.white} style={styles.wordmark}>TrendPro</AppText>
          </View>
          {!isLast && (
            <TouchableOpacity
              onPress={finish}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.skipBtn}
            >
              <AppText variant="subhead" color="rgba(255,255,255,0.35)">Skip</AppText>
            </TouchableOpacity>
          )}
        </View>

        {/* Slides */}
        <Animated.ScrollView
          ref={scrollRef as any}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          onMomentumScrollEnd={handleMomentumEnd}
          style={styles.slidesWrap}
        >
          {SLIDES.map((slide) => (
            <View key={slide.id} style={styles.slide}>
              {/* Illustration — clipped so absolute children can't leak */}
              <View style={styles.illuArea}>{slide.illustration}</View>

              {/* Copy */}
              <View style={styles.copyArea}>
                <AppText variant="caption2" color="rgba(255,255,255,0.3)" uppercase style={styles.eyebrow}>
                  {slide.eyebrow}
                </AppText>
                <AppText variant="title1" color={colors.white} style={styles.slideTitle}>
                  {slide.title}{' '}
                  <AppText variant="title1" color={slide.accentColor} style={styles.slideTitle}>
                    {slide.highlight}
                  </AppText>
                </AppText>
                <AppText variant="body" color="rgba(255,255,255,0.45)" style={styles.slideBody}>
                  {slide.body}
                </AppText>
              </View>
            </View>
          ))}
        </Animated.ScrollView>

        {/* ── Footer card — visually separated from scroll content ── */}
        <View style={styles.footerCard}>
          {/* Top hairline + soft scrim above for visual separation */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.35)']}
            style={styles.footerScrim}
            pointerEvents="none"
          />

          {/* Worm dots */}
          <View style={styles.dotsRow}>
            {SLIDES.map((_, i) => (
              <WormDot key={i} index={i} scrollX={scrollX} />
            ))}
          </View>

          {/* Social proof — fixed height so layout doesn't jump on fade */}
          <View style={styles.proofWrap}>
            <SocialProof />
          </View>

          {/* CTAs */}
          {isLast ? (
            // Soft signup wall
            <View style={styles.signupWall}>
              {/* Apple primary */}
              <TouchableOpacity onPress={handleApple} activeOpacity={0.88} style={styles.appleBtn}>
                <MaterialCommunityIcons name="apple" size={ms(20)} color="#FFFFFF" />
                <AppText variant="callout" color="#FFFFFF" style={styles.appleBtnText}>
                  Continue with Apple
                </AppText>
              </TouchableOpacity>

              {/* Email secondary */}
              <TouchableOpacity onPress={handleEmail} activeOpacity={0.88} style={styles.emailBtn}>
                <AppText variant="callout" color={colors.accent} style={styles.emailBtnText}>
                  Sign up with email
                </AppText>
              </TouchableOpacity>

              {/* Guest link */}
              <TouchableOpacity onPress={finish} hitSlop={{ top: 6, bottom: 6 }} style={styles.guestBtn}>
                <AppText variant="footnote" color="rgba(255,255,255,0.3)" center>
                  Continue as guest
                </AppText>
              </TouchableOpacity>
            </View>
          ) : (
            // Next button
            <TouchableOpacity onPress={goNext} activeOpacity={0.88} style={styles.nextBtn}>
              <LinearGradient
                colors={gradients.premium}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.nextBtnInner}
              >
                <AppText variant="callout" color={colors.white} style={styles.nextBtnText}>
                  Next
                </AppText>
                <MaterialCommunityIcons name="arrow-right" size={ms(18)} color={colors.white} />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },

  orb1: {
    position: 'absolute', width: ms(300), height: ms(300), borderRadius: ms(150),
    top: -ms(80), left: -ms(80), overflow: 'hidden',
  },
  orb2: {
    position: 'absolute', width: ms(240), height: ms(240), borderRadius: ms(120),
    top: ms(100), right: -ms(100), overflow: 'hidden',
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: s(24),
    paddingTop: vs(8),
    paddingBottom: vs(8),
  },
  wordmarkRow: { flexDirection: 'row', alignItems: 'center', gap: ms(6) },
  wordmark: { fontWeight: '800', letterSpacing: -0.3 },
  skipBtn: { paddingVertical: vs(6) },

  // Slides
  slidesWrap: { flex: 1 },
  slide: { width: SCREEN_W, flex: 1 },
  illuArea: {
    flex: 1.1,
    paddingHorizontal: s(24),
    overflow: 'hidden', // clip illustration's absolute children to bounds
  },
  copyArea: {
    flex: 0.9,
    paddingHorizontal: s(24),
    paddingTop: vs(8),
    paddingBottom: vs(20), // breathing room above footer card
    justifyContent: 'center',
  },
  eyebrow: { marginBottom: vs(10), letterSpacing: ms(1.4) },
  slideTitle: {
    lineHeight: ms(34),
    marginBottom: vs(10),
  },
  slideBody: {
    lineHeight: ms(24),
  },

  // ── Footer card ──
  footerCard: {
    paddingHorizontal: s(24),
    paddingTop: vs(20),
    paddingBottom: vs(10),
    gap: vs(18),
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  footerScrim: {
    position: 'absolute',
    left: 0, right: 0, top: -vs(24),
    height: vs(24),
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: ms(6),
    height: ms(8), // fixed height so animating width doesn't push siblings
  },
  proofWrap: {
    alignItems: 'center',
    height: ms(18), // fixed height — fade-out doesn't collapse the layout
    justifyContent: 'center',
  },

  // Next button
  nextBtn: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    height: vs(54),
    ...shadow.md,
    shadowColor: colors.premium,
  },
  nextBtnInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ms(8),
  },
  nextBtnText: { fontWeight: '700' },

  // Signup wall
  signupWall: { gap: vs(12) },
  appleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: s(10),
    height: vs(54), borderRadius: radius.pill,
    backgroundColor: '#000000',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    ...shadow.sm,
  },
  appleBtnText: { fontWeight: '600' },
  emailBtn: {
    height: vs(54), borderRadius: radius.pill,
    borderWidth: 1, borderColor: 'rgba(192,139,48,0.4)',
    backgroundColor: 'rgba(192,139,48,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  emailBtnText: { fontWeight: '600' },
  guestBtn: { paddingVertical: vs(6), marginTop: vs(2) },
});
