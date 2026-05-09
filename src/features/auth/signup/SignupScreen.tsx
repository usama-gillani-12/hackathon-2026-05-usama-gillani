import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Controller } from 'react-hook-form';
import { AuthStackParamList } from '@t/navigation';
import { colors, gradients } from '@theme/colors';
import { ms, s, vs } from '@theme/responsive';
import { hapticLight, hapticMedium } from '@utils/haptics';
import { AppText } from '@shared/components/app-text';
import { useSignup } from './Signup.hooks';
import { styles, floatStyles, ctaStyles } from './Signup.styles';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

// ── Floating label input ──────────────────────────────────────────────────────

interface FloatingInputProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  onBlur: () => void;
  onFocus?: () => void;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'words' | 'sentences' | 'characters';
  keyboardType?: 'default' | 'email-address';
  returnKeyType?: 'next' | 'done';
  onSubmitEditing?: () => void;
  inputRef?: React.RefObject<TextInput>;
  hasError?: boolean;
  hasSuccess?: boolean;
  rightSlot?: React.ReactNode;
  clearOnChange?: () => void;
}

const FLOAT_TRANSLATE_Y = -vs(16);
const FLOAT_FONT_DEFAULT = ms(14);
const FLOAT_FONT_FLOATED = ms(11);

const FloatingInput: React.FC<FloatingInputProps> = ({
  label, value, onChangeText, onBlur, onFocus, secureTextEntry,
  autoCapitalize = 'none', keyboardType = 'default',
  returnKeyType = 'done', onSubmitEditing, inputRef, hasError, hasSuccess, rightSlot, clearOnChange,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const floatAnim = useSharedValue(value?.length > 0 ? 1 : 0);

  const labelStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(floatAnim.value, [0, 1], [0, FLOAT_TRANSLATE_Y], Extrapolation.CLAMP) },
    ],
    fontSize: interpolate(floatAnim.value, [0, 1], [FLOAT_FONT_DEFAULT, FLOAT_FONT_FLOATED], Extrapolation.CLAMP),
  }));

  const handleFocus = () => {
    setIsFocused(true);
    floatAnim.value = withTiming(1, { duration: 180 });
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value?.length) floatAnim.value = withTiming(0, { duration: 180 });
    onBlur();
  };

  const borderColor = hasError
    ? colors.danger
    : hasSuccess
      ? colors.success
      : isFocused
        ? colors.accent
        : 'rgba(255,255,255,0.12)';

  return (
    <View style={[floatStyles.wrap, { borderColor }]}>
      <Animated.Text style={[floatStyles.label, labelStyle, {
        color: isFocused ? colors.accent : 'rgba(255,255,255,0.4)',
      }]}>{label}</Animated.Text>
      <TextInput
        ref={inputRef}
        style={floatStyles.input}
        value={value}
        onChangeText={(t) => { onChangeText(t); clearOnChange?.(); }}
        onFocus={handleFocus}
        onBlur={handleBlur}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        placeholderTextColor="transparent"
        autoCorrect={false}
        spellCheck={false}
      />
      {rightSlot && <View style={floatStyles.rightSlot}>{rightSlot}</View>}
    </View>
  );
};

// ── Gradient CTA ─────────────────────────────────────────────────────────────

interface GradientCTAProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const GradientCTA: React.FC<GradientCTAProps> = ({ label, onPress, loading, disabled }) => {
  const contentOpacity = useSharedValue(1);

  useEffect(() => {
    contentOpacity.value = withTiming(loading ? 0 : 1, { duration: 180 });
  }, [loading]);

  const contentStyle = useAnimatedStyle(() => ({ opacity: contentOpacity.value }));
  const spinnerStyle = useAnimatedStyle(() => ({ opacity: 1 - contentOpacity.value }));

  return (
    <TouchableOpacity
      onPress={() => { hapticMedium(); onPress(); }}
      activeOpacity={0.88}
      disabled={disabled || loading}
      style={[ctaStyles.outer, (disabled && !loading) && ctaStyles.outerDisabled]}
    >
      {disabled && !loading ? (
        <View style={ctaStyles.inner}>
          <Animated.Text style={[ctaStyles.label, { color: colors.textCaption }]}>{label}</Animated.Text>
        </View>
      ) : (
        <LinearGradient
          colors={gradients.premium}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={ctaStyles.inner}
        >
          <Animated.Text style={[ctaStyles.label, contentStyle]}>{label}</Animated.Text>
          <Animated.View style={[ctaStyles.spinnerWrap, spinnerStyle]} pointerEvents="none">
            <ActivityIndicator color={colors.white} size="small" />
          </Animated.View>
        </LinearGradient>
      )}
    </TouchableOpacity>
  );
};

// ── Main screen ───────────────────────────────────────────────────────────────

export const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const {
    showPassword,
    showConfirm,
    loading,
    serverError,
    confirmEmailMsg,
    emailRef,
    passwordRef,
    confirmRef,
    control,
    handleSubmit,
    errors,
    isValid,
    strengthConfig,
    passwordsMatch,
    clearError,
    onSubmit,
    handleAppleSignIn,
    handleGoogleSignIn,
    goToLogin,
    toggleShowPassword,
    toggleShowConfirm,
    orb1Style,
    orb2Style,
    orb3Style,
  } = useSignup(navigation);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ── Dark gradient background ── */}
      <LinearGradient
        colors={['#0A0A0A', '#141414', '#1A1A1A']}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Floating orbs ── */}
      <Animated.View style={[styles.orb1, orb1Style]} pointerEvents="none">
        <LinearGradient colors={['rgba(192,139,48,0.25)', 'transparent']} style={{ flex: 1 }} />
      </Animated.View>
      <Animated.View style={[styles.orb2, orb2Style]} pointerEvents="none">
        <LinearGradient colors={['rgba(46,125,90,0.16)', 'transparent']} style={{ flex: 1 }} />
      </Animated.View>
      <Animated.View style={[styles.orb3, orb3Style]} pointerEvents="none">
        <LinearGradient colors={['rgba(192,139,48,0.12)', 'transparent']} style={{ flex: 1 }} />
      </Animated.View>

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.kav}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── Hero copy ── */}
            <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.heroSection}>
              {/* Free credits badge */}
              <View style={styles.freeBadge}>
                <MaterialCommunityIcons name="gift-outline" size={ms(13)} color={colors.accent} />
                <AppText variant="caption2" color={colors.accent} uppercase style={styles.freeBadgeText}>
                  2 free credits on sign up — no card needed
                </AppText>
              </View>
              <AppText variant="largeTitle" color={colors.white} style={styles.heroTitle}>
                Create your edge
              </AppText>
              <AppText variant="body" color="rgba(255,255,255,0.45)" style={styles.heroSub}>
                Find winning products 30 days before your competition.
              </AppText>
            </Animated.View>

            {/* ── Social auth (Apple first, then Google) ── */}
            <Animated.View entering={FadeInDown.delay(140).springify()} style={styles.socialSection}>
              {/* Sign up with Apple */}
              <TouchableOpacity
                onPress={handleAppleSignIn}
                activeOpacity={0.88}
                style={styles.appleBtn}
              >
                <MaterialCommunityIcons name="apple" size={ms(20)} color="#FFFFFF" />
                <AppText variant="callout" color="#FFFFFF" style={styles.appleBtnText}>
                  Continue with Apple
                </AppText>
              </TouchableOpacity>

              {/* Sign up with Google */}
              <TouchableOpacity
                onPress={handleGoogleSignIn}
                activeOpacity={0.88}
                style={styles.googleBtn}
              >
                <View style={styles.googleG}>
                  <AppText variant="callout" style={styles.googleGText}>G</AppText>
                </View>
                <AppText variant="callout" color={colors.textPrimary} style={styles.googleBtnText}>
                  Continue with Google
                </AppText>
              </TouchableOpacity>
            </Animated.View>

            {/* ── Divider ── */}
            <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <AppText variant="caption2" color="rgba(255,255,255,0.3)" style={styles.dividerText}>
                or sign up with email
              </AppText>
              <View style={styles.dividerLine} />
            </Animated.View>

            {/* ── Email form ── */}
            <Animated.View entering={FadeInDown.delay(260).springify()} style={styles.formCard}>

              {/* Full name */}
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.fieldWrap}>
                    <FloatingInput
                      label="Full name"
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      autoCapitalize="words"
                      keyboardType="default"
                      returnKeyType="next"
                      onSubmitEditing={() => emailRef.current?.focus()}
                      hasError={!!errors.name}
                    />
                    {errors.name && (
                      <AppText variant="footnote" color={colors.danger} style={styles.fieldErr}>
                        {errors.name.message}
                      </AppText>
                    )}
                  </View>
                )}
              />

              {/* Email */}
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.fieldWrap}>
                    <FloatingInput
                      label="Email address"
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      clearOnChange={clearError}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      returnKeyType="next"
                      inputRef={emailRef}
                      onSubmitEditing={() => passwordRef.current?.focus()}
                      hasError={!!errors.email}
                    />
                    {errors.email && (
                      <AppText variant="footnote" color={colors.danger} style={styles.fieldErr}>
                        {errors.email.message}
                      </AppText>
                    )}
                  </View>
                )}
              />

              {/* Password */}
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.fieldWrap}>
                    <FloatingInput
                      label="Password"
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showPassword}
                      inputRef={passwordRef}
                      returnKeyType="next"
                      onSubmitEditing={() => confirmRef.current?.focus()}
                      hasError={!!errors.password}
                      rightSlot={
                        <TouchableOpacity
                          onPress={toggleShowPassword}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <MaterialCommunityIcons
                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                            size={ms(18)}
                            color="rgba(255,255,255,0.4)"
                          />
                        </TouchableOpacity>
                      }
                    />
                    {errors.password && (
                      <AppText variant="footnote" color={colors.danger} style={styles.fieldErr}>
                        {errors.password.message}
                      </AppText>
                    )}
                    {/* Password strength bars */}
                    {strengthConfig && !errors.password && (
                      <View style={styles.strengthWrap}>
                        <View style={styles.strengthBars}>
                          {[1, 2, 3].map((bar) => (
                            <View
                              key={bar}
                              style={[
                                styles.strengthBar,
                                { backgroundColor: bar <= strengthConfig.bars ? strengthConfig.color : 'rgba(255,255,255,0.12)' },
                              ]}
                            />
                          ))}
                        </View>
                        <AppText variant="caption2" color={strengthConfig.color}>
                          {strengthConfig.label}
                        </AppText>
                      </View>
                    )}
                  </View>
                )}
              />

              {/* Confirm password */}
              <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.fieldWrap}>
                    <FloatingInput
                      label="Confirm password"
                      value={value ?? ''}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showConfirm}
                      inputRef={confirmRef}
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit(onSubmit)}
                      hasError={!!errors.confirmPassword}
                      hasSuccess={passwordsMatch}
                      rightSlot={
                        <TouchableOpacity
                          onPress={toggleShowConfirm}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <MaterialCommunityIcons
                            name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                            size={ms(18)}
                            color="rgba(255,255,255,0.4)"
                          />
                        </TouchableOpacity>
                      }
                    />
                    {errors.confirmPassword && (
                      <AppText variant="footnote" color={colors.danger} style={styles.fieldErr}>
                        {errors.confirmPassword.message}
                      </AppText>
                    )}
                    {passwordsMatch && (
                      <AppText variant="footnote" color={colors.success} style={styles.fieldErr}>
                        ✓ Passwords match
                      </AppText>
                    )}
                  </View>
                )}
              />

              {/* Server error banner */}
              {serverError && (
                <Animated.View entering={FadeIn.duration(200)} style={styles.errorBanner}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={ms(15)} color={colors.danger} />
                  <AppText variant="footnote" color={colors.danger} style={styles.errorBannerText}>
                    {serverError}
                  </AppText>
                </Animated.View>
              )}

              {/* Email confirmation success banner */}
              {confirmEmailMsg && (
                <Animated.View entering={FadeIn.duration(200)} style={styles.confirmBanner}>
                  <MaterialCommunityIcons name="email-check-outline" size={ms(15)} color={colors.success} />
                  <View style={styles.confirmBannerContent}>
                    <AppText variant="caption2" color={colors.success} uppercase style={styles.confirmBannerTitle}>
                      Check your inbox
                    </AppText>
                    <AppText variant="footnote" color={colors.success} style={styles.confirmBannerText}>
                      {confirmEmailMsg}
                    </AppText>
                  </View>
                </Animated.View>
              )}

              {/* CTA */}
              <View style={styles.ctaWrap}>
                <GradientCTA
                  label="Create Account"
                  onPress={handleSubmit(onSubmit)}
                  loading={loading}
                  disabled={!isValid}
                />
              </View>
            </Animated.View>

            {/* ── Switch to login ── */}
            <Animated.View entering={FadeInDown.delay(320).springify()} style={styles.switchRow}>
              <AppText variant="subhead" color="rgba(255,255,255,0.4)">Already have an account? </AppText>
              <TouchableOpacity onPress={goToLogin}>
                <AppText variant="subhead" color={colors.accent} style={styles.switchLink}>
                  Sign in
                </AppText>
              </TouchableOpacity>
            </Animated.View>

            <AppText variant="caption1" color="rgba(255,255,255,0.2)" center style={styles.legal}>
              By creating an account you agree to our Terms of Service and Privacy Policy
            </AppText>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};
