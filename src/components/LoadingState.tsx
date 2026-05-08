import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface Props {
  message?: string;
  style?: ViewStyle;
}

export const LoadingState: React.FC<Props> = ({ message = 'Crunching trend signals…', style }) => {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator color={colors.accent} size="large" />
      <Text style={[typography.body, { color: colors.muted, marginTop: spacing.md }]}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
});
