import React from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';
import { vs } from '@theme/responsive';
import { styles } from './SectionCard.styles';

interface Props {
  title?: string;
  subtitle?: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
}

export const SectionCard: React.FC<Props> = ({ title, subtitle, right, children, style, padded = true }) => {
  return (
    <View style={[styles.card, padded && styles.padded, style]}>
      {(title || right) && (
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            {title ? <Text style={[typography.h2, { color: colors.primary }]}>{title}</Text> : null}
            {subtitle ? (
              <Text style={[typography.caption, { color: colors.textCaption, marginTop: vs(2) }]}>{subtitle}</Text>
            ) : null}
          </View>
          {right ? <View>{right}</View> : null}
        </View>
      )}
      {children}
    </View>
  );
};

