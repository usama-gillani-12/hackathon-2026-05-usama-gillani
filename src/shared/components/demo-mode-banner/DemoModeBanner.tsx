import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSettingsStore } from '@core/stores/useSettingsStore';
import { styles } from './DemoModeBanner.styles';

export const DemoModeBanner: React.FC = () => {
  const paymentMode = useSettingsStore((s) => s.paymentMode);
  const dotOpacity = useSharedValue(1);

  useEffect(() => {
    dotOpacity.value = withRepeat(
      withSequence(withTiming(0.2, { duration: 800 }), withTiming(1, { duration: 800 })),
      -1,
    );
  }, []);

  const dotStyle = useAnimatedStyle(() => ({ opacity: dotOpacity.value }));

  if (paymentMode !== 'mock') return null;

  return (
    <View style={styles.banner}>
      <Animated.View style={[styles.dot, dotStyle]} />
      <Text style={styles.text}>USDC DEMO MODE · No real funds processed</Text>
    </View>
  );
};

