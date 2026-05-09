import React from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { ms, s, vs } from '@theme/responsive';
import { Recommendation } from '@t/product';
import { styles } from './RecommendationBadge.styles';

interface Props {
  recommendation: Recommendation;
  style?: ViewStyle;
  compact?: boolean;
}

function paletteFor(rec: Recommendation) {
  switch (rec) {
    case 'Test Now':
      return { bg: colors.successSoft, fg: colors.success, dot: colors.success };
    case 'Watch Closely':
      return { bg: colors.accentSoft, fg: colors.accent, dot: colors.accent };
    case 'Research More':
      return { bg: colors.warningSoft, fg: colors.warning, dot: colors.warning };
    case 'Avoid for Now':
      return { bg: colors.dangerSoft, fg: colors.danger, dot: colors.danger };
  }
}

export const RecommendationBadge: React.FC<Props> = ({ recommendation, style, compact }) => {
  const palette = paletteFor(recommendation);
  return (
    <View style={[
      styles.badge,
      { backgroundColor: palette.bg, paddingVertical: compact ? vs(4) : vs(6), paddingHorizontal: compact ? s(8) : s(10) },
      style,
    ]}>
      <View style={[styles.dot, { backgroundColor: palette.dot }]} />
      <Text style={[typography.smallStrong, { color: palette.fg, fontSize: compact ? ms(11) : ms(12) }]}>
        {recommendation}
      </Text>
    </View>
  );
};

