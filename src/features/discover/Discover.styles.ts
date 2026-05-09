import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { radius, spacing, shadow } from '@theme/spacing';
import { ms, s, vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  // Header
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: vs(8),
    paddingBottom: vs(12),
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: vs(10),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: { letterSpacing: -0.4 },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(5),
    backgroundColor: colors.successSoft,
    paddingHorizontal: s(10),
    paddingVertical: vs(5),
    borderRadius: radius.pill,
  },
  liveDot: { width: ms(7), height: ms(7), borderRadius: ms(4), backgroundColor: colors.success },

  // Suggestions panel
  suggestionsPanel: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingTop: vs(12),
    paddingBottom: vs(14),
    gap: vs(4),
    ...shadow.sm,
  },
  suggestionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(6),
  },
  suggestionsLabel: { letterSpacing: ms(0.8) },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(10),
    paddingVertical: vs(10),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  recentText: { flex: 1 },
  trendingChips: { flexDirection: 'row', flexWrap: 'wrap', gap: s(8), marginTop: vs(6) },
  trendingChip: {
    flexDirection: 'row', alignItems: 'center', gap: s(4),
    backgroundColor: colors.accentSubtle,
    borderRadius: radius.pill,
    paddingHorizontal: s(12), paddingVertical: vs(6),
    borderWidth: 1, borderColor: colors.accentSoft,
  },

  // Category strip
  categoryStrip: {
    height: vs(54),
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    justifyContent: 'center',
  },
  categoryRow: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    gap: s(8),
  },
  chip: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceVariant,
  },
  chipActive: { borderColor: colors.accent },
  chipGradient: {
    flexDirection: 'row', alignItems: 'center',
    height: vs(36), paddingHorizontal: s(12), gap: s(5),
  },
  chipInner: {
    flexDirection: 'row', alignItems: 'center',
    height: vs(36), paddingHorizontal: s(12), gap: s(5),
  },
  chipEmoji: { fontSize: ms(13) },
  chipLabel: { fontWeight: '600' },
  chipLabelActive: { fontWeight: '700' },

  // List
  flatList: { flex: 1 },
  list: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingTop: vs(14), paddingBottom: vs(40) },
  categoryBanner: {
    borderRadius: radius.xl,
    padding: ms(16),
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(12),
    marginBottom: vs(14),
    ...shadow.md,
  },
  bannerEmoji: { fontSize: ms(38) },
  bannerContent: { flex: 1, gap: vs(2) },
  bannerLabel: { letterSpacing: ms(1) },
  bannerTitle: { letterSpacing: -0.4 },
  bannerBadge: {
    width: ms(40), height: ms(40), borderRadius: radius.lg,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { marginBottom: vs(12) },

  loadingWrap: {
    flexDirection: 'row', alignItems: 'center', gap: s(10),
    marginVertical: vs(10),
  },

  errorCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: s(10),
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.dangerSoft,
    padding: ms(14),
    marginBottom: vs(14),
  },
  retryBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    paddingHorizontal: s(10), paddingVertical: vs(4),
  },

  // Empty state
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: vs(48),
    gap: vs(10),
  },
  emptyIllu: { fontSize: ms(56), marginBottom: vs(4) },
  emptyTitle: { letterSpacing: -0.3 },
  emptySub: { maxWidth: s(240), lineHeight: ms(22) },
  emptyResetBtn: {
    borderRadius: radius.pill, overflow: 'hidden',
    marginTop: vs(8),
    ...shadow.sm, shadowColor: colors.premium,
  },
  emptyResetBtnInner: { paddingHorizontal: s(24), paddingVertical: vs(12) },
});
