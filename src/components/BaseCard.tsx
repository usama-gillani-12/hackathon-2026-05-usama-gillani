import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radius, shadow, spacing } from '../theme/spacing';

interface Props {
  children?: React.ReactNode;
  style?: ViewStyle;
  /** Apply page-level horizontal padding inside the card. Default true. */
  padded?: boolean;
  /** Use cardLg shadow for prominent elevation. Default false (card shadow). */
  elevated?: boolean;
}

export const BaseCard: React.FC<Props> = ({ children, style, padded = true, elevated = false }) => {
  return (
    <View style={[styles.card, elevated ? styles.elevated : styles.flat, padded && styles.padded, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xxl,
  },
  flat: {
    ...shadow.card,
  },
  elevated: {
    ...shadow.cardLg,
  },
  padded: {
    padding: spacing.page,
  },
});
