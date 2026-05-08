import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  mockApiMode: boolean;
  onboardingComplete: boolean;
  hydrated: boolean;
  setMockApiMode: (v: boolean) => void;
  markOnboardingComplete: () => void;
  resetOnboarding: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      mockApiMode: false,
      onboardingComplete: false,
      hydrated: false,

      setMockApiMode: (v) => set({ mockApiMode: v }),

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
