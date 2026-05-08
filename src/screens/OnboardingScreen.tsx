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
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useSettingsStore } from '../stores/useSettingsStore';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { ms, s, vs } from '../theme/responsive';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

interface Slide {
  id: string;
  emoji: string;
  title: string;
  highlight: string;
  body: string;
  accentColor: string;
  ctaText: string;
}

const SLIDES: Slide[] = [
  {
    id: 'discover',
    emoji: '🔭',
    title: 'Find winning products',
    highlight: 'before your competition.',
    body: 'TrendPro scans live Amazon catalogs and social buzz signals to surface what is trending right now — not last month.',
    accentColor: colors.accent,
    ctaText: 'Next',
  },
  {
    id: 'score',
    emoji: '⚖️',
    title: 'AI scores every product',
    highlight: 'across 7 dimensions.',
    body: 'Demand, profit, competition, social buzz, shipping, rating and risk — each weighted into one winning score.',
    accentColor: colors.success,
    ctaText: 'Next',
  },
  {
    id: 'unlock',
    emoji: '🔓',
    title: 'Unlock premium insights',
    highlight: 'for the top opportunities.',
    body: 'Spend USDC credits to reveal supplier sourcing angles, proven ad copy, target audiences, and a ready-to-run test plan.',
    accentColor: colors.premium,
    ctaText: 'Next',
  },
  {
    id: 'start',
    emoji: '🚀',
    title: 'Your next winning product',
    highlight: 'is already waiting.',
    body: 'Start with 2 free credits. No credit card required. Find your first winning product in under 3 minutes.',
    accentColor: colors.accent,
    ctaText: 'Start Finding Winners',
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

  const isLast = index === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={styles.wordmark}>TrendPro</Text>
          {!isLast && (
            <TouchableOpacity onPress={finish} style={styles.skipBtn} hitSlop={10}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
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
            <OnboardingSlide item={item} slideIndex={i} totalSlides={SLIDES.length} />
          )}
        />

        {/* Bottom section */}
        <View style={styles.bottomSection}>
          <View style={styles.dotsRow}>
            {SLIDES.map((slide, i) => (
              <AnimatedDot key={slide.id} dotIndex={i} scrollX={scrollX} />
            ))}
          </View>

          <TouchableOpacity
            onPress={goNext}
            activeOpacity={0.9}
            style={[
              styles.ctaBtn,
              { backgroundColor: isLast ? colors.accent : colors.primary },
            ]}
          >
            <Text style={styles.ctaLabel}>{SLIDES[index].ctaText}</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimer}>No credit card required</Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const OnboardingSlide: React.FC<{
  item: Slide;
  slideIndex: number;
  totalSlides: number;
}> = ({ item, slideIndex, totalSlides }) => {
  return (
    <View style={[styles.slide, { width }]}>
      <View style={styles.illustrationFrame}>
        <Text style={styles.illustrationEmoji}>{item.emoji}</Text>
      </View>

      <Text style={styles.eyebrow}>
        STEP {String(slideIndex + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
      </Text>

      <Text style={styles.slideTitle}>
        {item.title}{' '}
        <Text style={[styles.slideTitleHighlight, { color: item.accentColor }]}>
          {item.highlight}
        </Text>
      </Text>

      <Text style={styles.slideBody}>{item.body}</Text>
    </View>
  );
};

const DOT_SIZE_INACTIVE = ms(6);
const DOT_SIZE_ACTIVE = ms(22);

const AnimatedDot: React.FC<{
  dotIndex: number;
  scrollX: Animated.SharedValue<number>;
}> = ({ dotIndex, scrollX }) => {
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
      [0.35, 1, 0.35],
      Extrapolation.CLAMP,
    );
    return {
      width: withSpring(w, { damping: 18, stiffness: 200 }),
      opacity,
    };
  });
  return <Animated.View style={[styles.dot, style]} />;
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.page,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  wordmark: {
    color: colors.textPrimary,
    fontSize: ms(18),
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  skipBtn: { paddingVertical: vs(6), paddingHorizontal: s(8) },
  skipText: { color: colors.textCaption, fontSize: ms(14), fontWeight: '500' },

  slide: {
    paddingHorizontal: spacing.xl,
    paddingTop: vs(16),
  },

  illustrationFrame: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.xxl,
    backgroundColor: colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(36),
  },
  illustrationEmoji: { fontSize: ms(96) },

  eyebrow: {
    color: colors.textCaption,
    fontSize: ms(11),
    fontWeight: '700',
    letterSpacing: ms(1.6),
    marginBottom: vs(14),
  },

  slideTitle: {
    fontSize: ms(32),
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: ms(40),
    marginBottom: vs(14),
    letterSpacing: -0.6,
  },
  slideTitleHighlight: { fontWeight: '800' },
  slideBody: {
    fontSize: ms(15),
    color: colors.textCaption,
    lineHeight: ms(22),
    fontWeight: '400',
  },

  bottomSection: {
    paddingHorizontal: spacing.page,
    paddingBottom: vs(8),
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: ms(6),
    marginBottom: vs(24),
  },
  dot: {
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: colors.primary,
  },

  ctaBtn: {
    height: vs(54),
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(14),
  },
  ctaLabel: {
    fontSize: ms(15),
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.4,
  },
  disclaimer: {
    color: colors.textCaption,
    fontSize: ms(11),
    textAlign: 'center',
    fontWeight: '500',
  },
});
