import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { spacing, radius } from '@theme/spacing';
import { ms, s, vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  menuBtn: {
    width: ms(40), height: ms(40),
    borderRadius: radius.md,
    backgroundColor: colors.mutedSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(8),
  },
  screenTitle: {
    fontSize: ms(18),
    fontWeight: '700',
    color: colors.primary,
  },
  unreadBadge: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: s(8),
    paddingVertical: vs(2),
  },
  unreadBadgeText: {
    color: colors.white,
    fontSize: ms(11),
    fontWeight: '700',
  },
  clearBtn: { paddingVertical: vs(4) },
  clearText: {
    fontSize: ms(12),
    color: colors.accent,
    fontWeight: '600',
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    position: 'relative',
  },
  cardUnread: {
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: `${colors.accent}33`,
  },
  unreadDot: {
    position: 'absolute',
    top: vs(12),
    right: s(12),
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: colors.accent,
  },
  iconWrap: {
    width: ms(44),
    height: ms(44),
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardBody: { flex: 1 },
  cardTitle: {
    fontSize: ms(14),
    fontWeight: '600',
    color: colors.primary,
    marginBottom: vs(4),
  },
  cardTitleUnread: { fontWeight: '700' },
  cardBody2: {
    fontSize: ms(13),
    color: colors.muted,
    lineHeight: ms(18),
    marginBottom: vs(6),
  },
  cardTime: {
    fontSize: ms(11),
    color: colors.muted,
  },
  empty: {
    alignItems: 'center',
    paddingTop: vs(80),
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: ms(18),
    fontWeight: '700',
    color: colors.primary,
  },
  emptySub: {
    fontSize: ms(14),
    color: colors.muted,
  },
});
