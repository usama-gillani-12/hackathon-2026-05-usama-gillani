import React from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { colors } from '@theme/colors';
import { typography } from '@theme/typography';
import { styles } from './DashboardTile.styles';

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
const DashboardTileBase: React.FC<Props> = ({ icon, value, label, iconBg, style }) => {
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

export const DashboardTile = React.memo(DashboardTileBase);

