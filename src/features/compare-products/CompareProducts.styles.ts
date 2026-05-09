import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { radius, spacing } from '@theme/spacing';
import { ms, s, vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  banner: {
    backgroundColor: colors.card, padding: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  bannerTitle: { fontSize: ms(16), fontWeight: '700', color: colors.primary },
  bannerSub: { fontSize: ms(12), color: colors.muted, marginTop: vs(2) },
  winnerCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    margin: spacing.lg, borderRadius: radius.xl, padding: spacing.lg,
  },
  winnerLabel: { fontSize: ms(10), fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: ms(1) },
  winnerTitle: { fontSize: ms(16), fontWeight: '800', color: colors.white, marginTop: vs(2) },
  winnerSub: { fontSize: ms(12), color: 'rgba(255,255,255,0.7)', marginTop: vs(2) },
  card: {
    marginHorizontal: spacing.lg, marginBottom: spacing.md,
    borderRadius: radius.lg, padding: spacing.lg, backgroundColor: colors.card,
  },
  cardTitle: { fontSize: ms(16), fontWeight: '700', color: colors.primary, marginBottom: spacing.md },
  tableRow: {
    flexDirection: 'row', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
  metricCol: { width: s(100) },
  metricLabel: { width: s(100), fontSize: ms(12), fontWeight: '600', color: colors.muted },
  tableHeader: { fontSize: ms(11), fontWeight: '700', color: colors.primary, lineHeight: ms(16) },
  valueCol: { width: s(130), paddingHorizontal: spacing.sm },
  valueColHighlight: {
    backgroundColor: colors.successSoft, borderRadius: radius.sm,
  },
  valueText: { fontSize: ms(13), color: colors.muted },
  valueTextHighlight: { color: colors.success, fontWeight: '700' },
  conclusionText: { fontSize: ms(14), color: colors.muted, lineHeight: ms(22) },
  bold: { fontWeight: '700', color: colors.primary },
  footer: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  footerBtn: { flex: 1, borderRadius: radius.lg },
  compareFooter: {
    padding: spacing.lg, backgroundColor: colors.card,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  compareBtn: { borderRadius: radius.lg },
  compareBtnContent: { paddingVertical: vs(6) },
  compareBtnLabel: { fontSize: ms(15), fontWeight: '700' },
});
