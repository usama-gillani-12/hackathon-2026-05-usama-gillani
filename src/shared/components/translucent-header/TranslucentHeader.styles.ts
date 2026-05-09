import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { shadow } from '@theme/spacing';
import { ms, vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  container: {
    zIndex: 10,
  },
  solid: {
    backgroundColor: colors.card,
    ...shadow.nav,
  },
  transparent: {
    backgroundColor: 'transparent',
  },
  bar: {
    height: vs(44),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: ms(8),
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: colors.primary,
  },
  side: {
    width: ms(44),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
