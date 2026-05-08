import { MD3LightTheme } from 'react-native-paper';
import { colors } from './colors';

export const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.accent,
    secondary: colors.premium,
    surface: colors.card,
    surfaceVariant: colors.mutedSoft,
    background: colors.background,
    onBackground: colors.primary,
    onSurface: colors.primary,
    onSurfaceVariant: colors.muted,
    outline: colors.border,
    error: colors.danger,
    primaryContainer: colors.accentSoft,
    secondaryContainer: colors.premiumSoft,
  },
};

export type AppTheme = typeof paperTheme;
