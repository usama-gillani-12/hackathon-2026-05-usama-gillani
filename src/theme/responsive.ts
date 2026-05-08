import { Dimensions } from 'react-native';
import {
  moderateScale,
  moderateVerticalScale,
  scale,
  verticalScale,
  ScaledSheet,
} from 'react-native-size-matters';

export const s = (size: number): number => scale(size);
export const vs = (size: number): number => verticalScale(size);
export const ms = (size: number, factor: number = 0.5): number =>
  moderateScale(size, factor);
export const mvs = (size: number, factor: number = 0.5): number =>
  moderateVerticalScale(size, factor);

export { ScaledSheet };

const { width, height } = Dimensions.get('window');
const shortest = Math.min(width, height);

export const screen = {
  width,
  height,
  isSmall: shortest < 360,
  isTablet: shortest >= 600,
};
