import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { radius, spacing } from '@theme/spacing';
import { ms, s, vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxxl },
  hero: {
    flexDirection: 'row', alignItems: 'flex-start',
    padding: spacing.lg, gap: spacing.md,
  },
  heroLeft: { flex: 1 },
  heroLabel: { fontSize: ms(9), fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: ms(1.2), marginBottom: vs(6) },
  heroTitle: { fontSize: ms(18), fontWeight: '800', color: colors.white, lineHeight: ms(24), marginBottom: vs(8) },
  heroFormula: { fontSize: ms(10), color: 'rgba(255,255,255,0.4)', lineHeight: ms(16) },
  recBanner: {
    flexDirection: 'row', alignItems: 'center', gap: ms(12),
    marginHorizontal: spacing.lg, marginTop: spacing.lg, marginBottom: spacing.sm,
    padding: spacing.md, borderRadius: radius.lg, borderWidth: 1,
  },
  recLabel: { fontSize: ms(14), fontWeight: '800', marginBottom: vs(2) },
  recMessage: { fontSize: ms(12), color: colors.muted, lineHeight: ms(18) },
  card: {
    marginHorizontal: spacing.lg, marginBottom: spacing.md,
    borderRadius: radius.lg, padding: spacing.lg, backgroundColor: colors.card,
  },
  cardTitle: { fontSize: ms(16), fontWeight: '700', color: colors.primary, marginBottom: spacing.md },
  bodyText: { fontSize: ms(14), color: colors.muted, lineHeight: ms(22) },
  bold: { fontWeight: '700', color: colors.primary },
  highlight: {
    marginTop: spacing.md, backgroundColor: colors.accentSoft,
    borderRadius: radius.md, padding: spacing.md,
  },
  highlightText: { fontSize: ms(13), color: colors.accent, fontWeight: '600' },

  // ── Social Buzz Sources card
  buzzHeader: { flexDirection: 'row', alignItems: 'center', gap: s(8), marginBottom: vs(4) },
  buzzSub: { fontSize: ms(12), color: colors.muted, lineHeight: ms(18), marginBottom: vs(16) },
  buzzSourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    marginBottom: vs(12),
  },
  buzzSourceLabel: { flexDirection: 'row', alignItems: 'center', gap: s(6), width: ms(100) },
  buzzDot: { width: ms(8), height: ms(8), borderRadius: ms(4) },
  buzzSourceName: { fontSize: ms(12), fontWeight: '700', color: colors.textPrimary, flex: 1 },
  buzzSourcePct: { fontSize: ms(11), color: colors.muted, fontWeight: '600' },
  buzzBarWrap: {
    flex: 1,
    height: ms(7),
    backgroundColor: colors.divider,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  buzzBarFill: { height: '100%', borderRadius: radius.pill },
  buzzScore: { width: ms(28), fontSize: ms(12), fontWeight: '800', textAlign: 'right' },
  buzzBlendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: vs(10),
    marginTop: vs(4),
  },
  buzzBlendLabel: { fontSize: ms(13), fontWeight: '700', color: colors.muted },
  buzzBlendValue: { fontSize: ms(16), fontWeight: '900', color: colors.accent },
});
