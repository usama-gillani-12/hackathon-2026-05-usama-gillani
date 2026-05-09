import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { radius, shadow, spacing } from '@theme/spacing';
import { ms, s, vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.heroDark,
    borderRadius: radius.xl,
    padding: spacing.lg,
    overflow: 'hidden',
    ...shadow.cardLg,
  },
  shine: {
    position: 'absolute',
    top: vs(-40),
    right: s(-40),
    width: s(160),
    height: vs(160),
    borderRadius: ms(80),
    backgroundColor: 'rgba(192,139,48,0.35)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  actions: {
    marginLeft: spacing.lg,
    alignItems: 'flex-end',
  },
  primaryAction: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    paddingVertical: vs(8),
    paddingHorizontal: s(12),
    marginBottom: spacing.sm,
  },
  secondaryAction: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: radius.lg,
    paddingVertical: vs(8),
    paddingHorizontal: s(12),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  demoTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(192,139,48,0.25)',
    borderRadius: radius.pill,
    paddingVertical: vs(4),
    paddingHorizontal: s(8),
    alignSelf: 'flex-start',
    marginTop: spacing.md,
  },
  demoDot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    backgroundColor: colors.accent,
  },
});
