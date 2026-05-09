import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PaperProvider } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { Web3Modal } from '@web3modal/wagmi-react-native';
import { PostHogProvider } from 'posthog-react-native';
import { posthog } from '@core/lib/posthog';

import { AppNavigator } from '@core/navigation/AppNavigator';
import { ErrorBoundary } from '@shared/components/error-boundary';
import { paperTheme } from '@theme/paperTheme';
import { wagmiConfig } from '@core/config/wagmi';
import { BaseSepoliaPaymentService, MockPaymentService, setPaymentService } from '@core/services/paymentService';
import { useSettingsStore } from '@core/stores/useSettingsStore';

// Safe synchronous default before the persisted store hydrates.
setPaymentService(MockPaymentService);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 min — products don't change that often
      retry: 2,
      refetchOnWindowFocus: false, // React Native handles focus differently
    },
  },
});

export default function App() {
  const paymentMode = useSettingsStore((s) => s.paymentMode);
  const hydrated = useSettingsStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    setPaymentService(paymentMode === 'mock' ? MockPaymentService : BaseSepoliaPaymentService);
    if (__DEV__) {
      console.log('[Payment] mode =', paymentMode);
    }
  }, [paymentMode, hydrated]);

  return (
    <PostHogProvider client={posthog} autocapture={false}>
      <WagmiProvider config={wagmiConfig}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider>
            <QueryClientProvider client={queryClient}>
              <PaperProvider theme={paperTheme}>
                <StatusBar barStyle="light-content" backgroundColor="#0B1220" />
                <ErrorBoundary>
                  <AppNavigator />
                </ErrorBoundary>
                <Web3Modal />
              </PaperProvider>
            </QueryClientProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </WagmiProvider>
    </PostHogProvider>
  );
}
