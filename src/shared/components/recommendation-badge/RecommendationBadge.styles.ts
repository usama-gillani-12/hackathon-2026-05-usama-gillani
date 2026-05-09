import { StyleSheet } from 'react-native';
import { radius, spacing } from '@theme/spacing';
import { ms } from '@theme/responsive';

export const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
  },
  dot: {
    width: ms(6),
    height: ms(6),
    borderRadius: ms(3),
    marginRight: spacing.xs,
  },
});
