import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { radius, spacing } from '@theme/spacing';
import { ms, s, vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    backgroundColor: colors.card,
    overflow: 'hidden',
    marginBottom: vs(10),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: s(12),
  },
  headerText: { flex: 1 },
  title: { color: colors.white, fontSize: ms(17), fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.65)', fontSize: ms(11), marginTop: vs(2) },
  priceWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: s(2) },
  price: { color: colors.white, fontSize: ms(28), fontWeight: '900' },
  priceUnit: { color: 'rgba(255,255,255,0.7)', fontSize: ms(13), marginBottom: vs(4) },
  body: { padding: spacing.md, gap: vs(10) },
  creditsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(8),
    backgroundColor: colors.premiumSubtle,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  creditsLine: { fontSize: ms(14), fontWeight: '700', color: colors.primary },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: s(8),
  },
  perkText: { flex: 1, fontSize: ms(13), color: colors.muted, lineHeight: ms(19) },
  subscribeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(8),
    borderRadius: radius.xl,
    paddingVertical: vs(14),
    marginTop: vs(4),
  },
  subscribeBtnText: { color: colors.white, fontSize: ms(16), fontWeight: '800' },
  disclaimer: {
    fontSize: ms(11),
    color: colors.muted,
    textAlign: 'center',
    marginTop: vs(-4),
  },
});
