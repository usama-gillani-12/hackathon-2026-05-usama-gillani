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
    if (error) setServerError(error);
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
              <Text style={styles.headingTitle}>Welcome back</Text>
              <Text style={styles.headingSubtitle}>Sign in to your account</Text>
            </Animated.View>

            {/* Form */}
            <Animated.View entering={FadeInDown.delay(140).springify()}>

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
                        style={styles.input}
                        placeholder="you@example.com"
                        placeholderTextColor={colors.textCaption}
                        value={value}
                        onChangeText={(text) => { onChange(text); setServerError(null); }}
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
                      <TextInput
                        ref={passwordRef}
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor={colors.textCaption}
                        value={value}
                        onChangeText={(text) => { onChange(text); setServerError(null); }}
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
                  <Text style={styles.errorBannerText}>⚠  {serverError}</Text>
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
                  <Text style={styles.ctaLabel}>Sign In</Text>
                )}
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
              By continuing you agree to our Terms of Service and Privacy Policy
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
    paddingTop: vs(48),
    paddingBottom: vs(36),
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

  field: { marginBottom: vs(18) },
  label: {
    color: colors.textCaption,
    fontSize: ms(11),
    fontWeight: '700',
    letterSpacing: ms(0.8),
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
    backgroundColor: colors.surfaceVariant,
    borderRadius: radius.md,
    paddingHorizontal: s(16),
    height: vs(52),
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputRowFocused: {
    borderColor: colors.accent,
  },
  inputRowError: {
    borderColor: colors.danger,
  },
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

  ctaBtn: {
    height: vs(54),
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: vs(4),
    marginBottom: vs(24),
  },
  ctaDisabled: {
    backgroundColor: colors.divider,
  },
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
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
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
  switchText: {
    color: colors.textCaption,
    fontSize: ms(14),
  },
  switchLink: {
    color: colors.accent,
    fontSize: ms(14),
    fontWeight: '700',
  },

  legal: {
    color: colors.textCaption,
    fontSize: ms(11),
    textAlign: 'center',
    marginTop: vs(24),
    lineHeight: ms(16),
    paddingHorizontal: s(8),
  },
});
