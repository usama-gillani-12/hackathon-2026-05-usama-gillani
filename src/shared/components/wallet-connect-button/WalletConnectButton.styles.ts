import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { radius, spacing } from '@theme/spacing';
import { ms, s, vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  connectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(8),
    borderRadius: radius.xl,
    paddingVertical: vs(16),
    paddingHorizontal: spacing.xl,
  },
  connectBtnText: {
    color: colors.white,
    fontSize: ms(16),
    fontWeight: '800',
  },
  connectedCard: {
    borderRadius: radius.xl,
    backgroundColor: colors.successSubtle,
    borderWidth: 1,
    borderColor: colors.borderSuccess,
    padding: spacing.md,
  },
  connectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
  },
  connectedDot: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: colors.success,
  },
  connectedAddress: {
    flex: 1,
    fontSize: ms(14),
    fontWeight: '700',
    color: colors.primary,
    fontFamily: 'monospace',
  },
  networkBadge: {
    backgroundColor: colors.successSoft,
    borderRadius: radius.pill,
    paddingHorizontal: s(10),
    paddingVertical: vs(3),
  },
  networkBadgeText: {
    fontSize: ms(10),
    fontWeight: '800',
    color: colors.success,
    letterSpacing: 0.4,
  },
  disconnectBtn: {
    marginTop: vs(8),
    alignSelf: 'flex-end',
  },
  disconnectText: {
    fontSize: ms(12),
    color: colors.muted,
    fontWeight: '600',
  },
});
