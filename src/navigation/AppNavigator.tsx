import React, { useEffect } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';

import { OnboardingScreen } from '../screens/OnboardingScreen';
import { AuthNavigator } from './AuthNavigator';
import { RootStackNavigator } from './RootStackNavigator';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useCreditStore } from '../stores/useCreditStore';
import { useWatchlistStore } from '../stores/useWatchlistStore';

const Root = createNativeStackNavigator<
  Pick<RootStackParamList, 'Onboarding'> & { Auth: undefined; MainApp: undefined }
>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.card,
    border: colors.border,
    primary: colors.accent,
    text: colors.primary,
    notification: colors.premium,
  },
};

export const AppNavigator: React.FC = () => {
  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);
  const hydrated = useSettingsStore((s) => s.hydrated);

  const session = useAuthStore((s) => s.session);
  const authInitialized = useAuthStore((s) => s.initialized);
  const initAuth = useAuthStore((s) => s.initialize);

  const initCredits = useCreditStore((s) => s.initialize);
  const initWatchlist = useWatchlistStore((s) => s.initialize);

  useEffect(() => {
    initAuth();
    initCredits();
    initWatchlist();
  }, []);

  if (!hydrated || !authInitialized) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      <Root.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {!onboardingComplete ? (
          <Root.Screen name="Onboarding" component={OnboardingScreen} />
        ) : !session ? (
          <Root.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <Root.Screen name="MainApp" component={RootStackNavigator as any} />
        )}
      </Root.Navigator>
    </NavigationContainer>
  );
};
