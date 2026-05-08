// ─── Palette (raw hex values) ───────────────────────────────────────────────

const palette = {
  // Warm ivory surfaces
  ivory:    '#F8F6F1',
  cream:    '#F1EDE5',
  white:    '#FFFFFF',

  // Ink blacks (hero darks & absolute text)
  ink950:   '#0A0A0A',
  ink900:   '#1A1A1A',
  ink800:   '#2D2D2D',

  // Warm text grays
  stone600: '#111111',
  stone500: '#5A5047',
  stone400: '#8A7D6E',
  stone300: '#B5A99A',
  stone200: '#C4B8A8',

  // Borders / dividers
  stone100: '#DDD5C8',
  sand200:  '#E8E2D8',

  // Gold (accent / premium — replaces blue & violet)
  gold600:  '#8B6218',
  gold500:  '#C08B30',
  gold400:  '#D4A84B',
  gold300:  '#F5E9D3',
  gold200:  '#FBF4E6',

  // Green (success / positive metrics)
  forest700: '#1C5C40',
  forest600: '#2E7D5A',
  forest100: '#E6F4ED',
  forest50:  '#F3FAF6',

  // Amber (warning)
  amber700: '#A86C08',
  amber600: '#D4880A',
  amber100: '#FDF0DC',
  amber50:  '#FEFAF0',

  // Red (danger / error)
  red700: '#962D22',
  red600: '#C0392B',
  red100: '#FAEAE8',
  red50:  '#FDF5F4',
} as const;

// ─── Semantic tokens ──────────────────────────────────────────────────────────

export const colors = {
  // Surface
  background: palette.ivory,
  card: palette.white,
  surfaceVariant: palette.cream,

  // Text
  textPrimary: palette.stone600,
  textSecondary: palette.stone500,
  textDisabled: palette.stone300,
  textInverse: palette.white,

  // Primary (near black — headings, nav chrome)
  primary: palette.stone600,

  // Accent — gold replaces blue
  accent: palette.gold500,
  accentHover: palette.gold600,
  accentSoft: palette.gold300,
  accentSubtle: palette.gold200,

  // Success — forest green
  success: palette.forest600,
  successDark: palette.forest700,
  successSoft: palette.forest100,
  successSubtle: palette.forest50,

  // Warning / Gold aliases
  warning: palette.amber600,
  warningDark: palette.amber700,
  warningSoft: palette.amber100,
  warningSubtle: palette.amber50,
  gold: palette.gold500,
  goldDark: palette.gold600,
  goldSoft: palette.gold300,

  // Danger / Error
  danger: palette.red600,
  dangerDark: palette.red700,
  dangerSoft: palette.red100,
  dangerSubtle: palette.red50,

  // Premium — gold instead of violet
  premium: palette.gold500,
  premiumDark: palette.gold600,
  premiumSoft: palette.gold300,
  premiumSubtle: palette.gold200,

  // UI chrome
  border: palette.stone100,
  borderFocus: palette.gold500,
  borderError: palette.red600,
  borderSuccess: palette.forest600,
  muted: palette.stone400,
  mutedSoft: palette.cream,
  divider: palette.sand200,

  // Hero / dark gradient stops (dark headers contrast against light body)
  heroDark: palette.ink950,
  heroMid: palette.ink900,
  heroLight: palette.ink800,

  // Absolute
  white: palette.white,
  black: palette.stone600,

  // Overlays — warm tinted
  overlay: 'rgba(17, 14, 10, 0.55)',
  overlayLight: 'rgba(17, 14, 10, 0.30)',
  overlayDark: 'rgba(10, 10, 10, 0.75)',

  // Score tier fills
  scoreLow: palette.red600,
  scoreMid: palette.amber600,
  scoreHigh: palette.forest600,
  scoreElite: palette.gold500,
} as const;

// ─── Gradient presets ─────────────────────────────────────────────────────────

export const gradients = {
  heroDark: [palette.ink950, palette.ink900] as [string, string],
  heroMid:  [palette.ink900, palette.ink800] as [string, string],
  accent:   [palette.gold400, palette.gold600] as [string, string],
  premium:  [palette.gold500, palette.gold600] as [string, string],
  success:  [palette.forest600, palette.forest700] as [string, string],
  gold:     [palette.gold400, palette.gold600] as [string, string],
} as const;

// ─── Alpha helpers ────────────────────────────────────────────────────────────

/** Returns a hex color at a given opacity (0–1). Works with 6-digit hex only. */
export function withOpacity(hex: string, opacity: number): string {
  const alpha = Math.round(Math.max(0, Math.min(1, opacity)) * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex}${alpha}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type ColorKey = keyof typeof colors;
export type GradientKey = keyof typeof gradients;

// ─── Palette export (for rare cases needing raw values) ───────────────────────
export { palette };
