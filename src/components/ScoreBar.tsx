import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { vs } from '../theme/responsive';

interface Props {
  label: string;
  value: number; // 0–100
  inverted?: boolean;
  helper?: string;
  style?: ViewStyle;
}

function colorForValue(value: number, inverted?: boolean): string {
  const display = inverted ? 100 - value : value;
  if (display >= 75) return colors.success;
  if (display >= 55) return colors.accent;
  if (display >= 35) return colors.warning;
  return colors.danger;
}

const ScoreBarComponent: React.FC<Props> = ({ label, value, inverted, helper, style }) => {
  const display = Math.round(Math.max(0, Math.min(100, value)));
  const fillColor = colorForValue(value, inverted);
  const bestText = inverted ? `${100 - display}/100` : `${display}/100`;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        <Text style={[typography.bodyStrong, { color: colors.primary }]}>{label}</Text>
        <Text style={[typography.smallStrong, { color: fillColor }]}>{bestText}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${display}%`, backgroundColor: fillColor }]} />
      </View>
      {helper ? (
        <Text style={[typography.small, { color: colors.muted, marginTop: spacing.xs }]}>{helper}</Text>
      ) : null}
    </View>
  );
};

export const ScoreBar = React.memo(ScoreBarComponent);

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(6),
  },
  track: {
    height: vs(8),
    backgroundColor: colors.mutedSoft,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
});
