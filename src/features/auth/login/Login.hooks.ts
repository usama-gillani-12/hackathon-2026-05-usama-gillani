import { useEffect, useRef, useState } from 'react';
import { TextInput } from 'react-native';
import { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AuthStackParamList } from '@t/navigation';
import { useAuthStore } from '@core/stores/useAuthStore';
import { hapticLight, hapticMedium, hapticWarning } from '@utils/haptics';

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

export type LoginFormData = yup.InferType<typeof schema>;

export { schema };

export function useLogin(navigation: Props['navigation']) {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null);
  const signIn = useAuthStore((s) => s.signIn);

  // ── Orb float animations ──────────────────────────────────────────────────
  const orb1Y = useSharedValue(0);
  const orb2Y = useSharedValue(0);
  const orb3Y = useSharedValue(0);

  useEffect(() => {
    orb1Y.value = withRepeat(withSequence(
      withTiming(-18, { duration: 3800 }),
      withTiming(0, { duration: 3800 }),
    ), -1, false);
    orb2Y.value = withRepeat(withSequence(
      withTiming(14, { duration: 4600 }),
      withTiming(-10, { duration: 4600 }),
    ), -1, false);
    orb3Y.value = withRepeat(withSequence(
      withTiming(-10, { duration: 5200 }),
      withTiming(8, { duration: 5200 }),
    ), -1, false);
  }, []);

  const orb1Style = useAnimatedStyle(() => ({ transform: [{ translateY: orb1Y.value }] }));
  const orb2Style = useAnimatedStyle(() => ({ transform: [{ translateY: orb2Y.value }] }));
  const orb3Style = useAnimatedStyle(() => ({ transform: [{ translateY: orb3Y.value }] }));

  // ── Form ──────────────────────────────────────────────────────────────────
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: yupResolver(schema),
    mode: 'onTouched',
  });

  const clearError = () => setServerError(null);

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setLoading(true);
    const { error } = await signIn(data.email, data.password);
    setLoading(false);
    if (error) { setServerError(error); hapticWarning(); }
  };

  const handleAppleSignIn = () => {
    hapticMedium();
    if (__DEV__) console.log('[Auth] Apple Sign In — stub');
  };

  const handleGoogleSignIn = () => {
    hapticLight();
    if (__DEV__) console.log('[Auth] Google Sign In — stub');
  };

  const goToSignUp = () => { hapticLight(); navigation.navigate('SignUp'); };

  const toggleShowPassword = () => { hapticLight(); setShowPassword((v) => !v); };

  return {
    showPassword,
    loading,
    serverError,
    passwordRef,
    control,
    handleSubmit,
    errors,
    isValid,
    clearError,
    onSubmit,
    handleAppleSignIn,
    handleGoogleSignIn,
    goToSignUp,
    toggleShowPassword,
    orb1Style,
    orb2Style,
    orb3Style,
  };
}
