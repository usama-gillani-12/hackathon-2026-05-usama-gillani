import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { radius, spacing } from '@theme/spacing';
import { s, vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.premiumSoft,
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.premiumSoft,
  },
  headerRow: {
    flexDirection: 'row',
  },
  lockBadge: {
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingVertical: vs(4),
    paddingHorizontal: s(10),
  },
  rowSplit: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.md as unknown as number,
  },
  pill: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.premiumSubtle,
  },
});
