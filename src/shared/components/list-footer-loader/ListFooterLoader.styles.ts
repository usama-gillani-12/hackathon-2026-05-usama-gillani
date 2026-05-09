import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { ms, vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  footer: {
    paddingVertical: vs(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  allText: {
    fontSize: ms(12),
    color: colors.muted,
    fontWeight: '500',
  },
});
