import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radius, shadow, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { ms, vs } from '../theme/responsive';

interface Props {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  /** Background tint for the icon container. Defaults to accentSubtle. */
  iconBg?: string;
  style?: ViewStyle;
}

/**
 * Compact metric tile for the dashboard 4-column grid.
 * Enforces the Figma card pattern: icon → large value → caption label.
 */
export const DashboardTile: React.FC<Props> = ({ icon, value, label, iconBg, style }) => {
  return (
    <View style={[styles.tile, style]}>
      <View style={[styles.iconWrap, { backgroundColor: iconBg ?? colors.accentSubtle }]}>
        {icon}
      </View>
      <Text style={[typography.numericLg, styles.value]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      <Text style={[typography.caption, styles.label]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.xxl,
    padding: spacing.md,
    alignItems: 'center',
    minHeight: vs(96),
    justifyContent: 'center',
    ...shadow.card,
  },
  iconWrap: {
    width: ms(40),
    height: ms(40),
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  value: {
    color: colors.primary,
    textAlign: 'center',
  },
  label: {
    color: colors.textCaption,
    textAlign: 'center',
    marginTop: vs(2),
  },
});
