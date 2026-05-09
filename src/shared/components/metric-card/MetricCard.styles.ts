import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { radius, shadow, spacing } from '@theme/spacing';
import { s, vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.xxl,
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
