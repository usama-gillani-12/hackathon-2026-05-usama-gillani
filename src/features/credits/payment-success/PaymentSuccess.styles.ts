import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { radius, spacing } from '@theme/spacing';
import { ms, s, vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxxl },
  hero: {
    padding: spacing.xl, alignItems: 'center', gap: spacing.sm,
  },
  checkWrap: { marginBottom: spacing.sm },
  checkCircle: {
    width: ms(88), height: ms(88), borderRadius: ms(44),
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: ms(8) },
    shadowOpacity: 0.4,
    shadowRadius: ms(16),
    elevation: 10,
  },
  heroTitle: { color: colors.white, fontSize: ms(24), fontWeight: '800' },
  heroSub: { color: 'rgba(255,255,255,0.6)', fontSize: ms(14), textAlign: 'center' },
  creditsAdded: {
    flexDirection: 'row', alignItems: 'center', gap: ms(6),
    backgroundColor: `${colors.success}25`, borderRadius: radius.pill,
    paddingHorizontal: s(16), paddingVertical: vs(8), marginTop: spacing.sm,
  },
  creditsAddedText: { color: colors.success, fontSize: ms(16), fontWeight: '800' },
  receipt: {
    margin: spacing.lg, borderRadius: radius.xl,
    backgroundColor: colors.card, overflow: 'hidden',
  },
  receiptTitle: { fontSize: ms(16), fontWeight: '700', color: colors.primary, padding: spacing.md, paddingBottom: spacing.sm },
  divider: { backgroundColor: colors.border },
  receiptRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: vs(12),
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  receiptLabel: { fontSize: ms(13), color: colors.muted },
  receiptValue: { fontSize: ms(13), fontWeight: '600', color: colors.primary },
  hashWrap: { padding: spacing.md },
  hashLabel: { fontSize: ms(10), fontWeight: '700', color: colors.muted, letterSpacing: ms(1), marginBottom: vs(4) },
  hashValue: { fontSize: ms(14), fontWeight: '700', color: colors.primary, fontFamily: 'monospace' },
  btn: { marginHorizontal: spacing.lg, marginBottom: spacing.sm, borderRadius: radius.lg },
  btnOutline: { borderColor: colors.border },
  btnContent: { paddingVertical: vs(4) },
  btnLabel: { fontSize: ms(15), fontWeight: '700' },
  demoNote: {
    flexDirection: 'row', alignItems: 'center', gap: ms(6),
    justifyContent: 'center', marginTop: spacing.md,
  },
  testnetNote: { marginTop: spacing.xs },
  demoNoteText: { fontSize: ms(12), color: colors.premium },
  explorerLink: {
    flexDirection: 'row', alignItems: 'center', gap: ms(4), marginTop: vs(6),
  },
  explorerText: { fontSize: ms(12), color: colors.accent, fontWeight: '600' },
});
