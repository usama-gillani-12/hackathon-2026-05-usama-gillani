import { ms } from './responsive';

export const spacing = {
  xs: ms(4),
  sm: ms(8),
  md: ms(12),
  lg: ms(16),
  xl: ms(20),
  xxl: ms(24),
  xxxl: ms(32),
};

export const radius = {
  sm: ms(6),
  md: ms(10),
  lg: ms(14),
  xl: ms(20),
  pill: 999,
};

export const shadow = {
  card: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: ms(2) },
    shadowOpacity: 0.06,
    shadowRadius: ms(8),
    elevation: 2,
  },
  cardLg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: ms(6) },
    shadowOpacity: 0.1,
    shadowRadius: ms(14),
    elevation: 4,
  },
};
