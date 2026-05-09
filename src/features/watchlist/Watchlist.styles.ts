import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { radius, spacing } from '@theme/spacing';
import { ms, s, vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: ms(20), fontWeight: '700', color: colors.primary },
  emptySub: { fontSize: ms(14), color: colors.muted, textAlign: 'center' },
  emptyBtn: { marginTop: spacing.sm, borderRadius: radius.lg },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.lg,
  },
  summaryItem: { flexDirection: 'row', alignItems: 'center', gap: ms(6) },
  summaryIcon: { width: ms(24), height: ms(24), borderRadius: ms(6), alignItems: 'center', justifyContent: 'center' },
  summaryCount: { fontSize: ms(16), fontWeight: '800', color: colors.primary },
  summaryLabel: { fontSize: ms(12), color: colors.muted },
  content: { padding: spacing.md, gap: spacing.sm, paddingBottom: spacing.xxxl },
  entryCard: { borderRadius: radius.lg, backgroundColor: colors.card, overflow: 'hidden' },
  entryHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingTop: spacing.md,
  },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: ms(4),
    borderRadius: radius.pill, paddingHorizontal: s(10), paddingVertical: vs(4),
  },
  statusText: { fontSize: ms(10), fontWeight: '700', letterSpacing: ms(0.5) },
  removeBtn: { flexDirection: 'row', alignItems: 'center', gap: ms(4), padding: ms(4) },
  removeText: { fontSize: ms(12), color: colors.danger, fontWeight: '600' },
  statusChips: {
    flexDirection: 'row', gap: ms(6),
    paddingHorizontal: spacing.md, paddingBottom: spacing.md, paddingTop: vs(4),
  },
  statusChip: { backgroundColor: colors.mutedSoft, borderRadius: radius.pill },
  statusChipText: { fontSize: ms(11), color: colors.primary },
});
