import React from 'react';
import { View, ViewStyle } from 'react-native';
import { styles } from './BaseCard.styles';

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

