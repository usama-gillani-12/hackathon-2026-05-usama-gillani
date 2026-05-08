import { TextStyle } from 'react-native';
import { ms } from './responsive';

// System fonts: SF Pro on iOS, Roboto on Android (both are undefined = native default).
// To use Metropolis (the Figma source font), bundle it and set fontFamily: 'Metropolis'
// on every token below — no other changes needed.

export const typography: Record<string, TextStyle> = {
  // ── Display / Hero ────────────────────────────────────────────────────────
  // Full-bleed banner text (Figma: Metropolis Black 48px)
  displayHero: { fontSize: ms(46), fontWeight: '900', letterSpacing: ms(-0.5) },
  // Section headers: "New", "Trending" (Figma: Metropolis Bold 34px)
  displayLg:   { fontSize: ms(34), fontWeight: '800', letterSpacing: ms(-0.3) },
  // Product headline on detail screen (Figma: Metropolis SemiBold 24px)
  displayMd:   { fontSize: ms(24), fontWeight: '700', letterSpacing: ms(-0.2) },

  // ── Headings ──────────────────────────────────────────────────────────────
  h1: { fontSize: ms(20), fontWeight: '700' },
  // Nav bar titles & sub-section heads (Figma: Metropolis SemiBold 18px)
  h2: { fontSize: ms(18), fontWeight: '700' },
  h3: { fontSize: ms(16), fontWeight: '600' },

  // ── Body ──────────────────────────────────────────────────────────────────
  // Explicit lineHeight matches Figma "14px Medium" spec (lineHeight: 20)
  body:       { fontSize: ms(14), fontWeight: '400', lineHeight: ms(20) },
  bodyStrong: { fontSize: ms(14), fontWeight: '600', lineHeight: ms(20) },
  // Price display (Figma: Metropolis Medium 14px)
  price:      { fontSize: ms(14), fontWeight: '500', lineHeight: ms(20) },

  // ── Caption / Metadata ────────────────────────────────────────────────────
  // Brand names, card metadata (Figma: Metropolis Regular 11px)
  caption:       { fontSize: ms(11), fontWeight: '400' },
  captionStrong: { fontSize: ms(11), fontWeight: '700' },
  // Legacy aliases — kept so existing code doesn't break
  small:       { fontSize: ms(12), fontWeight: '400' },
  smallStrong: { fontSize: ms(12), fontWeight: '600' },

  // ── Micro / Labels ────────────────────────────────────────────────────────
  // Bottom tab bar labels (Figma: Metropolis Regular 10px)
  tabLabel: { fontSize: ms(10), fontWeight: '400' },
  // Tracked micro-labels (badges, chips)
  tiny:     { fontSize: ms(10), fontWeight: '600', letterSpacing: ms(0.4) },

  // ── Numeric display ───────────────────────────────────────────────────────
  numericLg: { fontSize: ms(26), fontWeight: '800' },
};
