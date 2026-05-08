import { ViewStyle } from 'react-native';
import { ms } from './responsive';

export const spacing = {
  xs:   ms(4),
  sm:   ms(8),
  md:   ms(12),
  lg:   ms(16),
  page: ms(16), // horizontal page margin (Figma spec: 16px breathing room)
  xl:   ms(20),
  xxl:  ms(24),
  xxxl: ms(32),
};

export const radius = {
  sm:   ms(6),
  md:   ms(10),
  lg:   ms(14),
  xl:   ms(20),
  xxl:  ms(24), // minimum card radius — squircle / continuous corner feel
  pill: 999,
};

export const shadow = {
  // ── iOS-tuned elevation system ────────────────────────────────────────────
  // Use these on dark surfaces — opacity is bumped vs. the legacy `card`
  // tokens because faint shadows disappear against dark backgrounds.
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: ms(2) },
    shadowOpacity: 0.12,
    shadowRadius: ms(8),
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: ms(6) },
    shadowOpacity: 0.18,
    shadowRadius: ms(16),
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: ms(10) },
    shadowOpacity: 0.24,
    shadowRadius: ms(24),
    elevation: 8,
  },

  // Navigation bar — soft downward glow (Figma: 0px 4px 24px rgba(0,0,0,0.08))
  nav: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: ms(4) },
    shadowOpacity: 0.08,
    shadowRadius: ms(24),
    elevation: 3,
  },
  // Standard content card — floating feel
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: ms(2) },
    shadowOpacity: 0.06,
    shadowRadius: ms(12),
    elevation: 2,
  },
  // Elevated card (modals, featured tiles)
  cardLg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: ms(4) },
    shadowOpacity: 0.10,
    shadowRadius: ms(20),
    elevation: 4,
  },
  // Bottom tab bar — upward lift (Figma: 0px -4px 8px rgba(0,0,0,0.10))
  tabBar: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: ms(-4) },
    shadowOpacity: 0.10,
    shadowRadius: ms(8),
    elevation: 8,
  },
};

/** Tinted accent glow — pass any hex/rgba color to make the surface "halo" in that hue.
 * Useful for premium / live cards to draw the eye. */
export function glowShadow(hexColor: string): ViewStyle {
  return {
    shadowColor: hexColor,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: ms(18),
    elevation: 6,
  };
}

/** Tinted CTA button shadow — pass the button's background hex color (e.g. colors.accent). */
export function buttonShadow(hexColor: string): ViewStyle {
  return {
    shadowColor: hexColor,
    shadowOffset: { width: 0, height: ms(4) },
    shadowOpacity: 0.25,
    shadowRadius: ms(8),
    elevation: 3,
  };
}
