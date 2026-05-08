import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  Credits: '@trendscout/credits',
  Watchlist: '@trendscout/watchlist',
  Unlocks: '@trendscout/unlocks',
  Transactions: '@trendscout/transactions',
  OnboardingComplete: '@trendscout/onboarding-complete',
  ProductCache: '@trendscout/product-cache',
  Settings: '@trendscout/settings',
} as const;

export async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJson<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // best-effort persistence
  }
}

export async function removeKey(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export async function clearAllAppData(): Promise<void> {
  const keys = Object.values(StorageKeys);
  await Promise.all(keys.map((k) => AsyncStorage.removeItem(k)));
}
