import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { radius, spacing } from '@theme/spacing';
import { ms, vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: ms(20), fontWeight: '700', color: colors.primary },
  emptySub: { fontSize: ms(14), color: colors.muted, textAlign: 'center' },
  emptyBtn: { marginTop: spacing.sm, borderRadius: radius.lg },
  banner: {
    flexDirection: 'row', backgroundColor: colors.card,
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  bannerItem: { flex: 1, alignItems: 'center' },
  bannerVal: { fontSize: ms(18), fontWeight: '800', color: colors.primary },
  bannerLbl: { fontSize: ms(10), color: colors.muted, marginTop: vs(1) },
  bannerDivider: { width: 1, backgroundColor: colors.border },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxxl },
});
