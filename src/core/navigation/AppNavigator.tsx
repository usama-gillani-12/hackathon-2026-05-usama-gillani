import React, { useEffect, useRef } from 'react';
import { NavigationContainer, DefaultTheme, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';

import { OnboardingScreen } from '@features/onboarding';
import { AuthNavigator } from './AuthNavigator';
import { RootStackNavigator } from './RootStackNavigator';
import { RootStackParamList } from '@t/navigation';
import { colors } from '@theme/colors';
import { useSettingsStore } from '@core/stores/useSettingsStore';
import { useAuthStore } from '@core/stores/useAuthStore';
import { useCreditStore } from '@core/stores/useCreditStore';
import { useWatchlistStore } from '@core/stores/useWatchlistStore';
import { useWalletStore } from '@core/stores/useWalletStore';
import { analytics } from '@core/services/analyticsService';

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
  const navigationRef = useRef<NavigationContainerRef<any>>(null);
  const routeNameRef = useRef<string | undefined>();

  const onboardingComplete = useSettingsStore((s) => s.onboardingComplete);
  const hydrated = useSettingsStore((s) => s.hydrated);

  const session = useAuthStore((s) => s.session);
  const authInitialized = useAuthStore((s) => s.initialized);
  const initAuth = useAuthStore((s) => s.initialize);

  const initCredits = useCreditStore((s) => s.initialize);
  const initWatchlist = useWatchlistStore((s) => s.initialize);
  const initWallet = useWalletStore((s) => s.initialize);

  useEffect(() => {
    initAuth();
    initCredits();
    initWatchlist();
    initWallet();
  }, []);

  if (!hydrated || !authInitialized) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer
      theme={navTheme}
      ref={navigationRef}
      onReady={() => {
        routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name;
      }}
      onStateChange={() => {
        const current = navigationRef.current?.getCurrentRoute()?.name;
        if (current && current !== routeNameRef.current) {
          analytics.screen(current);
          routeNameRef.current = current;
        }
      }}
    >
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
