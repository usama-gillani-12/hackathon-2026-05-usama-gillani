import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { radius, shadow, spacing } from '@theme/spacing';
import { ms, s, vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xxl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadow.md,
  },
  cardSelected: {
    borderColor: colors.accent,
    borderWidth: 1.5,
  },

  // ── Image (16:10)
  imageWrap: {
    width: '100%',
    aspectRatio: 16 / 10,
    backgroundColor: colors.heroLight,
    overflow: 'hidden',
    position: 'relative',
  },
  image: { width: '100%', height: '100%', resizeMode: 'cover' },
  imageScrim: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '50%' },

  hotStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ms(3),
  },

  // ── Badges over image
  topLeftBadges: {
    position: 'absolute',
    top: vs(10),
    left: s(10),
    flexDirection: 'row',
    gap: s(6),
  },
  premiumChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(3),
    borderRadius: radius.pill,
    paddingHorizontal: s(8),
    paddingVertical: vs(3),
  },
  premiumChipText: { fontWeight: '900', letterSpacing: 0.5 },

  sourceChip: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radius.pill,
    paddingHorizontal: s(8),
    paddingVertical: vs(3),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  sourceChipText: { fontWeight: '800', letterSpacing: 0.4 },

  scoreChipWrap: {
    position: 'absolute',
    top: vs(10),
    right: s(10),
  },
  scoreChip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: s(1),
    minWidth: ms(48),
    borderRadius: radius.pill,
    paddingHorizontal: s(10),
    paddingVertical: vs(5),
    backgroundColor: 'rgba(15,18,28,0.55)',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  scoreChipHigh: {
    // gradient fills via absolute child; this just sets the shape
  },
  scoreChipNum: { fontWeight: '900', letterSpacing: 0 },

  imageBottomRow: {
    position: 'absolute',
    bottom: vs(10),
    left: s(10),
    right: s(10),
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
  },
  categoryPill: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radius.pill,
    paddingHorizontal: s(9),
    paddingVertical: vs(3),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.18)',
    flexShrink: 1,
  },
  categoryPillText: { fontWeight: '800', letterSpacing: 0.6 },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(3),
    borderRadius: radius.pill,
    paddingHorizontal: s(8),
    paddingVertical: vs(3),
  },
  trendText: { fontWeight: '800', letterSpacing: 0.4 },

  // ── Premium lock
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockContent: { alignItems: 'center', paddingHorizontal: spacing.lg },
  lockIconWrap: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(22),
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(6),
    marginTop: vs(10),
    borderRadius: radius.pill,
    paddingHorizontal: s(16),
    paddingVertical: vs(9),
    overflow: 'hidden',
  },

  // ── Content
  content: {
    padding: spacing.md,
  },
  title: { marginBottom: vs(6) },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: s(6),
    marginBottom: spacing.sm,
  },
  selectedTag: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingVertical: vs(2),
    paddingHorizontal: s(8),
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.lg,
    paddingVertical: vs(10),
    paddingHorizontal: s(8),
  },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontWeight: '800', marginTop: vs(2) },
  statDivider: { width: 1, height: ms(22), backgroundColor: colors.border },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: s(3) },
});
