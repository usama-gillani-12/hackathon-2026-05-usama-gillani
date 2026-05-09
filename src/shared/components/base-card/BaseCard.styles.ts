import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { radius, shadow, spacing } from '@theme/spacing';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xxl,
  },
  flat: {
    ...shadow.card,
  },
  elevated: {
    ...shadow.cardLg,
  },
  padded: {
    padding: spacing.page,
  },
});
