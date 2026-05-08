import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { isDemoPaymentMode } from '../services/paymentService';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { ms, vs } from '../theme/responsive';

export const DemoModeBanner: React.FC = () => {
  const dotOpacity = useSharedValue(1);

  useEffect(() => {
    dotOpacity.value = withRepeat(
      withSequence(withTiming(0.2, { duration: 800 }), withTiming(1, { duration: 800 })),
      -1,
    );
  }, []);

  const dotStyle = useAnimatedStyle(() => ({ opacity: dotOpacity.value }));

  if (!isDemoPaymentMode()) return null;

  return (
    <View style={styles.banner}>
      <Animated.View style={[styles.dot, dotStyle]} />
      <Text style={styles.text}>USDC DEMO MODE · No real funds processed</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ms(8),
    backgroundColor: colors.premiumSubtle,
    borderBottomWidth: 1,
    borderBottomColor: colors.premiumSoft,
    paddingVertical: vs(6),
    paddingHorizontal: spacing.lg,
  },
  dot: {
    width: ms(7),
    height: ms(7),
    borderRadius: ms(4),
    backgroundColor: colors.premium,
  },
  text: {
    fontSize: ms(11),
    fontWeight: '700',
    color: colors.premium,
    letterSpacing: ms(0.5),
  },
});
