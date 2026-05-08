import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AuthStackParamList } from '../../types/navigation';
import { useAuthStore } from '../../stores/useAuthStore';
import { colors } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { ms, s, vs } from '../../theme/responsive';

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
  weak: { label: 'Weak', color: colors.danger, bars: 1 },
  fair: { label: 'Fair', color: colors.warning, bars: 2 },
  strong: { label: 'Strong', color: colors.success, bars: 3 },
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
    .matches(/[A-Za-z]/, 'Password must contain at least one letter')
    .matches(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
});

type FormData = yup.InferType<typeof schema>;

export const SignupScreen: React.FC<Props> = ({ navigation }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmEmailMsg, setConfirmEmailMsg] = useState<string | null>(null);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);
  const signUp = useAuthStore((s) => s.signUp);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const watchedPassword = watch('password', '');
  const watchedConfirm = watch('confirmPassword', '');
  const strength = watchedPassword.length > 0 ? getPasswordStrength(watchedPassword) : null;
  const strengthConfig = strength ? STRENGTH_CONFIG[strength] : null;
  const passwordsMatch =
    watchedConfirm.length > 0 && watchedPassword === watchedConfirm && !errors.confirmPassword;

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    setConfirmEmailMsg(null);
    setLoading(true);
    const { error, needsEmailConfirmation } = await signUp(data.email, data.password, data.name);
    setLoading(false);
    if (error) { setServerError(error); return; }
    if (needsEmailConfirmation) {
      setConfirmEmailMsg(
        `We sent a confirmation link to ${data.email.trim()}. Tap it, then come back and sign in.`,
      );
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Heading */}
            <Animated.View entering={FadeInDown.delay(60).springify()} style={styles.heading}>
              <Text style={styles.headingTitle}>Create account</Text>
              <Text style={styles.headingSubtitle}>Start finding winning products today</Text>
            </Animated.View>

            {/* Free credits badge */}
            <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.creditsBadge}>
              <Text style={styles.creditsBadgeText}>
                🎁  2 free credits on sign up — no card needed
              </Text>
            </Animated.View>

            {/* Form */}
            <Animated.View entering={FadeInDown.delay(160).springify()}>

              {/* Full name */}
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.field}>
                    <Text style={styles.label}>Full Name</Text>
                    <View
                      style={[
                        styles.inputRow,
                        nameFocused && styles.inputRowFocused,
                        errors.name && styles.inputRowError,
                      ]}
                    >
                      <TextInput
                        style={styles.input}
                        placeholder="Jane Smith"
                        placeholderTextColor={colors.textCaption}
                        value={value}
                        onChangeText={onChange}
                        onBlur={() => { onBlur(); setNameFocused(false); }}
                        onFocus={() => setNameFocused(true)}
                        autoCapitalize="words"
                        returnKeyType="next"
                        onSubmitEditing={() => emailRef.current?.focus()}
                      />
                    </View>
                    {errors.name && (
                      <Text style={styles.fieldError}>{errors.name.message}</Text>
                    )}
                  </View>
                )}
              />

              {/* Email */}
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.field}>
                    <Text style={styles.label}>Email</Text>
                    <View
                      style={[
                        styles.inputRow,
                        emailFocused && styles.inputRowFocused,
                        errors.email && styles.inputRowError,
                      ]}
                    >
                      <TextInput
                        ref={emailRef}
                        style={styles.input}
                        placeholder="you@example.com"
                        placeholderTextColor={colors.textCaption}
                        value={value}
                        onChangeText={onChange}
                        onBlur={() => { onBlur(); setEmailFocused(false); }}
                        onFocus={() => setEmailFocused(true)}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        returnKeyType="next"
                        onSubmitEditing={() => passwordRef.current?.focus()}
                      />
                    </View>
                    {errors.email && (
                      <Text style={styles.fieldError}>{errors.email.message}</Text>
                    )}
                  </View>
                )}
              />

              {/* Password */}
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.field}>
                    <Text style={styles.label}>Password</Text>
                    <View
                      style={[
                        styles.inputRow,
                        passwordFocused && styles.inputRowFocused,
                        errors.password && styles.inputRowError,
                      ]}
                    >
                      <TextInput
                        ref={passwordRef}
                        style={styles.input}
                        placeholder="Min. 8 characters"
                        placeholderTextColor={colors.textCaption}
                        value={value}
                        onChangeText={onChange}
                        onBlur={() => { onBlur(); setPasswordFocused(false); }}
                        onFocus={() => setPasswordFocused(true)}
                        secureTextEntry={!showPassword}
                        returnKeyType="next"
                        onSubmitEditing={() => confirmRef.current?.focus()}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword((v) => !v)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={styles.eyeBtn}
                      >
                        <Text style={styles.eyeText}>{showPassword ? 'HIDE' : 'SHOW'}</Text>
                      </TouchableOpacity>
                    </View>
                    {errors.password && (
                      <Text style={styles.fieldError}>{errors.password.message}</Text>
                    )}
                    {strengthConfig && !errors.password && (
                      <View style={styles.strengthWrap}>
                        <View style={styles.strengthBars}>
                          {[1, 2, 3].map((bar) => (
                            <View
                              key={bar}
                              style={[
                                styles.strengthBar,
                                {
                                  backgroundColor:
                                    bar <= strengthConfig.bars
                                      ? strengthConfig.color
                                      : colors.divider,
                                },
                              ]}
                            />
                          ))}
                        </View>
                        <Text style={[styles.strengthLabel, { color: strengthConfig.color }]}>
                          {strengthConfig.label}
                        </Text>
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
                  <View style={styles.field}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <View
                      style={[
                        styles.inputRow,
                        confirmFocused && styles.inputRowFocused,
                        errors.confirmPassword && styles.inputRowError,
                        passwordsMatch && styles.inputRowSuccess,
                      ]}
                    >
                      <TextInput
                        ref={confirmRef}
                        style={styles.input}
                        placeholder="Re-enter password"
                        placeholderTextColor={colors.textCaption}
                        value={value}
                        onChangeText={onChange}
                        onBlur={() => { onBlur(); setConfirmFocused(false); }}
                        onFocus={() => setConfirmFocused(true)}
                        secureTextEntry={!showConfirm}
                        returnKeyType="done"
                        onSubmitEditing={handleSubmit(onSubmit)}
                      />
                      <TouchableOpacity
                        onPress={() => setShowConfirm((v) => !v)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={styles.eyeBtn}
                      >
                        <Text style={styles.eyeText}>{showConfirm ? 'HIDE' : 'SHOW'}</Text>
                      </TouchableOpacity>
                    </View>
                    {errors.confirmPassword && (
                      <Text style={styles.fieldError}>{errors.confirmPassword.message}</Text>
                    )}
                    {passwordsMatch && (
                      <Text style={styles.successText}>✓ Passwords match</Text>
                    )}
                  </View>
                )}
              />

              {/* Server error banner */}
              {serverError && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerText}>⚠  {serverError}</Text>
                </View>
              )}

              {/* Email confirmation banner */}
              {confirmEmailMsg && (
                <View style={styles.confirmBanner}>
                  <Text style={styles.confirmBannerTitle}>📬 Check your inbox</Text>
                  <Text style={styles.confirmBannerText}>{confirmEmailMsg}</Text>
                </View>
              )}

              {/* CTA */}
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                activeOpacity={0.85}
                style={[
                  styles.ctaBtn,
                  (!isValid || loading) && styles.ctaDisabled,
                ]}
                disabled={!isValid || loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Text style={styles.ctaLabel}>Create Account</Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerLabel}>OR CONTINUE WITH</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social */}
              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialBtn} activeOpacity={0.75}>
                  <Text style={styles.socialBtnText}>G  Google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialBtn} activeOpacity={0.75}>
                  <Text style={styles.socialBtnText}>  Apple</Text>
                </TouchableOpacity>
              </View>

              {/* Switch to login */}
              <TouchableOpacity
                onPress={() => navigation.navigate('Login')}
                style={styles.switchRow}
                hitSlop={{ top: 8, bottom: 8 }}
              >
                <Text style={styles.switchText}>Already have an account? </Text>
                <Text style={styles.switchLink}>Sign in</Text>
              </TouchableOpacity>
            </Animated.View>

            <Text style={styles.legal}>
              By creating an account you agree to our Terms of Service and Privacy Policy
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  keyboardView: { flex: 1 },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.page,
    paddingBottom: vs(32),
  },

  heading: {
    paddingTop: vs(40),
    paddingBottom: vs(20),
  },
  headingTitle: {
    fontSize: ms(34),
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.6,
    marginBottom: vs(6),
  },
  headingSubtitle: {
    fontSize: ms(15),
    fontWeight: '400',
    color: colors.textCaption,
  },

  creditsBadge: {
    backgroundColor: colors.accentSubtle,
    borderRadius: radius.lg,
    paddingVertical: vs(10),
    paddingHorizontal: s(14),
    marginBottom: vs(24),
  },
  creditsBadgeText: {
    color: colors.accentHover,
    fontSize: ms(13),
    fontWeight: '600',
    textAlign: 'center',
  },

  field: { marginBottom: vs(16) },
  label: {
    color: colors.textCaption,
    fontSize: ms(11),
    fontWeight: '700',
    letterSpacing: ms(0.8),
    textTransform: 'uppercase',
    marginBottom: vs(8),
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.md,
    paddingHorizontal: s(16),
    height: vs(52),
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputRowFocused: { borderColor: colors.accent },
  inputRowError: { borderColor: colors.danger },
  inputRowSuccess: { borderColor: colors.success },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: ms(15),
    fontWeight: '400',
    paddingVertical: 0,
  },
  eyeBtn: { paddingLeft: s(10) },
  eyeText: {
    color: colors.textCaption,
    fontSize: ms(10),
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  fieldError: {
    color: colors.danger,
    fontSize: ms(12),
    fontWeight: '500',
    marginTop: vs(5),
  },
  successText: {
    color: colors.success,
    fontSize: ms(12),
    fontWeight: '600',
    marginTop: vs(5),
  },

  strengthWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: vs(8),
    gap: s(8),
  },
  strengthBars: { flexDirection: 'row', gap: s(4) },
  strengthBar: {
    width: s(28),
    height: vs(4),
    borderRadius: ms(2),
  },
  strengthLabel: {
    fontSize: ms(11),
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  errorBanner: {
    backgroundColor: colors.dangerSubtle,
    borderRadius: radius.md,
    paddingVertical: vs(12),
    paddingHorizontal: s(14),
    marginBottom: vs(14),
  },
  errorBannerText: {
    color: colors.danger,
    fontSize: ms(13),
    fontWeight: '500',
    lineHeight: ms(18),
  },

  confirmBanner: {
    backgroundColor: colors.successSubtle,
    borderRadius: radius.md,
    paddingVertical: vs(12),
    paddingHorizontal: s(14),
    marginBottom: vs(14),
  },
  confirmBannerTitle: {
    color: colors.success,
    fontSize: ms(13),
    fontWeight: '700',
    marginBottom: vs(4),
  },
  confirmBannerText: {
    color: colors.success,
    fontSize: ms(12),
    lineHeight: ms(17),
  },

  ctaBtn: {
    height: vs(54),
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vs(4),
    marginBottom: vs(24),
  },
  ctaDisabled: { backgroundColor: colors.divider },
  ctaLabel: {
    color: colors.white,
    fontSize: ms(15),
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(16),
    gap: s(10),
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.divider },
  dividerLabel: {
    color: colors.textCaption,
    fontSize: ms(10),
    fontWeight: '700',
    letterSpacing: ms(0.8),
  },

  socialRow: {
    flexDirection: 'row',
    gap: s(10),
    marginBottom: vs(24),
  },
  socialBtn: {
    flex: 1,
    height: vs(48),
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.divider,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialBtnText: {
    color: colors.textPrimary,
    fontSize: ms(13),
    fontWeight: '600',
  },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: { color: colors.textCaption, fontSize: ms(14) },
  switchLink: { color: colors.accent, fontSize: ms(14), fontWeight: '700' },

  legal: {
    color: colors.textCaption,
    fontSize: ms(11),
    textAlign: 'center',
    marginTop: vs(24),
    lineHeight: ms(16),
    paddingHorizontal: s(8),
  },
});
