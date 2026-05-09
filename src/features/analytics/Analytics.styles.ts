import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { spacing, radius, shadow } from '@theme/spacing';
import { ms, vs } from '@theme/responsive';
import { typography } from '@theme/typography';
import { DONUT_SIZE, DONUT_R, DONUT_STROKE, CIRCUMFERENCE } from './Analytics.hooks';

// Layout constants (width-independent) — re-declared here for style sheet access
const CARD_MX   = spacing.lg;
const CARD_PAD  = spacing.lg;
const BAR_LABEL_W = ms(88);
const BAR_SCORE_W = ms(36);

export const kpiStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    paddingVertical: vs(12),
    paddingHorizontal: ms(8),
    alignItems: 'center',
    gap: vs(4),
  },
  cardHL: {
    backgroundColor: 'rgba(255,255,255,0.11)',
    borderColor: 'rgba(255,255,255,0.20)',
  },
  iconWrap: {
    width: ms(32), height: ms(32),
    borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: vs(2),
  },
  val: {
    ...typography.numericLg,
    color: colors.white,
    letterSpacing: ms(-0.8),
  },
  lbl: {
    fontSize: ms(9),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase',
    letterSpacing: ms(0.5),
    textAlign: 'center',
  },
});

export const barStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(9),
  },
  label: {
    width: BAR_LABEL_W,
    fontSize: ms(11),
    fontWeight: '500',
    color: colors.textSecondary,
  },
  trackArea: { flex: 1 },
  score: {
    width: BAR_SCORE_W,
    textAlign: 'right',
    fontSize: ms(12),
    fontWeight: '800',
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
});

export const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: vs(40) },

  // Hero
  hero: { paddingBottom: vs(20) },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: vs(10),
    paddingBottom: vs(12),
  },
  navBtn: {
    width: ms(40), height: ms(40),
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  navCenter:  { alignItems: 'center' },
  heroTitle:  { fontSize: ms(18), fontWeight: '700', color: colors.white, letterSpacing: ms(-0.2) },
  heroSub:    { fontSize: ms(11), color: 'rgba(255,255,255,0.42)', marginTop: vs(1) },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginHorizontal: spacing.lg,
    marginBottom: vs(16),
  },
  kpiRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm },

  // Cards
  card: {
    marginHorizontal: CARD_MX,
    marginTop: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: CARD_PAD,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  lastCard: { marginBottom: spacing.lg },

  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.h2, color: colors.primary },
  sectionSub:   { ...typography.small, color: colors.muted, marginTop: vs(2) },

  pill: {
    backgroundColor: colors.accentSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: vs(3),
    borderRadius: radius.pill,
  },
  pillText: { fontSize: ms(9), fontWeight: '700', color: colors.accent, letterSpacing: ms(0.8) },

  seeAll: { ...typography.smallStrong, color: colors.accent, paddingTop: vs(2) },

  emptyState: { height: vs(90), alignItems: 'center', justifyContent: 'center', gap: vs(8) },
  emptyText:  { ...typography.small, color: colors.muted },

  // Donut
  donutRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing.xl, marginTop: vs(4) },
  donutWrap: { alignItems: 'center', justifyContent: 'center' },

  // Legend
  legend:      { flex: 1, gap: vs(10) },
  legendRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  legendDot:   { width: ms(8), height: ms(8), borderRadius: radius.pill, marginTop: vs(3) },
  legendTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  legendName:   { fontSize: ms(12), fontWeight: '700', color: colors.primary },
  legendCount:  { fontSize: ms(13), fontWeight: '800' },
  legendTrack:  { height: vs(4), backgroundColor: colors.border, borderRadius: radius.pill, marginTop: vs(4), overflow: 'hidden' },
  legendFill:   { height: '100%', borderRadius: radius.pill, opacity: 0.85 },
  legendRange:  { fontSize: ms(9), color: colors.muted, fontWeight: '500', marginTop: vs(2) },

  // Transactions
  txRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: vs(11) },
  txDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  txIcon:   { width: ms(36), height: ms(36), borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  txBody:   { flex: 1, marginLeft: spacing.md },
  txLabel:  { ...typography.bodyStrong, color: colors.primary },
  txSub:    { ...typography.small, color: colors.muted, marginTop: vs(1) },
  txRight:  { alignItems: 'flex-end', gap: vs(4) },
  txAmt:    { fontSize: ms(14), fontWeight: '800', letterSpacing: ms(-0.3) },
  txBadge:  { paddingHorizontal: spacing.sm, paddingVertical: vs(2), borderRadius: radius.pill },
  txBadgeText: { fontSize: ms(8), fontWeight: '700', letterSpacing: ms(0.6) },
});
