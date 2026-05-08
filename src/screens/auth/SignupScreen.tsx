import React, { useEffect, useRef, useState } from 'react';
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
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AuthStackParamList } from '../../types/navigation';
import { useAuthStore } from '../../stores/useAuthStore';
import { colors, gradients } from '../../theme/colors';
import { radius, spacing, shadow } from '../../theme/spacing';
import { ms, s, vs } from '../../theme/responsive';
import { hapticLight, hapticMedium, hapticSuccess, hapticWarning } from '../../utils/haptics';
import { AppText } from '../../components/AppText';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

type PasswordStrength = 'weak' | 'fair' | 'strong';

const getPasswordStrength = (pwd: string): PasswordStrength => {
  if (pwd.length < 6) return 'weak';
  const hasUpper = /[A-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
  const score = [pwd.length >= 8, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  if (score >= 3) return 'strong';
  if (score >= 2) return 'fair';
  return 'weak';
};

const STRENGTH_CONFIG: Record<PasswordStrength, { label: string; color: string; bars: number }> = {
  weak:   { label: 'Weak',   color: colors.danger,  bars: 1 },
  fair:   { label: 'Fair',   color: colors.warning,  bars: 2 },
  strong: { label: 'Strong', color: colors.success,  bars: 3 },
};

const schema = yup.object({
  name: yup
    .string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters')
    .matches(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  email: yup
    .string()
    .required('Email is required')
    .email('Enter a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Za-z]/, 'Must contain at least one letter')
    .matches(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
});

type FormData = yup.InferType<typeof schema>;

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

const FloatingInput: React.FC<FloatingInputProps> = ({
  label, value, onChangeText, onBlur, onFocus, secureTextEntry,
  autoCapitalize = 'none', keyboardType = 'default',
  returnKeyType = 'done', onSubmitEditing, inputRef, hasError, hasSuccess, rightSlot, clearOnChange,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const floatAnim = useSharedValue(value?.length > 0 ? 1 : 0);

  const labelStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(floatAnim.value, [0, 1], [0, -vs(22)], Extrapolation.CLAMP) },
    ],
    fontSize: interpolate(floatAnim.value, [0, 1], [ms(15), ms(11)], Extrapolation.CLAMP),
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

const floatStyles = StyleSheet.create({
  wrap: {
    height: vs(60),
    borderRadius: radius.lg,
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: s(16),
    justifyContent: 'center',
    position: 'relative',
  },
  label: {
    position: 'absolute',
    left: s(16),
    top: '50%',
    marginTop: -ms(8),
    fontWeight: '500',
    pointerEvents: 'none',
  } as any,
  input: {
    color: colors.white,
    fontSize: ms(15),
    paddingTop: vs(12),
    paddingBottom: 0,
    paddingRight: s(40),
  },
  rightSlot: {
    position: 'absolute',
    right: s(14),
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
});

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

const ctaStyles = StyleSheet.create({
  outer: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    height: vs(56),
    ...shadow.md,
    shadowColor: colors.premium,
  },
  outerDisabled: { opacity: 0.45 },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { color: colors.white, fontSize: ms(16), fontWeight: '700', letterSpacing: 0.3 },
  spinnerWrap: { position: 'absolute' },
});

// ── Main screen ───────────────────────────────────────────────────────────────

export const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmEmailMsg, setConfirmEmailMsg] = useState<string | null>(null);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const signUp = useAuthStore((s) => s.signUp);

  // ── Orb float animations ──────────────────────────────────────────────────
  const orb1Y = useSharedValue(0);
  const orb2Y = useSharedValue(0);
  const orb3Y = useSharedValue(0);

  useEffect(() => {
    orb1Y.value = withRepeat(withSequence(
      withTiming(-16, { duration: 4200 }),
      withTiming(0, { duration: 4200 }),
    ), -1, false);
    orb2Y.value = withRepeat(withSequence(
      withTiming(12, { duration: 3600 }),
      withTiming(-8, { duration: 3600 }),
    ), -1, false);
    orb3Y.value = withRepeat(withSequence(
      withTiming(-8, { duration: 5000 }),
      withTiming(10, { duration: 5000 }),
    ), -1, false);
  }, []);

  const orb1Style = useAnimatedStyle(() => ({ transform: [{ translateY: orb1Y.value }] }));
  const orb2Style = useAnimatedStyle(() => ({ transform: [{ translateY: orb2Y.value }] }));
  const orb3Style = useAnimatedStyle(() => ({ transform: [{ translateY: orb3Y.value }] }));

  // ── Form ──────────────────────────────────────────────────────────────────
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: 'onTouched',
  });

  const watchedPassword = watch('password', '');
  const watchedConfirm = watch('confirmPassword', '');
  const strength = watchedPassword.length > 0 ? getPasswordStrength(watchedPassword) : null;
  const strengthConfig = strength ? STRENGTH_CONFIG[strength] : null;
  const passwordsMatch =
    watchedConfirm.length > 0 && watchedPassword === watchedConfirm && !errors.confirmPassword;

  const clearError = () => setServerError(null);

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    setConfirmEmailMsg(null);
    setLoading(true);
    const { error, needsEmailConfirmation } = await signUp(data.email, data.password, data.name);
    setLoading(false);
    if (error) { setServerError(error); hapticWarning(); return; }
    if (needsEmailConfirmation) {
      hapticSuccess();
      setConfirmEmailMsg(
        `We sent a confirmation link to ${data.email.trim()}. Tap it, then come back and sign in.`,
      );
    }
  };

  const handleAppleSignIn = () => {
    hapticMedium();
    if (__DEV__) console.log('[Auth] Apple Sign Up — stub');
  };

  const handleGoogleSignIn = () => {
    hapticLight();
    if (__DEV__) console.log('[Auth] Google Sign Up — stub');
  };

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
                          onPress={() => { hapticLight(); setShowPassword((v) => !v); }}
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
                          onPress={() => { hapticLight(); setShowConfirm((v) => !v); }}
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
              <TouchableOpacity onPress={() => { hapticLight(); navigation.navigate('Login'); }}>
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

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: s(24), paddingBottom: vs(32) },

  // Orbs
  orb1: {
    position: 'absolute', width: ms(320), height: ms(320), borderRadius: ms(160),
    top: -ms(100), right: -ms(80), overflow: 'hidden',
  },
  orb2: {
    position: 'absolute', width: ms(260), height: ms(260), borderRadius: ms(130),
    top: ms(160), left: -ms(100), overflow: 'hidden',
  },
  orb3: {
    position: 'absolute', width: ms(180), height: ms(180), borderRadius: ms(90),
    bottom: ms(100), right: ms(40), overflow: 'hidden',
  },

  // Hero
  heroSection: { paddingTop: vs(36), paddingBottom: vs(28) },
  freeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: ms(5),
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(192,139,48,0.15)',
    borderRadius: radius.pill, borderWidth: 1, borderColor: 'rgba(192,139,48,0.3)',
    paddingHorizontal: s(10), paddingVertical: vs(4),
    marginBottom: vs(14),
  },
  freeBadgeText: { letterSpacing: ms(0.4) },
  heroTitle: { marginBottom: vs(8) },
  heroSub: { lineHeight: ms(24) },

  // Social
  socialSection: { gap: vs(10), marginBottom: vs(20) },
  appleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: s(10),
    height: vs(54), borderRadius: radius.pill,
    backgroundColor: '#000000',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
    ...shadow.sm,
  },
  appleBtnText: { fontWeight: '600' },
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: s(10),
    height: vs(54), borderRadius: radius.pill,
    backgroundColor: '#FFFFFF',
    ...shadow.sm,
  },
  googleG: {
    width: ms(22), height: ms(22), borderRadius: ms(11),
    alignItems: 'center', justifyContent: 'center',
  },
  googleGText: { color: '#4285F4', fontSize: ms(14), fontWeight: '700' },
  googleBtnText: { fontWeight: '600' },

  // Divider
  dividerRow: {
    flexDirection: 'row', alignItems: 'center', gap: s(10),
    marginBottom: vs(20),
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  dividerText: {},

  // Form card
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: s(20),
    gap: vs(4),
    marginBottom: vs(24),
  },
  fieldWrap: { marginBottom: vs(4) },
  fieldErr: { marginTop: vs(4), marginLeft: s(4) },

  strengthWrap: {
    flexDirection: 'row', alignItems: 'center', gap: s(8),
    marginTop: vs(8),
  },
  strengthBars: { flexDirection: 'row', gap: s(4) },
  strengthBar: { width: s(28), height: vs(4), borderRadius: ms(2) },

  errorBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: s(8),
    backgroundColor: 'rgba(192,57,43,0.15)',
    borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(192,57,43,0.3)',
    paddingVertical: vs(10), paddingHorizontal: s(12),
    marginBottom: vs(4),
  },
  errorBannerText: { flex: 1, lineHeight: ms(18) },

  confirmBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: s(8),
    backgroundColor: 'rgba(46,125,90,0.15)',
    borderRadius: radius.md, borderWidth: 1, borderColor: 'rgba(46,125,90,0.3)',
    paddingVertical: vs(10), paddingHorizontal: s(12),
    marginBottom: vs(4),
  },
  confirmBannerContent: { flex: 1, gap: vs(2) },
  confirmBannerTitle: { letterSpacing: ms(0.5) },
  confirmBannerText: { lineHeight: ms(17) },

  ctaWrap: { marginTop: vs(12) },

  // Footer
  switchRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginBottom: vs(16),
  },
  switchLink: { fontWeight: '700' },
  legal: { paddingHorizontal: s(8), lineHeight: ms(16) },
});
