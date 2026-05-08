import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from 'react-native';
import { tabularNums, typeScale, TypeVariant } from '../theme/typography';
import { colors } from '../theme/colors';

export type AppTextProps = RNTextProps & {
  /** Type variant from the iOS scale (largeTitle → caption2). Defaults to `body`. */
  variant?: TypeVariant;
  /** Semantic color from the theme. Pass any string to override. Defaults to `textPrimary`. */
  color?: string;
  /** Apply tabular (monospaced) numerals — use for prices, scores, count-ups. */
  tabular?: boolean;
  /** Render as UPPERCASE. */
  uppercase?: boolean;
  /** Convenience: center-align the text. */
  center?: boolean;
};

/**
 * App-wide text primitive that maps a typography variant + theme color.
 *
 * Default: variant="body" + color={colors.textPrimary}.
 *
 * Prefer this over `<Text>` for any new code. Existing screens continue to
 * work unchanged — migration is incremental, starting with the Dashboard.
 */
export const AppText: React.FC<AppTextProps> = ({
  variant = 'body',
  color,
  tabular,
  uppercase,
  center,
  style,
  children,
  ...rest
}) => {
  const variantStyle = typeScale[variant] as TextStyle;
  const composed: TextStyle = {
    ...variantStyle,
    color: color ?? colors.textPrimary,
    ...(tabular ? tabularNums : null),
    ...(uppercase ? { textTransform: 'uppercase' as const } : null),
    ...(center ? { textAlign: 'center' as const } : null),
  };

  return (
    <RNText style={StyleSheet.flatten([composed, style])} {...rest}>
      {children}
    </RNText>
  );
};
