import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { radius, spacing, shadow } from '@theme/spacing';
import { ms, s, vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xxxl },

  // ── Floating top bar ──
  topBar: {
    position: 'absolute',
    //backgroundColor:'red',
    top: 10, left: 0, right: 0,
    zIndex: 100,
    flexDirection: 'row',
    //alignItems: 'center',
    gap: s(10),
    paddingHorizontal: spacing.lg,
    //paddingTop: insets.top + vs(6)
  },

  // ── Hero carousel ──
  heroCarousel: {
    width: '100%',
    height: vs(340),
    backgroundColor: colors.surfaceVariant,
    overflow: 'hidden',
    marginBottom: vs(4),
  },
  heroImageWrap: { height: '100%' },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  heroTopScrim: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: vs(120),
  },
  heroBottomScrim: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: vs(40),
  },
  counterPill: {
    position: 'absolute',
    bottom: vs(16),
    left: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radius.pill,
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
  },
  heroScoreChip: {
    position: 'absolute',
    bottom: vs(14),
    right: spacing.lg,
  },

  // ── Header content ──
  headerSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  category: { letterSpacing: ms(0.8) },
  title: { marginTop: vs(4), lineHeight: ms(34) },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: ms(8), marginTop: spacing.sm, flexWrap: 'wrap' },
  premiumChip: {
    flexDirection: 'row', alignItems: 'center', gap: ms(4),
    borderRadius: radius.pill, paddingHorizontal: s(10), paddingVertical: vs(4),
  },
  premiumText: { letterSpacing: ms(1), fontWeight: '800' },
  amazonChip: {
    flexDirection: 'row', alignItems: 'center', gap: ms(4),
    backgroundColor: '#FF9900', borderRadius: radius.pill,
    paddingHorizontal: s(10), paddingVertical: vs(4),
  },
  amazonChipText: { fontWeight: '800' },
  amazonMetaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: s(12), marginTop: vs(6) },

  card: {
    borderRadius: radius.xxl, backgroundColor: colors.card,
    padding: spacing.lg, marginBottom: spacing.md,
    marginHorizontal: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
    ...shadow.sm,
  },
  cardTitle: { marginBottom: spacing.sm, fontWeight: '700' },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  seeAll: { fontWeight: '600' },
  priceGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  priceCell: { width: '50%', paddingVertical: spacing.sm },
  priceCellLabel: { fontSize: ms(10), fontWeight: '700', color: colors.muted, letterSpacing: ms(0.8) },
  priceCellValue: { fontSize: ms(20), fontWeight: '800', color: colors.primary, marginTop: vs(2) },
  bodyText: { fontSize: ms(14), color: colors.muted, lineHeight: ms(22) },
  metaLabel: { fontSize: ms(10), fontWeight: '700', color: colors.muted, letterSpacing: ms(0.8), marginBottom: vs(4) },
  metaValue: { fontSize: ms(14), fontWeight: '600', color: colors.primary },
  platformRow: { flexDirection: 'row', flexWrap: 'wrap', gap: ms(6), marginTop: vs(6) },
  platformChip: {
    backgroundColor: colors.mutedSoft,
    borderRadius: radius.pill,
    paddingHorizontal: s(12),
    paddingVertical: vs(5),
    borderWidth: 1,
    borderColor: colors.border,
  },
  platformChipText: { fontSize: ms(12), fontWeight: '600', color: colors.primary },
  locked: {
    flexDirection: 'row', alignItems: 'center', gap: ms(8),
    backgroundColor: colors.mutedSoft, borderRadius: radius.md,
    padding: spacing.md, marginTop: spacing.sm,
  },
  lockedText: { fontSize: ms(13), color: colors.muted, flex: 1 },

  // AI card (unlocked)
  aiCard: {
    borderRadius: radius.xxl, padding: spacing.lg, marginBottom: spacing.md,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
    ...shadow.md,
  },
  aiHeader: { flexDirection: 'row', alignItems: 'center', gap: ms(8), marginBottom: vs(10) },
  aiIconWrap: {
    width: ms(28), height: ms(28), borderRadius: radius.md,
    backgroundColor: colors.accentSubtle, alignItems: 'center', justifyContent: 'center',
  },
  aiTitle: { color: colors.textPrimary, fontSize: ms(15), fontWeight: '800', flex: 1 },
  aiBadge: {
    backgroundColor: colors.accentSubtle, borderRadius: radius.pill,
    paddingHorizontal: s(8), paddingVertical: vs(2),
  },
  aiBadgeText: { color: colors.accent, fontSize: ms(9), fontWeight: '900', letterSpacing: 0.5 },
  aiBody: { color: colors.textCaption, fontSize: ms(14), lineHeight: ms(22) },

  // AI locked card
  aiLockedCard: {
    borderRadius: radius.xxl, padding: spacing.xl, marginBottom: spacing.md,
    marginHorizontal: spacing.lg,
    alignItems: 'center', gap: ms(10),
    backgroundColor: colors.surfaceVariant,
    borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
    ...shadow.sm,
  },
  aiLockedTitle: { color: colors.textPrimary, fontSize: ms(18), fontWeight: '800' },
  aiLockedBody: { color: colors.textCaption, fontSize: ms(13), textAlign: 'center', lineHeight: ms(20) },
  aiLockedFeatures: { flexDirection: 'row', flexWrap: 'wrap', gap: s(8), justifyContent: 'center', marginTop: vs(4) },
  aiLockedFeature: {
    flexDirection: 'row', alignItems: 'center', gap: s(4),
    backgroundColor: colors.accentSubtle, borderRadius: radius.pill,
    paddingHorizontal: s(10), paddingVertical: vs(5),
  },
  aiLockedFeatureText: { color: colors.accentHover, fontSize: ms(12), fontWeight: '600' },

  // Insight sections
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: ms(10), marginBottom: vs(10) },
  insightIcon: { width: ms(28), height: ms(28), borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  insightBlock: { marginBottom: spacing.md },
  adAngle: { color: colors.accent, fontStyle: 'italic' },

  // Actions
  actionsWrap: { gap: spacing.sm, paddingHorizontal: spacing.lg, marginTop: spacing.sm },
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  watchlistBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: ms(8),
    borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.card, paddingVertical: vs(13),
    ...shadow.sm,
  },
  watchlistBtnText: { fontWeight: '700' },
  halfBtn: { flex: 1, borderRadius: radius.pill, overflow: 'hidden', ...shadow.sm },
  halfBtnDisabled: { opacity: 0.5 },
  halfBtnInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: ms(6),
    borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.card, paddingVertical: vs(13),
  },
  halfBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: ms(6), paddingVertical: vs(13),
  },
  halfBtnText: { fontWeight: '700' },
  actionBtn: { borderRadius: radius.lg, flex: 1 },
  actionBtnContent: { paddingVertical: vs(4) },
  unlockingText: { fontSize: ms(12), color: colors.muted, textAlign: 'center' },

  // ─── AI Ad Copy Generator ────────────────────────────────────────────────────
  adCopyGenBtn: {
    marginTop: vs(10),
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  adCopyGenBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(8),
    paddingVertical: vs(14),
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
  },
  adCopyGenBtnText: {
    color: colors.white,
    fontSize: ms(15),
    fontWeight: '700',
    flex: 1,
  },
  adCopyCostPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(3),
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.pill,
    paddingHorizontal: s(10),
    paddingVertical: vs(4),
  },
  adCopyCostPillText: {
    color: colors.white,
    fontSize: ms(11),
    fontWeight: '700',
  },
  adCopyLoadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(10),
    paddingVertical: vs(16),
    justifyContent: 'center',
  },
  adCopyLoadingText: {
    color: colors.textCaption,
    fontSize: ms(13),
    fontStyle: 'italic',
  },
  adCopyInsufficientWrap: {
    gap: ms(6),
    paddingTop: vs(10),
  },
  adCopyInsufficientText: {
    color: colors.textCaption,
    fontSize: ms(13),
    lineHeight: ms(20),
  },
  adCopyBuyLink: {
    color: colors.accent,
    fontSize: ms(13),
    fontWeight: '700',
  },
  adCopyErrorWrap: {
    gap: ms(6),
    paddingTop: vs(10),
  },
  adCopyErrorText: {
    color: colors.textCaption,
    fontSize: ms(13),
    lineHeight: ms(20),
  },
  adCopyRetryLink: {
    color: colors.danger,
    fontSize: ms(13),
    fontWeight: '700',
  },
  adScriptsWrap: {
    gap: ms(10),
    marginTop: vs(12),
  },

  // ─── AdScriptCard ────────────────────────────────────────────────────────────
  adScriptCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderLeftWidth: ms(3),
    padding: spacing.lg,
    gap: ms(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: ms(1) },
    shadowOpacity: 0.05,
    shadowRadius: ms(8),
    elevation: 1,
  },
  adScriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(8),
    marginBottom: vs(6),
  },
  adScriptIconWrap: {
    width: ms(26),
    height: ms(26),
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adScriptPlatform: {
    color: colors.textPrimary,
    fontSize: ms(12),
    fontWeight: '800',
    letterSpacing: ms(0.5),
    flex: 1,
  },
  adScriptShareBtn: {
    padding: ms(4),
  },
  adScriptHeadline: {
    color: colors.textPrimary,
    fontSize: ms(15),
    fontWeight: '800',
    lineHeight: ms(22),
  },
  adScriptBody: {
    color: colors.textCaption,
    fontSize: ms(13),
    lineHeight: ms(21),
  },
  adScriptCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(5),
    marginTop: vs(4),
  },
  adScriptCta: {
    color: colors.accent,
    fontSize: ms(13),
    fontWeight: '700',
    fontStyle: 'italic',
  },
});
