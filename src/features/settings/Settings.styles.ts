import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { radius, spacing } from '@theme/spacing';
import { ms, s, vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl },
  section: { borderRadius: radius.lg, backgroundColor: colors.card, overflow: 'hidden' },
  sectionTitle: { fontSize: ms(14), fontWeight: '700', color: colors.primary, padding: spacing.md, paddingBottom: spacing.sm },
  divider: { backgroundColor: colors.border },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: spacing.md,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: ms(12), flex: 1 },
  toggleLabel: { fontSize: ms(14), fontWeight: '600', color: colors.primary },
  toggleSub: { fontSize: ms(12), color: colors.muted, marginTop: vs(1) },
  statusRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: vs(10),
  },
  statusLabel: { fontSize: ms(13), color: colors.muted },
  statusPill: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: radius.pill, paddingVertical: vs(3), paddingHorizontal: s(10),
  },
  dot: { width: ms(6), height: ms(6), borderRadius: ms(3), marginRight: s(5) },
  statusVal: { fontSize: ms(11), fontWeight: '700' },
  hint: { fontSize: ms(11), color: colors.muted, paddingHorizontal: spacing.md, paddingBottom: spacing.md, lineHeight: ms(16) },
  actionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: vs(10),
  },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: ms(10), flex: 1 },
  actionLabel: { fontSize: ms(13), fontWeight: '600', color: colors.primary },
  actionSub: { fontSize: ms(11), color: colors.muted },
  actionBtn: { borderRadius: radius.md, borderColor: colors.border },
  clearAllBtn: { margin: spacing.md, marginTop: spacing.sm, borderRadius: radius.md },
  version: { textAlign: 'center', fontSize: ms(12), color: colors.muted },
});
