import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { radius, spacing } from '@theme/spacing';
import { vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  container: {},
  summaryRow: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.sm,
    backgroundColor: colors.heroDark,
    paddingBottom: spacing.xl,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  chartArea: { marginTop: spacing.lg, gap: spacing.sm },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  bar: { flex: 1 },
  colChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.lg,
    height: vs(90),
  },
  col: {},
  mt4: { marginTop: vs(4) },
  mt6: { marginTop: vs(6) },
});
