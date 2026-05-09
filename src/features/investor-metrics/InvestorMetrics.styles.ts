import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { radius, spacing } from '@theme/spacing';
import { ms, s, vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  hero: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: vs(6),
  },
  heroIcon: {
    width: ms(56),
    height: ms(56),
    borderRadius: ms(28),
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(4),
  },
  heroTitle: { color: colors.white, fontSize: ms(22), fontWeight: '800' },
  heroSub: { color: 'rgba(255,255,255,0.55)', fontSize: ms(13), textAlign: 'center' },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl, gap: vs(16) },
  businessModelSection: { gap: vs(8) },
  sectionLabel: {
    fontSize: ms(11),
    fontWeight: '800',
    color: colors.muted,
    letterSpacing: ms(1.2),
    marginBottom: vs(4),
  },
  modelCard: { borderRadius: radius.xl, backgroundColor: colors.card, overflow: 'hidden' },
  modelRow: { flexDirection: 'row', alignItems: 'flex-start', gap: ms(12), padding: ms(14) },
  modelIcon: {
    width: ms(32),
    height: ms(32),
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modelText: { flex: 1, fontSize: ms(13), color: colors.muted, lineHeight: ms(19) },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(10),
  },
  metricCard: {
    width: '47%',
    borderRadius: radius.xl,
    backgroundColor: colors.card,
    padding: spacing.md,
    alignItems: 'flex-start',
    gap: vs(6),
  },
  metricIconWrap: {
    width: ms(40),
    height: ms(40),
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: { fontSize: ms(22), fontWeight: '900' },
  metricLabel: { fontSize: ms(12), fontWeight: '700', color: colors.primary },
  metricSub: { fontSize: ms(11), color: colors.muted },
  explorerCard: {
    borderRadius: radius.xl,
    backgroundColor: colors.card,
    padding: spacing.md,
    gap: vs(8),
  },
  explorerHeader: { flexDirection: 'row', alignItems: 'center', gap: s(8) },
  explorerTitle: { fontSize: ms(14), fontWeight: '700', color: colors.primary },
  explorerText: { fontSize: ms(13), color: colors.muted, lineHeight: ms(20) },
});
