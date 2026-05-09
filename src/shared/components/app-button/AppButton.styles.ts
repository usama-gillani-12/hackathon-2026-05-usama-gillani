import { StyleSheet } from 'react-native';
import { radius, spacing } from '@theme/spacing';
import { vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    borderWidth: 1,
    minHeight: vs(48),
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: { marginRight: spacing.sm },
  iconRight: { marginLeft: spacing.sm },
});
