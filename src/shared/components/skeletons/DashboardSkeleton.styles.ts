import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { radius, spacing } from '@theme/spacing';
import { vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  container: {},
  hero: {
    backgroundColor: colors.heroDark,
    padding: spacing.xl,
    paddingTop: spacing.xxl,
    gap: 0,
  },
  creditRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  metricCard: {
    width: '47%',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  mt4: { marginTop: vs(4) },
  mt8: { marginTop: vs(8) },
  oppCard: {
    marginHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  oppRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  oppMiddle: { flex: 1, gap: 0 },
});
