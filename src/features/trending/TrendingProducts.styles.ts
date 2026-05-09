import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { radius, spacing } from '@theme/spacing';
import { ms, s, vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  // Hero
  hero: { paddingHorizontal: spacing.lg, paddingTop: vs(10), paddingBottom: vs(12) },
  heroRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: vs(12) },
  heroTitleRow: { flexDirection: 'row', alignItems: 'center', gap: ms(8) },
  heroTitle: { color: colors.white, fontSize: ms(26), fontWeight: '900', letterSpacing: -0.5 },
  fireBadge: {
    backgroundColor: 'rgba(245,158,11,0.2)', borderRadius: radius.pill,
    paddingHorizontal: s(8), paddingVertical: vs(2),
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.4)',
  },
  fireBadgeText: { fontSize: ms(14) },
  heroSub: { color: 'rgba(255,255,255,0.45)', fontSize: ms(12), marginTop: vs(2) },
  heroStats: { flexDirection: 'row', alignItems: 'center', gap: ms(16) },
  heroStat: { alignItems: 'center' },
  heroStatVal: { color: colors.white, fontSize: ms(22), fontWeight: '800' },
  heroStatLabel: { color: 'rgba(255,255,255,0.4)', fontSize: ms(11) },
  heroStatDivider: { width: 1, height: ms(32), backgroundColor: 'rgba(255,255,255,0.15)' },

  // Sort tabs
  sortRow: { flexDirection: 'row', gap: s(8) },
  sortTab: {
    flex: 1, alignItems: 'center', paddingVertical: vs(8),
    borderRadius: radius.lg, backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  sortTabActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  sortTabText: { fontSize: ms(12), fontWeight: '700', color: 'rgba(255,255,255,0.5)' },
  sortTabTextActive: { color: colors.white },

  // Filters
  filterPanel: {
    backgroundColor: colors.card,
    paddingVertical: vs(6),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: vs(4),
    gap: ms(6),
  },
  filterDivider: { width: 1, height: ms(20), backgroundColor: colors.border, marginHorizontal: s(4) },
  chip: {
    borderRadius: radius.pill,
    backgroundColor: colors.mutedSoft,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: s(12),
    paddingVertical: vs(6),
  },
  chipActive: { backgroundColor: colors.heroMid, borderColor: colors.accent },
  chipPremium: { backgroundColor: colors.premiumSoft, borderColor: colors.premium },
  chipText: { fontSize: ms(12), fontWeight: '600', color: colors.muted },
  chipTextActive: { color: colors.white },
  list: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
});
