import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { radius, spacing } from '@theme/spacing';
import { ms } from '@theme/responsive';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  iconCircle: {
    width: ms(64),
    height: ms(64),
    borderRadius: radius.pill,
    backgroundColor: colors.mutedSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
