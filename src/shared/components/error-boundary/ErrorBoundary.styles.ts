import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { radius, spacing } from '@theme/spacing';
import { ms, vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: {
    alignItems: 'center',
    padding: spacing.xxxl,
    paddingTop: vs(80),
    gap: spacing.sm,
  },
  iconWrap: {
    width: ms(88),
    height: ms(88),
    borderRadius: ms(44),
    backgroundColor: 'rgba(220,38,38,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { fontSize: ms(22), fontWeight: '800', color: colors.white, textAlign: 'center' },
  sub: { fontSize: ms(14), color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: ms(20) },
  card: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  errorLabel: { fontSize: ms(10), fontWeight: '700', color: colors.muted, letterSpacing: ms(0.8), marginBottom: vs(6) },
  errorText: { fontSize: ms(13), color: colors.danger, fontFamily: 'monospace', lineHeight: ms(20) },
  btn: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: radius.lg,
  },
  btnContent: { paddingVertical: vs(4) },
});
