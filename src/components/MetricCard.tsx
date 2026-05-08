import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radius, shadow, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { ms, s, vs } from '../theme/responsive';

interface Props {
  label: string;
  value: string | number;
  helper?: string;
  accent?: 'primary' | 'success' | 'warning' | 'danger' | 'premium' | 'accent';
  style?: ViewStyle;
}

const accentMap: Record<NonNullable<Props['accent']>, { bg: string; text: string }> = {
  primary: { bg: colors.mutedSoft, text: colors.primary },
  success: { bg: colors.successSoft, text: colors.success },
  warning: { bg: colors.warningSoft, text: colors.warning },
  danger: { bg: colors.dangerSoft, text: colors.danger },
  premium: { bg: colors.premiumSoft, text: colors.premium },
  accent: { bg: colors.accentSoft, text: colors.accent },
};

export const MetricCard: React.FC<Props> = ({ label, value, helper, accent = 'accent', style }) => {
  const palette = accentMap[accent];
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.tag, { backgroundColor: palette.bg }]}>
        <Text style={[typography.tiny, { color: palette.text }]}>{label.toUpperCase()}</Text>
      </View>
      <Text style={[typography.numericLg, { color: colors.primary, marginTop: spacing.sm }]}>{value}</Text>
      {helper ? (
        <Text style={[typography.small, { color: colors.muted, marginTop: vs(2) }]}>{helper}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    minHeight: vs(100),
    ...shadow.card,
  },
  tag: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingVertical: vs(4),
    paddingHorizontal: s(8),
  },
});
