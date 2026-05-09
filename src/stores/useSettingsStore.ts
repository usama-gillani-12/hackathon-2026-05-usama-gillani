import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PaymentMode = 'mock' | 'testnet';

interface SettingsState {
  mockApiMode: boolean;
  paymentMode: PaymentMode;
  onboardingComplete: boolean;
  hydrated: boolean;
  setMockApiMode: (v: boolean) => void;
  setPaymentMode: (m: PaymentMode) => void;
  markOnboardingComplete: () => void;
  resetOnboarding: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      mockApiMode: false,
      paymentMode: 'mock',
      onboardingComplete: false,
      hydrated: false,

      setMockApiMode: (v) => set({ mockApiMode: v }),

      setPaymentMode: (m) => set({ paymentMode: m }),

      markOnboardingComplete: () => set({ onboardingComplete: true }),

      resetOnboarding: () => set({ onboardingComplete: false }),
    }),
    {
      name: '@trendpro/settings-store',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => () => {
        useSettingsStore.setState({ hydrated: true });
      },
    },
  ),
);
