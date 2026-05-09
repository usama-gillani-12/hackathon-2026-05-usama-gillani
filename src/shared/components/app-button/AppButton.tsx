import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { colors } from '@theme/colors';
import { buttonShadow } from '@theme/spacing';
import { typography } from '@theme/typography';
import { ms, s, vs } from '@theme/responsive';
import { styles } from './AppButton.styles';

export type AppButtonVariant = 'primary' | 'secondary' | 'ghost' | 'success' | 'danger' | 'premium';
export type AppButtonSize = 'sm' | 'md' | 'lg';

interface Props {
  title: string;
  onPress?: () => void;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  loading?: boolean;
  disabled?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const sizeMap: Record<AppButtonSize, { paddingV: number; paddingH: number; font: number }> = {
  sm: { paddingV: vs(8), paddingH: s(12), font: ms(13) },
  md: { paddingV: vs(12), paddingH: s(16), font: ms(14) },
  lg: { paddingV: vs(14), paddingH: s(18), font: ms(15) },
};

export const AppButton: React.FC<Props> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  iconLeft,
  iconRight,
  style,
  textStyle,
  fullWidth,
}) => {
  const sz = sizeMap[size];
  const palette = paletteFor(variant, disabled);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={loading || disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        variantShadow(variant, disabled),
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
          paddingVertical: sz.paddingV,
          paddingHorizontal: sz.paddingH,
          opacity: pressed && !disabled ? 0.88 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      <View style={styles.row}>
        {loading ? (
          <ActivityIndicator color={palette.text} size="small" />
        ) : (
          <>
            {iconLeft ? <View style={styles.iconLeft}>{iconLeft}</View> : null}
            <Text
              style={[
                typography.bodyStrong,
                { color: palette.text, fontSize: sz.font },
                textStyle,
              ]}
            >
              {title}
            </Text>
            {iconRight ? <View style={styles.iconRight}>{iconRight}</View> : null}
          </>
        )}
      </View>
    </Pressable>
  );
};

function variantShadow(variant: AppButtonVariant, disabled: boolean): ViewStyle {
  if (disabled) return {};
  switch (variant) {
    case 'primary':  return buttonShadow(colors.primary);
    case 'success':  return buttonShadow(colors.success);
    case 'danger':   return buttonShadow(colors.danger);
    case 'premium':  return buttonShadow(colors.premium);
    default:         return {};
  }
}

function paletteFor(variant: AppButtonVariant, disabled: boolean) {
  if (disabled) {
    return { bg: colors.mutedSoft, text: colors.muted, border: colors.border };
  }
  switch (variant) {
    case 'primary':
      return { bg: colors.primary, text: colors.white, border: colors.primary };
    case 'secondary':
      return { bg: colors.white, text: colors.primary, border: colors.border };
    case 'ghost':
      return { bg: 'transparent', text: colors.accent, border: 'transparent' };
    case 'success':
      return { bg: colors.success, text: colors.white, border: colors.success };
    case 'danger':
      return { bg: colors.danger, text: colors.white, border: colors.danger };
    case 'premium':
      return { bg: colors.premium, text: colors.white, border: colors.premium };
    default:
      return { bg: colors.primary, text: colors.white, border: colors.primary };
  }
}

