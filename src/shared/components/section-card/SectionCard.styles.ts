import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { radius, shadow, spacing } from '@theme/spacing';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xxl,
    ...shadow.card,
  },
  padded: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
});
