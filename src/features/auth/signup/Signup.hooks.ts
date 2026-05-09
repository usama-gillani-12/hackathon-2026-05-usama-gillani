import { useEffect, useRef, useState } from 'react';
import { TextInput } from 'react-native';
import { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AuthStackParamList } from '@t/navigation';
import { useAuthStore } from '@core/stores/useAuthStore';
import { hapticLight, hapticMedium, hapticSuccess, hapticWarning } from '@utils/haptics';
import { colors } from '@theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

export type PasswordStrength = 'weak' | 'fair' | 'strong';

export const getPasswordStrength = (pwd: string): PasswordStrength => {
  if (pwd.length < 6) return 'weak';
  const hasUpper = /[A-Z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
  const score = [pwd.length >= 8, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  if (score >= 3) return 'strong';
  if (score >= 2) return 'fair';
  return 'weak';
};

export const STRENGTH_CONFIG: Record<PasswordStrength, { label: string; color: string; bars: number }> = {
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

export type SignupFormData = yup.InferType<typeof schema>;

export { schema };

export function useSignup(navigation: Props['navigation']) {
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
  } = useForm<SignupFormData>({
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

  const onSubmit = async (data: SignupFormData) => {
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

  const goToLogin = () => { hapticLight(); navigation.navigate('Login'); };

  const toggleShowPassword = () => { hapticLight(); setShowPassword((v) => !v); };
  const toggleShowConfirm = () => { hapticLight(); setShowConfirm((v) => !v); };

  return {
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
    strength,
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
  };
}
