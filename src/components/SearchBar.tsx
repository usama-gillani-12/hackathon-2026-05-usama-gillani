import React, { useEffect, useRef } from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../theme/colors';
import { radius } from '../theme/spacing';
import { ms, s, vs } from '../theme/responsive';
import { hapticLight } from '../utils/haptics';
import { AppText } from './AppText';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onCancel?: () => void;
  focused: boolean;
  placeholder?: string;
}

const CANCEL_WIDTH = s(60);
const CANCEL_FULL_MARGIN = CANCEL_WIDTH + s(8);

export const SearchBar: React.FC<Props> = ({
  value,
  onChangeText,
  onFocus,
  onBlur,
  onCancel,
  focused,
  placeholder = 'Search products, categories…',
}) => {
  const inputRef = useRef<TextInput>(null);
  const cancelAnim = useSharedValue(0); // 0 = hidden, 1 = visible

  useEffect(() => {
    cancelAnim.value = withSpring(focused ? 1 : 0, { damping: 18, stiffness: 200 });
    if (focused) inputRef.current?.focus();
  }, [focused]);

  const barStyle = useAnimatedStyle(() => ({
    marginRight: interpolate(cancelAnim.value, [0, 1], [0, CANCEL_FULL_MARGIN], Extrapolation.CLAMP),
  }));

  const cancelStyle = useAnimatedStyle(() => ({
    opacity: cancelAnim.value,
    transform: [
      { translateX: interpolate(cancelAnim.value, [0, 1], [CANCEL_WIDTH, 0], Extrapolation.CLAMP) },
    ],
  }));

  const handleCancel = () => {
    hapticLight();
    onChangeText('');
    inputRef.current?.blur();
    onCancel?.();
  };

  const iconColor = focused ? colors.accent : colors.textCaption;

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.barWrap, barStyle]}>
        {Platform.OS === 'ios' ? (
          <BlurView
            blurType="light"
            blurAmount={20}
            reducedTransparencyFallbackColor={colors.surfaceVariant}
            style={styles.blurFill}
          >
            <SearchBarInner
              inputRef={inputRef}
              value={value}
              onChangeText={onChangeText}
              onFocus={onFocus}
              onBlur={onBlur}
              iconColor={iconColor}
              placeholder={placeholder}
              focused={focused}
            />
          </BlurView>
        ) : (
          <View style={[styles.blurFill, styles.androidFill]}>
            <SearchBarInner
              inputRef={inputRef}
              value={value}
              onChangeText={onChangeText}
              onFocus={onFocus}
              onBlur={onBlur}
              iconColor={iconColor}
              placeholder={placeholder}
              focused={focused}
            />
          </View>
        )}
        {/* Focus border overlay */}
        {focused && <View style={styles.focusBorder} pointerEvents="none" />}
      </Animated.View>

      {/* Cancel button slides in from right */}
      <Animated.View style={[styles.cancelWrap, cancelStyle]}>
        <TouchableOpacity onPress={handleCancel} hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}>
          <AppText variant="callout" color={colors.accent}>Cancel</AppText>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

interface InnerProps {
  inputRef: React.RefObject<TextInput>;
  value: string;
  onChangeText: (t: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  iconColor: string;
  placeholder: string;
  focused: boolean;
}

const SearchBarInner: React.FC<InnerProps> = ({
  inputRef, value, onChangeText, onFocus, onBlur, iconColor, placeholder, focused,
}) => (
  <View style={styles.innerRow}>
    <MaterialCommunityIcons name="magnify" size={ms(18)} color={iconColor} />
    <TextInput
      ref={inputRef}
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      placeholderTextColor={colors.textCaption}
      returnKeyType="search"
      autoCorrect={false}
      autoCapitalize="none"
      clearButtonMode="never"
    />
    {value.length > 0 && (
      <TouchableOpacity
        onPress={() => { hapticLight(); onChangeText(''); }}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <MaterialCommunityIcons name="close-circle" size={ms(16)} color={colors.textCaption} />
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barWrap: {
    flex: 1,
    height: vs(44),
    borderRadius: radius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  blurFill: {
    flex: 1,
  },
  androidFill: {
    backgroundColor: colors.surfaceVariant,
  },
  focusBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.accent,
  },
  innerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(12),
    gap: s(8),
  },
  input: {
    flex: 1,
    fontSize: ms(15),
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  cancelWrap: {
    position: 'absolute',
    right: 0,
    width: CANCEL_WIDTH,
    alignItems: 'flex-end',
  },
});
