import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { radius, spacing } from '@theme/spacing';
import { ms, s, vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxxl },
  hero: { padding: spacing.lg, paddingBottom: spacing.xl },
  heroLabel: { fontSize: ms(9), fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: ms(1.2), marginBottom: vs(8) },
  heroTitle: { fontSize: ms(20), fontWeight: '800', color: colors.white, lineHeight: ms(26), marginBottom: spacing.lg },
  heroStats: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.lg, padding: spacing.md,
  },
  heroStat: { flex: 1, alignItems: 'center', gap: ms(4) },
  heroStatValue: { fontSize: ms(18), fontWeight: '800', color: colors.white },
  heroStatLabel: { fontSize: ms(10), color: 'rgba(255,255,255,0.5)' },
  heroStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.12)' },
  card: {
    marginHorizontal: spacing.lg, marginTop: spacing.md,
    borderRadius: radius.lg, padding: spacing.lg, backgroundColor: colors.card,
  },
  cardTitle: { fontSize: ms(16), fontWeight: '700', color: colors.primary, marginBottom: spacing.sm },
  divider: { backgroundColor: colors.border, marginBottom: spacing.sm },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: vs(10), borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  rowLabel: { fontSize: ms(13), color: colors.muted },
  rowValue: { fontSize: ms(13), fontWeight: '700', color: colors.primary },
  infoBlock: {},
  infoLabel: { fontSize: ms(10), fontWeight: '700', color: colors.muted, letterSpacing: ms(0.8), marginBottom: vs(4) },
  infoValue: { fontSize: ms(14), fontWeight: '600', color: colors.primary, lineHeight: ms(22) },
  adBox: {
    backgroundColor: colors.accentSoft, borderRadius: radius.lg,
    padding: spacing.md, borderLeftWidth: ms(4), borderLeftColor: colors.accent,
    gap: spacing.sm,
  },
  adCopyText: { fontSize: ms(14), color: colors.primary, fontStyle: 'italic', lineHeight: ms(22) },
  successMetric: { marginTop: spacing.md },
  successMetricText: { fontSize: ms(14), color: colors.primary, lineHeight: ms(22), marginTop: vs(4) },
  backBtn: { marginHorizontal: spacing.lg, marginTop: spacing.md, borderRadius: radius.lg, borderColor: colors.border },
  backBtnContent: { paddingVertical: vs(4) },
});
