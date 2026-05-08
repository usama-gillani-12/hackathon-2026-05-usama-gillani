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
import { LinearGradient } from 'react-native-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AuthStackParamList } from '../../types/navigation';
import { useAuthStore } from '../../stores/useAuthStore';
import { colors, gradients } from '../../theme/colors';
import { radius, spacing } from '../../theme/spacing';
import { ms, s, vs } from '../../theme/responsive';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const schema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Enter a valid email address'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

type FormData = yup.InferType<typeof schema>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null);
  const signIn = useAuthStore((s) => s.signIn);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    setLoading(true);
    const { error } = await signIn(data.email, data.password);
    setLoading(false);
    if (error) {
      setServerError(error);
    }
  };

  return (
    <LinearGradient colors={[colors.heroDark, colors.heroMid, colors.heroDark]} style={styles.container}>
      <View style={[styles.orb, styles.orbTopLeft]} />
      <View style={[styles.orb, styles.orbBottomRight]} />

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
            {/* Brand */}
            <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.brand}>
              <LinearGradient
                colors={gradients.accent}
                style={styles.logoCircle}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.logoText}>TP</Text>
              </LinearGradient>
              <Text style={styles.appName}>TrendPro</Text>
              <Text style={styles.tagline}>Find winning products · Powered by AI</Text>
            </Animated.View>

            {/* Card */}
            <Animated.View entering={FadeInUp.delay(180).springify()} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Welcome back</Text>
                <Text style={styles.cardSubtitle}>Sign in to your account</Text>
              </View>

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
                      <Text style={styles.fieldIcon}>@</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="you@example.com"
                        placeholderTextColor="rgba(255,255,255,0.22)"
                        value={value}
                        onChangeText={(text) => {
                          onChange(text);
                          setServerError(null);
                        }}
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
                    <View style={styles.labelRow}>
                      <Text style={styles.label}>Password</Text>
                      <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={styles.forgotLink}>Forgot password?</Text>
                      </TouchableOpacity>
                    </View>
                    <View
                      style={[
                        styles.inputRow,
                        passwordFocused && styles.inputRowFocused,
                        errors.password && styles.inputRowError,
                      ]}
                    >
                      <Text style={styles.fieldIcon}>*</Text>
                      <TextInput
                        ref={passwordRef}
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor="rgba(255,255,255,0.22)"
                        value={value}
                        onChangeText={(text) => {
                          onChange(text);
                          setServerError(null);
                        }}
                        onBlur={() => { onBlur(); setPasswordFocused(false); }}
                        onFocus={() => setPasswordFocused(true)}
                        secureTextEntry={!showPassword}
                        returnKeyType="done"
                        onSubmitEditing={handleSubmit(onSubmit)}
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
                  </View>
                )}
              />

              {/* Server error banner */}
              {serverError && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorBannerIcon}>⚠</Text>
                  <Text style={styles.errorBannerText}>{serverError}</Text>
                </View>
              )}

              {/* CTA */}
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                activeOpacity={0.82}
                style={[styles.ctaWrap, (!isValid || loading) && styles.ctaDisabled]}
                disabled={!isValid || loading}
              >
                <LinearGradient
                  colors={[colors.accent, colors.accentHover, colors.premiumDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ctaBtn}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.white} size="small" />
                  ) : (
                    <Text style={styles.ctaLabel}>Sign In</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerLabel}>OR CONTINUE WITH</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social row */}
              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialBtn} activeOpacity={0.75}>
                  <Text style={styles.socialBtnText}>G  Google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialBtn} activeOpacity={0.75}>
                  <Text style={styles.socialBtnText}>  Apple</Text>
                </TouchableOpacity>
              </View>

              {/* Switch to signup */}
              <TouchableOpacity
                onPress={() => navigation.navigate('SignUp')}
                style={styles.switchRow}
                hitSlop={{ top: 8, bottom: 8 }}
              >
                <Text style={styles.switchText}>New to TrendPro? </Text>
                <Text style={styles.switchLink}>Create account</Text>
              </TouchableOpacity>
            </Animated.View>

            <Text style={styles.legal}>
              By continuing, you agree to our Terms of Service and Privacy Policy
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  keyboardView: { flex: 1 },

  orb: {
    position: 'absolute',
    borderRadius: ms(300),
    opacity: 0.18,
  },
  orbTopLeft: {
    width: ms(280),
    height: ms(280),
    top: vs(-60),
    left: s(-80),
    backgroundColor: colors.accent,
  },
  orbBottomRight: {
    width: ms(240),
    height: ms(240),
    bottom: vs(-60),
    right: s(-60),
    backgroundColor: colors.premium,
  },

  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: vs(24),
  },

  brand: {
    alignItems: 'center',
    paddingTop: vs(32),
    paddingBottom: vs(28),
  },
  logoCircle: {
    width: ms(56),
    height: ms(56),
    borderRadius: ms(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(12),
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: ms(8) },
    shadowOpacity: 0.6,
    shadowRadius: ms(16),
    elevation: 12,
  },
  logoText: {
    color: colors.white,
    fontSize: ms(20),
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  appName: {
    color: colors.white,
    fontSize: ms(28),
    fontWeight: '800',
    letterSpacing: -0.8,
    marginBottom: vs(6),
  },
  tagline: {
    color: 'rgba(255,255,255,0.38)',
    fontSize: ms(12),
    fontWeight: '500',
    letterSpacing: 0.2,
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.055)',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: ms(24),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: ms(16) },
    shadowOpacity: 0.35,
    shadowRadius: ms(32),
    elevation: 20,
  },

  cardHeader: { marginBottom: vs(24) },
  cardTitle: {
    color: colors.white,
    fontSize: ms(22),
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: vs(4),
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: ms(14),
    fontWeight: '400',
  },

  field: { marginBottom: vs(16) },
  label: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: ms(12),
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: vs(8),
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(8),
  },
  forgotLink: {
    color: colors.accent,
    fontSize: ms(12),
    fontWeight: '600',
  },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: s(14),
    height: vs(50),
  },
  inputRowFocused: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(192,139,48,0.1)',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: ms(8),
    elevation: 4,
  },
  inputRowError: {
    borderColor: colors.danger,
    backgroundColor: 'rgba(220,38,38,0.08)',
  },
  fieldIcon: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: ms(16),
    fontWeight: '700',
    marginRight: s(10),
    width: ms(16),
    textAlign: 'center',
  },
  input: {
    flex: 1,
    color: colors.white,
    fontSize: ms(15),
    fontWeight: '400',
    paddingVertical: 0,
  },
  eyeBtn: { paddingLeft: s(10) },
  eyeText: {
    color: 'rgba(255,255,255,0.35)',
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

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(220,38,38,0.12)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.4)',
    paddingVertical: vs(10),
    paddingHorizontal: s(12),
    marginTop: vs(4),
    marginBottom: vs(12),
    gap: s(8),
  },
  errorBannerIcon: {
    color: '#FCA5A5',
    fontSize: ms(14),
    marginTop: vs(1),
  },
  errorBannerText: {
    flex: 1,
    color: '#FCA5A5',
    fontSize: ms(13),
    fontWeight: '500',
    lineHeight: ms(18),
  },

  ctaWrap: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginTop: vs(8),
    marginBottom: vs(20),
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: ms(6) },
    shadowOpacity: 0.5,
    shadowRadius: ms(14),
    elevation: 10,
  },
  ctaDisabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaBtn: {
    height: vs(52),
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: {
    color: colors.white,
    fontSize: ms(16),
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(16),
    gap: s(10),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  dividerLabel: {
    color: 'rgba(255,255,255,0.28)',
    fontSize: ms(10),
    fontWeight: '700',
    letterSpacing: 1,
  },

  socialRow: {
    flexDirection: 'row',
    gap: s(10),
    marginBottom: vs(20),
  },
  socialBtn: {
    flex: 1,
    height: vs(46),
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialBtnText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: ms(13),
    fontWeight: '600',
  },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: ms(14),
  },
  switchLink: {
    color: colors.accent,
    fontSize: ms(14),
    fontWeight: '700',
  },

  legal: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: ms(11),
    textAlign: 'center',
    marginTop: vs(20),
    lineHeight: ms(16),
    paddingHorizontal: s(8),
  },
});
