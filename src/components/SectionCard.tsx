import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radius, shadow, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { vs } from '../theme/responsive';

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
              <Text style={[typography.small, { color: colors.muted, marginTop: vs(2) }]}>{subtitle}</Text>
            ) : null}
          </View>
          {right ? <View>{right}</View> : null}
        </View>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  padded: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
});
