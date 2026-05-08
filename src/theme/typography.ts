import { TextStyle } from 'react-native';
import { ms } from './responsive';

export const typography: Record<string, TextStyle> = {
  displayLg: { fontSize: ms(28), fontWeight: '800', letterSpacing: ms(-0.5) },
  displayMd: { fontSize: ms(22), fontWeight: '700', letterSpacing: ms(-0.2) },
  h1: { fontSize: ms(20), fontWeight: '700' },
  h2: { fontSize: ms(18), fontWeight: '700' },
  h3: { fontSize: ms(16), fontWeight: '600' },
  body: { fontSize: ms(14), fontWeight: '400' },
  bodyStrong: { fontSize: ms(14), fontWeight: '600' },
  small: { fontSize: ms(12), fontWeight: '400' },
  smallStrong: { fontSize: ms(12), fontWeight: '600' },
  tiny: { fontSize: ms(10), fontWeight: '600', letterSpacing: ms(0.4) },
  numericLg: { fontSize: ms(26), fontWeight: '800' },
};
