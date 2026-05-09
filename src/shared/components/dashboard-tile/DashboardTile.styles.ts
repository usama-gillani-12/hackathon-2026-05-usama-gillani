import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { radius, shadow, spacing } from '@theme/spacing';
import { ms, vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  tile: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: radius.xxl,
    padding: spacing.md,
    alignItems: 'center',
    minHeight: vs(96),
    justifyContent: 'center',
    ...shadow.card,
  },
  iconWrap: {
    width: ms(40),
    height: ms(40),
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  value: {
    color: colors.textPrimary,
    textAlign: 'center',
  },
  label: {
    color: colors.textCaption,
    textAlign: 'center',
    marginTop: vs(2),
  },
});
