import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useSettingsStore } from '../stores/useSettingsStore';
import { colors, gradients } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { ms, s, vs } from '../theme/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

interface Slide {
  id: string;
  emoji: string;
  badge: string;
  badgeIcon: string;
  title: string;
  highlight: string;
  body: string;
  stats: { value: string; label: string }[];
  gradientColors: [string, string, string];
  accentColor: string;
  ctaText: string;
}

const SLIDES: Slide[] = [
  {
    id: 'discover',
    emoji: '🔭',
    badge: 'STEP 1',
    badgeIcon: '01',
    title: 'Find winning products',
    highlight: 'before your competition.',
    body: 'TrendPro scans live Amazon catalogs and social buzz signals to surface what is trending right now — not last month.',
    stats: [
      { value: '50K+', label: 'Products tracked' },
      { value: '8 cats', label: 'Live categories' },
      { value: 'Daily', label: 'Fresh data' },
    ],
    gradientColors: [colors.heroLight, colors.heroMid, colors.heroDark],
    accentColor: colors.accent,
    ctaText: 'Next',
  },
  {
    id: 'score',
    emoji: '⚖️',
    badge: 'STEP 2',
    badgeIcon: '02',
    title: 'AI scores every product',
    highlight: 'across 7 dimensions.',
    body: 'Demand · Profit · Competition · Social Buzz · Shipping · Rating · Risk — each weighted and combined into one winning score.',
    stats: [
      { value: '0–100', label: 'Winning score' },
      { value: '7', label: 'AI dimensions' },
      { value: '< 2s', label: 'Score time' },
    ],
    gradientColors: [colors.successDark, colors.success, colors.heroDark],
    accentColor: colors.success,
    ctaText: 'Next',
  },
  {
    id: 'unlock',
    emoji: '🔓',
    badge: 'STEP 3',
    badgeIcon: '03',
    title: 'Unlock premium insights',
    highlight: 'for the top opportunities.',
    body: 'Spend USDC credits to reveal supplier sourcing angles, proven ad copy, target audiences, and a ready-to-run test plan.',
    stats: [
      { value: '9–10', label: 'Score to unlock' },
      { value: '3 credits', label: 'Per unlock' },
      { value: '~$10K', label: 'Avg opportunity' },
    ],
    gradientColors: [colors.heroDark, colors.heroMid, colors.heroLight],
    accentColor: colors.premium,
    ctaText: 'Next',
  },
  {
    id: 'start',
    emoji: '🚀',
    badge: 'GET STARTED',
    badgeIcon: '→',
    title: 'Your next winning product',
    highlight: 'is already waiting.',
    body: 'You start with 2 free credits. No credit card required. Find your first winning product in under 3 minutes.',
    stats: [
      { value: '2', label: 'Free credits' },
      { value: '< 3 min', label: 'To first win' },
      { value: 'USDC', label: 'Secure payments' },
    ],
    gradientColors: [colors.heroDark, colors.heroMid, colors.heroDark],
    accentColor: colors.accent,
    ctaText: '🚀  Start Finding Winners',
  },
];

export const OnboardingScreen: React.FC<Props> = () => {
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);
  const markOnboardingComplete = useSettingsStore((s) => s.markOnboardingComplete);
  const scrollX = useSharedValue(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollX.value = e.nativeEvent.contentOffset.x;
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== index) setIndex(i);
  };

  const finish = () => {
    // AppNavigator watches `onboardingComplete` and conditionally renders
    // either the Auth flow or MainApp — no explicit navigation needed here.
    markOnboardingComplete();
  };

  const goNext = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
      setIndex(index + 1);
    } else {
      finish();
    }
  };

  const currentSlide = SLIDES[index];

  return (
    <LinearGradient colors={gradients.heroDark} style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

        {/* Top bar */}
        <View style={styles.topBar}>
          <View style={styles.logoRow}>
            <LinearGradient
              colors={gradients.accent}
              style={styles.logoCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.logoText}>TP</Text>
            </LinearGradient>
            <Text style={styles.appName}>TrendPro</Text>
          </View>
          <TouchableOpacity onPress={finish} style={styles.skipBtn}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {/* Slides */}
        <FlatList
          ref={listRef}
          data={SLIDES}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={16}
          renderItem={({ item, index: i }) => (
            <OnboardingSlide item={item} slideIndex={i} scrollX={scrollX} />
          )}
        />

        {/* Bottom section */}
        <View style={styles.bottomSection}>
          {/* Dot progress */}
          <View style={styles.dotsRow}>
            {SLIDES.map((slide, i) => (
              <AnimatedDot
                key={slide.id}
                dotIndex={i}
                scrollX={scrollX}
                accentColor={slide.accentColor}
              />
            ))}
          </View>

          {/* CTA button */}
          <TouchableOpacity
            onPress={goNext}
            activeOpacity={0.85}
            style={styles.ctaWrap}
          >
            <LinearGradient
              colors={
                index === SLIDES.length - 1
                  ? gradients.gold
                  : [currentSlide.accentColor, currentSlide.accentColor + 'CC']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaBtn}
            >
              <Text style={styles.ctaLabel}>{currentSlide.ctaText}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>
            No credit card required · USDC demo mode active
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const OnboardingSlide: React.FC<{
  item: Slide;
  slideIndex: number;
  scrollX: Animated.SharedValue<number>;
}> = ({ item, slideIndex, scrollX }) => {
  const contentStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [(slideIndex - 1) * width, slideIndex * width, (slideIndex + 1) * width],
      [0, 1, 0],
      Extrapolation.CLAMP,
    );
    const translateY = interpolate(
      scrollX.value,
      [(slideIndex - 1) * width, slideIndex * width, (slideIndex + 1) * width],
      [40, 0, 40],
      Extrapolation.CLAMP,
    );
    return { opacity, transform: [{ translateY }] };
  });

  const illustrationStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollX.value,
      [(slideIndex - 1) * width, slideIndex * width, (slideIndex + 1) * width],
      [0.7, 1, 0.7],
      Extrapolation.CLAMP,
    );
    return { transform: [{ scale }] };
  });

  return (
    <View style={[styles.slide, { width }]}>
      {/* Illustration */}
      <Animated.View style={[styles.illustrationWrap, illustrationStyle]}>
        <LinearGradient
          colors={item.gradientColors as any}
          style={styles.illustrationGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Glow ring */}
          <View style={[styles.glowRing, { borderColor: item.accentColor + '40' }]} />
          <Text style={styles.illustrationEmoji}>{item.emoji}</Text>
        </LinearGradient>

        {/* Step badge */}
        <View style={[styles.stepBadge, { backgroundColor: item.accentColor + '25', borderColor: item.accentColor + '60' }]}>
          <Text style={[styles.stepBadgeText, { color: item.accentColor }]}>
            {item.badge}
          </Text>
        </View>
      </Animated.View>

      {/* Content */}
      <Animated.View style={[styles.slideContent, contentStyle]}>
        <Text style={styles.slideTitle}>
          {item.title}{' '}
          <Text style={[styles.slideTitleHighlight, { color: item.accentColor }]}>
            {item.highlight}
          </Text>
        </Text>
        <Text style={styles.slideBody}>{item.body}</Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {item.stats.map((stat, i) => (
            <View key={i} style={styles.statItem}>
              <Text style={[styles.statValue, { color: item.accentColor }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

// Pre-compute on the JS thread — ms() is not a Reanimated worklet and cannot
// be called from useAnimatedStyle (which runs on the UI thread).
const DOT_SIZE_INACTIVE = ms(8);
const DOT_SIZE_ACTIVE = ms(28);

const AnimatedDot: React.FC<{
  dotIndex: number;
  scrollX: Animated.SharedValue<number>;
  accentColor: string;
}> = ({ dotIndex, scrollX, accentColor }) => {
  const style = useAnimatedStyle(() => {
    const w = interpolate(
      scrollX.value,
      [(dotIndex - 1) * width, dotIndex * width, (dotIndex + 1) * width],
      [DOT_SIZE_INACTIVE, DOT_SIZE_ACTIVE, DOT_SIZE_INACTIVE],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      scrollX.value,
      [(dotIndex - 1) * width, dotIndex * width, (dotIndex + 1) * width],
      [0.25, 1, 0.25],
      Extrapolation.CLAMP,
    );
    return {
      width: withSpring(w, { damping: 18, stiffness: 200 }),
      opacity,
      backgroundColor: accentColor,
    };
  });
  return <Animated.View style={[styles.dot, style]} />;
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: ms(10) },
  logoCircle: {
    width: ms(36),
    height: ms(36),
    borderRadius: ms(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { color: colors.white, fontSize: ms(14), fontWeight: '800' },
  appName: { color: colors.white, fontSize: ms(20), fontWeight: '800', letterSpacing: -0.5 },
  skipBtn: { paddingVertical: vs(6), paddingHorizontal: s(12) },
  skipText: { color: 'rgba(255,255,255,0.4)', fontSize: ms(14), fontWeight: '500' },

  slide: {
    paddingHorizontal: spacing.xl,
    paddingTop: vs(8),
    alignItems: 'center',
  },

  illustrationWrap: {
    alignItems: 'center',
    marginBottom: vs(28),
  },
  illustrationGradient: {
    width: ms(200),
    height: ms(200),
    borderRadius: ms(100),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: ms(12) },
    shadowOpacity: 0.5,
    shadowRadius: ms(24),
    elevation: 16,
  },
  glowRing: {
    position: 'absolute',
    width: ms(224),
    height: ms(224),
    borderRadius: ms(112),
    borderWidth: 1.5,
  },
  illustrationEmoji: { fontSize: ms(72) },
  stepBadge: {
    marginTop: vs(14),
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingVertical: vs(5),
    paddingHorizontal: s(16),
  },
  stepBadgeText: { fontSize: ms(11), fontWeight: '800', letterSpacing: ms(1.5) },

  slideContent: { alignItems: 'center', width: '100%' , },
  slideTitle: {
    fontSize: ms(26),
    fontWeight: '800',
    color: colors.white,
    textAlign: 'center',
    lineHeight: ms(34),
    marginBottom: vs(12),
    letterSpacing: -0.5,
  },
  slideTitleHighlight: { fontWeight: '800' },
  slideBody: {
    fontSize: ms(15),
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    lineHeight: ms(24),
    marginBottom: vs(24),
    paddingHorizontal: s(4),
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: s(0),
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    //paddingVertical: vs(16),
    paddingHorizontal: s(8),
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
  },
  statValue: { fontSize: ms(20), fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { fontSize: ms(11), color: 'rgba(255,255,255,0.45)', marginTop: vs(2), fontWeight: '500' },

  bottomSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: vs(8),
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: ms(6),
    marginBottom: vs(20),
  },
  dot: {
    height: ms(8),
    borderRadius: ms(4),
  },

  ctaWrap: { borderRadius: radius.xl, overflow: 'hidden', marginBottom: vs(14) },
  ctaBtn: {
    paddingVertical: vs(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: {
    fontSize: ms(17),
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.2,
  },
  disclaimer: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: ms(11),
    textAlign: 'center',
  },
});
