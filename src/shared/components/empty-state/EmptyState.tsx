import React from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { typography } from '@theme/typography';
import { ms } from '@theme/responsive';
import { styles } from './EmptyState.styles';

interface Props {
  title: string;
  message?: string;
  icon?: string;
  style?: ViewStyle;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<Props> = ({ title, message, icon = '🪄', action, style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Text style={{ fontSize: ms(30) }}>{icon}</Text>
      </View>
      <Text style={[typography.h2, { color: colors.primary, textAlign: 'center', marginTop: spacing.md }]}>
        {title}
      </Text>
      {message ? (
        <Text style={[typography.body, { color: colors.muted, textAlign: 'center', marginTop: spacing.sm }]}>
          {message}
        </Text>
      ) : null}
      {action ? <View style={{ marginTop: spacing.lg }}>{action}</View> : null}
    </View>
  );
};

