import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { ms, vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ms(8),
    backgroundColor: colors.premiumSubtle,
    borderBottomWidth: 1,
    borderBottomColor: colors.premiumSoft,
    paddingVertical: vs(6),
    paddingHorizontal: spacing.lg,
  },
  dot: {
    width: ms(7),
    height: ms(7),
    borderRadius: ms(4),
    backgroundColor: colors.premium,
  },
  text: {
    fontSize: ms(11),
    fontWeight: '700',
    color: colors.premium,
    letterSpacing: ms(0.5),
  },
});
