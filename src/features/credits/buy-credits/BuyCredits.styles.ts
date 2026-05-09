import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { radius, spacing } from '@theme/spacing';
import { ms, s, vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxxl },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(8),
    marginHorizontal: spacing.lg,
    marginTop: vs(12),
    padding: spacing.sm,
    backgroundColor: 'rgba(239,68,68,0.12)',
    borderRadius: ms(10),
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  errorBannerText: { flex: 1, color: colors.danger, fontSize: ms(12), lineHeight: ms(17) },

  hero: { padding: spacing.lg, paddingBottom: vs(24), gap: ms(14) },
  balanceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  balanceLeft: { flexDirection: 'row', alignItems: 'center', gap: ms(12) },
  balanceVal: { color: colors.white, fontSize: ms(42), fontWeight: '900', lineHeight: ms(46) },
  balanceLbl: { color: 'rgba(255,255,255,0.5)', fontSize: ms(12), marginTop: vs(-2) },
  historyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: s(5),
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radius.pill,
    paddingHorizontal: s(12), paddingVertical: vs(7),
  },
  historyText: { color: 'rgba(255,255,255,0.5)', fontSize: ms(12), fontWeight: '600' },

  testnetBadge: {
    flexDirection: 'row', alignItems: 'center', gap: ms(7),
    backgroundColor: 'rgba(46,125,90,0.2)', borderRadius: radius.pill,
    paddingHorizontal: s(14), paddingVertical: vs(7), alignSelf: 'flex-start',
    borderWidth: 1, borderColor: 'rgba(46,125,90,0.4)',
  },
  testnetDot: { width: ms(7), height: ms(7), borderRadius: ms(4), backgroundColor: colors.success },
  testnetText: { color: colors.success, fontSize: ms(11), fontWeight: '700' },

  demoBadge: {
    flexDirection: 'row', alignItems: 'center', gap: ms(7),
    backgroundColor: 'rgba(192,139,48,0.2)', borderRadius: radius.pill,
    paddingHorizontal: s(14), paddingVertical: vs(7), alignSelf: 'flex-start',
    borderWidth: 1, borderColor: 'rgba(192,139,48,0.4)',
  },
  demoDot: { width: ms(7), height: ms(7), borderRadius: ms(4), backgroundColor: colors.premium },
  demoText: { color: colors.premium, fontSize: ms(11), fontWeight: '700' },

  roiCard: {
    backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: radius.xl, padding: ms(14),
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  roiHeader: { flexDirection: 'row', alignItems: 'center', gap: s(6), marginBottom: vs(6) },
  roiTitle: { color: colors.success, fontSize: ms(11), fontWeight: '700', letterSpacing: 0.3 },
  roiProduct: { color: colors.white, fontSize: ms(16), fontWeight: '800', marginBottom: vs(10) },
  roiStats: { flexDirection: 'row', alignItems: 'center', gap: s(8) },
  roiStat: { flex: 1 },
  roiStatLabel: { fontSize: ms(9), color: 'rgba(255,255,255,0.4)', fontWeight: '700', letterSpacing: 0.5 },
  roiStatVal: { fontSize: ms(14), fontWeight: '800', marginTop: vs(2) },

  section: { paddingHorizontal: spacing.lg, marginTop: vs(20) },
  sectionLabel: {
    fontSize: ms(11), fontWeight: '800', color: colors.muted,
    letterSpacing: ms(1.2), marginBottom: vs(8),
  },
  sectionSub: { fontSize: ms(12), color: colors.muted, marginBottom: vs(12) },

  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: colors.mutedSoft,
    borderRadius: radius.xl,
    padding: ms(4),
    gap: ms(4),
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(5),
    paddingVertical: vs(10),
    borderRadius: radius.lg,
  },
  tabActive: {
    backgroundColor: colors.heroDark,
  },
  tabText: {
    fontSize: ms(13),
    fontWeight: '700',
    color: colors.muted,
  },
  tabTextActive: {
    color: colors.white,
  },

  unlockCard: { borderRadius: radius.xl, backgroundColor: colors.card, overflow: 'hidden' },
  unlockRow: { flexDirection: 'row', alignItems: 'center', gap: ms(12), padding: ms(14) },
  unlockRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  unlockIcon: { width: ms(34), height: ms(34), borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  unlockText: { flex: 1, fontSize: ms(13), color: colors.primary, fontWeight: '600', lineHeight: ms(19) },

  packageWrap: { marginBottom: vs(10) },
  packageCard: {
    borderRadius: radius.xl, backgroundColor: colors.card,
    borderWidth: 1.5, borderColor: colors.border, overflow: 'hidden',
  },
  packageCardSelected: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  checkMark: { position: 'absolute', top: ms(12), right: ms(12), zIndex: 1 },
  popularBadge: { paddingVertical: vs(6), alignItems: 'center' },
  popularText: { color: colors.white, fontSize: ms(11), fontWeight: '800', letterSpacing: 0.5 },
  packageBody: { flexDirection: 'row', alignItems: 'center', padding: ms(16), gap: spacing.md },
  packageLeft: { flex: 1 },
  packageCredits: { fontSize: ms(18), fontWeight: '800', color: colors.primary },
  packageLabel: { fontSize: ms(12), color: colors.muted, marginTop: vs(2) },
  savingsBadge: {
    marginTop: vs(4),
    backgroundColor: colors.successSoft,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
    paddingHorizontal: s(8),
    paddingVertical: vs(2),
  },
  savingsText: { fontSize: ms(10), fontWeight: '800', color: colors.success },
  packageRight: { alignItems: 'flex-end' },
  packagePrice: { fontSize: ms(20), fontWeight: '800', color: colors.primary },
  packagePer: { fontSize: ms(11), color: colors.muted, marginTop: vs(2) },

  payBtn: { borderRadius: radius.xl, paddingVertical: vs(16), alignItems: 'center', justifyContent: 'center' },
  payBtnContent: { flexDirection: 'row', alignItems: 'center', gap: s(8) },
  payBtnLabel: { color: colors.white, fontSize: ms(17), fontWeight: '800' },
  processingRow: { flexDirection: 'row', alignItems: 'center', gap: s(10) },

  securityCard: { borderRadius: radius.xl, padding: spacing.lg, backgroundColor: colors.card },
  securityHeader: { flexDirection: 'row', alignItems: 'center', gap: ms(8), marginBottom: vs(14) },
  securityTitle: { fontSize: ms(15), fontWeight: '800', color: colors.primary },
  securityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: ms(10), marginBottom: vs(10) },
  securityIcon: {
    width: ms(28), height: ms(28), borderRadius: radius.sm,
    backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center',
  },
  securityText: { flex: 1, fontSize: ms(13), color: colors.muted, lineHeight: ms(20) },
});
