import React from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { ms, s, vs } from '@theme/responsive';
import { styles } from './ScoreBadge.styles';

interface Props {
  score: number; // 0-100
  rating10: number;
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

function scoreColor(score: number): { bg: string; fg: string } {
  if (score >= 85) return { bg: colors.successSoft, fg: colors.success };
  if (score >= 70) return { bg: colors.accentSoft, fg: colors.accent };
  if (score >= 50) return { bg: colors.warningSoft, fg: colors.warning };
  return { bg: colors.dangerSoft, fg: colors.danger };
}

export const ScoreBadge: React.FC<Props> = ({ score, rating10, size = 'md', style }) => {
  const palette = scoreColor(score);
  const dim =
    size === 'lg' ? { padV: vs(10), padH: s(14), num: ms(22), label: ms(12) } :
    size === 'sm' ? { padV: vs(4), padH: s(8), num: ms(14), label: ms(10) } :
    { padV: vs(6), padH: s(10), num: ms(18), label: ms(11) };

  return (
    <View style={[styles.container, { backgroundColor: palette.bg, paddingVertical: dim.padV, paddingHorizontal: dim.padH }, style]}>
      <Text style={[typography.tiny, { color: palette.fg, fontSize: dim.label }]}>WINNING</Text>
      <View style={styles.row}>
        <Text style={[{ color: palette.fg, fontWeight: '800', fontSize: dim.num }]}>{rating10}</Text>
        <Text style={[{ color: palette.fg, fontSize: dim.label, opacity: 0.7, marginLeft: s(2) }]}>/10</Text>
      </View>
      <Text style={[typography.tiny, { color: palette.fg, fontSize: dim.label - 1 }]}>{score} pts</Text>
    </View>
  );
};


export const scoreColorPalette = scoreColor;
