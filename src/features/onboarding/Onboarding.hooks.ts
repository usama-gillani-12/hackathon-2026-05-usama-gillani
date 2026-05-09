import { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useWindowDimensions } from 'react-native';
import { useSettingsStore } from '@core/stores/useSettingsStore';
import { hapticLight, hapticMedium, hapticSuccess } from '@utils/haptics';

const SLIDES_LENGTH = 3;

export function useOnboarding() {
  const { width: SCREEN_W } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useSharedValue(0);
  const markOnboardingComplete = useSettingsStore((s) => s.markOnboardingComplete);
  const isLast = index === SLIDES_LENGTH - 1;

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const handleMomentumEnd = useCallback((e: any) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    setIndex(i);
  }, []);

  const goNext = () => {
    hapticLight();
    if (index < SLIDES_LENGTH - 1) {
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

  return {
    SCREEN_W,
    index,
    scrollRef,
    scrollX,
    isLast,
    scrollHandler,
    handleMomentumEnd,
    goNext,
    finish,
    handleApple,
    handleEmail,
    orb1Style,
    orb2Style,
  };
}
