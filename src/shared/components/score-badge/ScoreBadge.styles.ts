import { StyleSheet } from 'react-native';
import { radius } from '@theme/spacing';
import { s, vs } from '@theme/responsive';

export const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: s(70),
    marginBottom: vs(50),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginVertical: vs(2),
  },
});
