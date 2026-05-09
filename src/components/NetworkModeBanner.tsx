import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getPaymentService } from '../services/paymentService';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { ms, vs } from '../theme/responsive';

export const NetworkModeBanner: React.FC = () => {
  const dotOpacity = useSharedValue(1);
  const service = getPaymentService();

  useEffect(() => {
    dotOpacity.value = withRepeat(
      withSequence(withTiming(0.2, { duration: 800 }), withTiming(1, { duration: 800 })),
      -1,
    );
  }, []);

  const dotStyle = useAnimatedStyle(() => ({ opacity: dotOpacity.value }));

  if (service.mode === 'mock') {
    return (
      <View style={styles.demoBanner}>
        <Animated.View style={[styles.demoDot, dotStyle]} />
        <Text style={styles.demoText}>USDC DEMO MODE · No real funds processed</Text>
      </View>
    );
  }

  if (service.mode === 'testnet') {
    return (
      <View style={styles.testnetBanner}>
        <MaterialCommunityIcons name="flask-outline" size={ms(12)} color={colors.success} />
        <Text style={styles.testnetText}>BASE SEPOLIA TESTNET · Real wallet required</Text>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  demoBanner: {
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
  demoDot: {
    width: ms(7),
    height: ms(7),
    borderRadius: ms(4),
    backgroundColor: colors.premium,
  },
  demoText: {
    fontSize: ms(11),
    fontWeight: '700',
    color: colors.premium,
    letterSpacing: ms(0.5),
  },
  testnetBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ms(6),
    backgroundColor: colors.successSubtle,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSuccess,
    paddingVertical: vs(6),
    paddingHorizontal: spacing.lg,
  },
  testnetText: {
    fontSize: ms(11),
    fontWeight: '700',
    color: colors.success,
    letterSpacing: ms(0.5),
  },
});
