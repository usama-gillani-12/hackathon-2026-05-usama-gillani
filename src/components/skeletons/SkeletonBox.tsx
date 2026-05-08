import React, { useEffect } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { radius } from '../../theme/spacing';
import { vs } from '../../theme/responsive';

interface Props {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export const SkeletonBox: React.FC<Props> = ({
  width = '100%',
  height = vs(16),
  borderRadius = radius.md,
  style,
}) => {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 700 }),
        withTiming(1, { duration: 700 }),
      ),
      -1,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.box,
        { width: width as any, height, borderRadius },
        animStyle,
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  box: { backgroundColor: colors.surfaceVariant },
});
