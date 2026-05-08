import { Platform, TextStyle } from 'react-native';
import { ms } from './responsive';

// ── Font families ─────────────────────────────────────────────────────────────
// On iOS, leaving fontFamily undefined uses San Francisco (SF Pro). Apple's
// optical-size mechanism automatically picks SF Pro Display for >=20pt and
// SF Pro Text for <20pt — that is the single biggest "feels native" win, and
// we get it for free by *not* specifying a font.
//
// On Android we let it fall through to Roboto (the platform default).
//
// fontFamily is only set when we want to override the system — kept undefined
// in every token below.
export const fontFamily = {
  ios: undefined as string | undefined,
  android: undefined as string | undefined,
};

// Tabular (monospaced) numerals for prices, scores, count-ups. Without this,
// the digits 0–9 have varying advance widths and "1,234" jitters as digits change.
export const tabularNums: TextStyle = Platform.select({
  ios: { fontVariant: ['tabular-nums'] as TextStyle['fontVariant'] },
  default: {},
}) as TextStyle;

// ── iOS type scale ────────────────────────────────────────────────────────────
// Sizes / line-heights / tracking lifted from Apple Human Interface Guidelines
// (Typography). Values are routed through ms() so they scale on small / large
// screens consistently with the rest of the design system.
//
// Use via the <AppText variant="..."> primitive — do not import directly into
// StyleSheet.create blocks.
export const typeScale = {
  largeTitle: {
    fontSize: ms(34),
    lineHeight: ms(41),
    letterSpacing: ms(-0.4),
    fontWeight: '700',
  },
  title1: {
    fontSize: ms(28),
    lineHeight: ms(34),
    letterSpacing: ms(-0.4),
    fontWeight: '700',
  },
  title2: {
    fontSize: ms(22),
    lineHeight: ms(28),
    letterSpacing: ms(-0.3),
    fontWeight: '700',
  },
  title3: {
    fontSize: ms(20),
    lineHeight: ms(25),
    letterSpacing: ms(-0.2),
    fontWeight: '600',
  },
  headline: {
    fontSize: ms(17),
    lineHeight: ms(22),
    letterSpacing: ms(-0.4),
    fontWeight: '600',
  },
  body: {
    fontSize: ms(17),
    lineHeight: ms(22),
    letterSpacing: 0,
    fontWeight: '400',
  },
  callout: {
    fontSize: ms(16),
    lineHeight: ms(21),
    letterSpacing: 0,
    fontWeight: '500',
  },
  subhead: {
    fontSize: ms(15),
    lineHeight: ms(20),
    letterSpacing: 0,
    fontWeight: '400',
  },
  footnote: {
    fontSize: ms(13),
    lineHeight: ms(18),
    letterSpacing: 0,
    fontWeight: '400',
  },
  caption1: {
    fontSize: ms(12),
    lineHeight: ms(16),
    letterSpacing: 0,
    fontWeight: '400',
  },
  caption2: {
    fontSize: ms(11),
    lineHeight: ms(13),
    letterSpacing: ms(0.5),
    fontWeight: '700',
  },
} as const satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof typeScale;

// ── Legacy tokens (kept so existing screens compile unchanged) ───────────────
// New code should consume `typeScale` via <AppText variant="..."> instead.
export const typography: Record<string, TextStyle> = {
  // ── Display / Hero ────────────────────────────────────────────────────────
  displayHero: { fontSize: ms(46), fontWeight: '900', letterSpacing: ms(-0.5) },
  displayLg:   { fontSize: ms(34), fontWeight: '800', letterSpacing: ms(-0.3) },
  displayMd:   { fontSize: ms(24), fontWeight: '700', letterSpacing: ms(-0.2) },

  // ── Headings ──────────────────────────────────────────────────────────────
  h1: { fontSize: ms(20), fontWeight: '700' },
  h2: { fontSize: ms(18), fontWeight: '700' },
  h3: { fontSize: ms(16), fontWeight: '600' },

  // ── Body ──────────────────────────────────────────────────────────────────
  body:       { fontSize: ms(14), fontWeight: '400', lineHeight: ms(20) },
  bodyStrong: { fontSize: ms(14), fontWeight: '600', lineHeight: ms(20) },
  price:      { fontSize: ms(14), fontWeight: '500', lineHeight: ms(20) },

  // ── Caption / Metadata ────────────────────────────────────────────────────
  caption:       { fontSize: ms(11), fontWeight: '400' },
  captionStrong: { fontSize: ms(11), fontWeight: '700' },
  small:       { fontSize: ms(12), fontWeight: '400' },
  smallStrong: { fontSize: ms(12), fontWeight: '600' },

  // ── Micro / Labels ────────────────────────────────────────────────────────
  tabLabel: { fontSize: ms(10), fontWeight: '400' },
  tiny:     { fontSize: ms(10), fontWeight: '600', letterSpacing: ms(0.4) },

  // ── Numeric display ───────────────────────────────────────────────────────
  numericLg: { fontSize: ms(26), fontWeight: '800' },
};
