import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { ms } from '../theme/responsive';

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

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  iconCircle: {
    width: ms(64),
    height: ms(64),
    borderRadius: radius.pill,
    backgroundColor: colors.mutedSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
