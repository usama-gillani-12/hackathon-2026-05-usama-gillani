import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getPaymentService } from '@core/services/paymentService';
import { colors } from '@theme/colors';
import { ms } from '@theme/responsive';
import { styles } from './NetworkModeBanner.styles';

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

