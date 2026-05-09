import { StyleSheet } from 'react-native';
import { colors } from '@theme/colors';
import { radius } from '@theme/spacing';
import { ms, s, vs } from '@theme/responsive';

const CANCEL_WIDTH = s(60);

export const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barWrap: {
    flex: 1,
    height: vs(44),
    borderRadius: radius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  blurFill: {
    flex: 1,
  },
  androidFill: {
    backgroundColor: colors.surfaceVariant,
  },
  focusBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  innerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(12),
    gap: s(8),
  },
  input: {
    flex: 1,
    fontSize: ms(15),
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  cancelWrap: {
    position: 'absolute',
    right: 0,
    width: CANCEL_WIDTH,
    alignItems: 'flex-end',
  },
});
