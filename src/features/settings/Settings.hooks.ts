import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { isYoutubeKeyConfigured } from '@core/api/youtubeApi';
import { clearTransactions, resetCredits } from '@core/services/creditService';
import {
  clearProductCache, loadScoredProducts, probeProductSources, ProductSourceStatus,
} from '@core/services/productService';
import { clearAllAppData, readJson, StorageKeys, writeJson } from '@core/services/storageService';
import { clearUnlocks } from '@core/services/unlockService';
import { clearWatchlist } from '@core/services/watchlistService';
import { useSettingsStore } from '@core/stores/useSettingsStore';

export function useSettings() {
  const [mockApiMode, setMockApiMode] = useState(false);
  const [status, setStatus] = useState<ProductSourceStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const resetOnboarding = useSettingsStore((s) => s.resetOnboarding);
  const paymentMode = useSettingsStore((s) => s.paymentMode);
  const isDemoMode = paymentMode === 'mock';

  const refresh = useCallback(async () => {
    const stored = await readJson<{ mockApiMode: boolean }>(StorageKeys.Settings, { mockApiMode: false });
    setMockApiMode(stored.mockApiMode);
    probeProductSources().then(setStatus);
  }, []);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const toggleMock = async (value: boolean) => {
    setMockApiMode(value);
    await writeJson(StorageKeys.Settings, { mockApiMode: value });
    clearProductCache();
    setBusy(true);
    await loadScoredProducts({ refresh: true, forceMock: value });
    setBusy(false);
  };

  const confirm = (title: string, message: string, action: () => Promise<void>) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', style: 'destructive', onPress: async () => {
        setBusy(true);
        try { await action(); } finally { setBusy(false); }
      }},
    ]);
  };

  const handleClearAll = () => {
    confirm('Clear ALL local data?', 'Watchlist, unlocks, transactions, and cache will be erased. Onboarding will replay.', async () => {
      await clearAllAppData();
      clearProductCache();
      resetOnboarding();
    });
  };

  const apiStatusRows = [
    { label: 'DummyJSON', value: statusLabel(status?.dummyJson), ok: status?.dummyJson === 'ok' },
    { label: 'Fake Store', value: statusLabel(status?.fakeStore), ok: status?.fakeStore === 'ok' },
    { label: 'YouTube API', value: isYoutubeKeyConfigured() ? 'Configured' : 'Missing (mock buzz)', ok: isYoutubeKeyConfigured() },
    { label: 'Active Source', value: (status?.activeSource ?? 'mock').toUpperCase(), ok: status?.activeSource !== 'mock' },
  ];

  const dataActions = [
    { label: 'Reset credits', sub: 'Restore starter credit balance', icon: 'refresh', action: () => confirm('Reset credits?', 'Credit balance will reset to starter amount.', async () => { await resetCredits(); }) },
    { label: 'Clear watchlist', sub: 'Remove all saved products', icon: 'star-off-outline', action: () => confirm('Clear watchlist?', 'All saved products will be removed.', async () => { await clearWatchlist(); }) },
    { label: 'Re-lock premium products', sub: 'Revoke all unlocks', icon: 'lock-outline', action: () => confirm('Re-lock all products?', 'You will need to spend credits again.', async () => { await clearUnlocks(); }) },
    { label: 'Clear transactions', sub: 'Erase transaction history', icon: 'receipt', action: () => confirm('Clear transactions?', 'All records will be removed.', async () => { await clearTransactions(); }) },
  ];

  return {
    mockApiMode,
    status,
    busy,
    isDemoMode,
    toggleMock,
    handleClearAll,
    apiStatusRows,
    dataActions,
  };
}

function statusLabel(v?: string): string {
  if (v === 'ok') return 'Connected';
  if (v === 'failed') return 'Unavailable';
  return 'Checking…';
}
