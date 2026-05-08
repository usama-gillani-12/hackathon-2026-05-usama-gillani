import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Text, Surface, Switch, Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { DrawerParamList } from '../types/navigation';
import { isYoutubeKeyConfigured } from '../api/youtubeApi';
import { clearTransactions, resetCredits } from '../services/creditService';
import { isDemoPaymentMode } from '../services/paymentService';
import {
  clearProductCache, loadScoredProducts, probeProductSources, ProductSourceStatus,
} from '../services/productService';
import { clearAllAppData, readJson, StorageKeys, writeJson } from '../services/storageService';
import { clearUnlocks } from '../services/unlockService';
import { clearWatchlist } from '../services/watchlistService';
import { useSettingsStore } from '../stores/useSettingsStore';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { ms, s, vs } from '../theme/responsive';

type Props = DrawerScreenProps<DrawerParamList, 'Settings'>;

const APP_VERSION = '1.0.0';

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [mockApiMode, setMockApiMode] = useState(false);
  const [status, setStatus] = useState<ProductSourceStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const resetOnboarding = useSettingsStore((s) => s.resetOnboarding);

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

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section: API Mode */}
        <Surface style={styles.section} elevation={1}>
          <Text style={styles.sectionTitle}>Product Data</Text>
          <Divider style={styles.divider} />
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <MaterialCommunityIcons name="database-outline" size={ms(18)} color={colors.accent} />
              <View>
                <Text style={styles.toggleLabel}>Mock API Mode</Text>
                <Text style={styles.toggleSub}>{mockApiMode ? 'Using bundled demo data' : 'Using live DummyJSON / Fake Store'}</Text>
              </View>
            </View>
            <Switch
              value={mockApiMode}
              onValueChange={toggleMock}
              color={colors.accent}
            />
          </View>
        </Surface>

        {/* Section: API status */}
        <Surface style={styles.section} elevation={1}>
          <Text style={styles.sectionTitle}>API Status</Text>
          <Divider style={styles.divider} />
          {[
            { label: 'DummyJSON', value: statusLabel(status?.dummyJson), ok: status?.dummyJson === 'ok' },
            { label: 'Fake Store', value: statusLabel(status?.fakeStore), ok: status?.fakeStore === 'ok' },
            { label: 'YouTube API', value: isYoutubeKeyConfigured() ? 'Configured' : 'Missing (mock buzz)', ok: isYoutubeKeyConfigured() },
            { label: 'Active Source', value: (status?.activeSource ?? 'mock').toUpperCase(), ok: status?.activeSource !== 'mock' },
          ].map((row) => (
            <View key={row.label} style={styles.statusRow}>
              <Text style={styles.statusLabel}>{row.label}</Text>
              <View style={[styles.statusPill, { backgroundColor: row.ok ? colors.successSoft : colors.warningSoft }]}>
                <View style={[styles.dot, { backgroundColor: row.ok ? colors.success : colors.warning }]} />
                <Text style={[styles.statusVal, { color: row.ok ? colors.success : colors.warning }]}>{row.value}</Text>
              </View>
            </View>
          ))}
          <Text style={styles.hint}>Set EXPO_PUBLIC_YOUTUBE_API_KEY to enable live social-buzz scoring.</Text>
        </Surface>

        {/* Section: USDC */}
        <Surface style={styles.section} elevation={1}>
          <Text style={styles.sectionTitle}>USDC Payments</Text>
          <Divider style={styles.divider} />
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Payment Mode</Text>
            <View style={[styles.statusPill, { backgroundColor: isDemoPaymentMode() ? colors.warningSoft : colors.successSoft }]}>
              <View style={[styles.dot, { backgroundColor: isDemoPaymentMode() ? colors.warning : colors.success }]} />
              <Text style={[styles.statusVal, { color: isDemoPaymentMode() ? colors.warning : colors.success }]}>
                {isDemoPaymentMode() ? 'Mock / Demo' : 'Live'}
              </Text>
            </View>
          </View>
          <Text style={styles.hint}>Replace MockPaymentService in paymentService.ts with a backend-verified implementation for live USDC.</Text>
        </Surface>

        {/* Section: Data management */}
        <Surface style={styles.section} elevation={1}>
          <Text style={styles.sectionTitle}>Local Data</Text>
          <Divider style={styles.divider} />
          {[
            { label: 'Reset credits', sub: 'Restore starter credit balance', icon: 'refresh', action: () => confirm('Reset credits?', 'Credit balance will reset to starter amount.', async () => { await resetCredits(); }) },
            { label: 'Clear watchlist', sub: 'Remove all saved products', icon: 'star-off-outline', action: () => confirm('Clear watchlist?', 'All saved products will be removed.', async () => { await clearWatchlist(); }) },
            { label: 'Re-lock premium products', sub: 'Revoke all unlocks', icon: 'lock-outline', action: () => confirm('Re-lock all products?', 'You will need to spend credits again.', async () => { await clearUnlocks(); }) },
            { label: 'Clear transactions', sub: 'Erase transaction history', icon: 'receipt', action: () => confirm('Clear transactions?', 'All records will be removed.', async () => { await clearTransactions(); }) },
          ].map((item) => (
            <View key={item.label} style={styles.actionRow}>
              <View style={styles.actionLeft}>
                <MaterialCommunityIcons name={item.icon} size={ms(16)} color={colors.muted} />
                <View>
                  <Text style={styles.actionLabel}>{item.label}</Text>
                  <Text style={styles.actionSub}>{item.sub}</Text>
                </View>
              </View>
              <Button mode="outlined" onPress={item.action} compact textColor={colors.primary} style={styles.actionBtn}>
                Run
              </Button>
            </View>
          ))}
          <Divider style={styles.divider} />
          <Button mode="contained" onPress={handleClearAll} buttonColor={colors.danger} loading={busy} style={styles.clearAllBtn}>
            Clear ALL Local Data
          </Button>
        </Surface>

        <Text style={styles.version}>TrendPro · v{APP_VERSION}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

function statusLabel(v?: string): string {
  if (v === 'ok') return 'Connected';
  if (v === 'failed') return 'Unavailable';
  return 'Checking…';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl },
  section: { borderRadius: radius.lg, backgroundColor: colors.card, overflow: 'hidden' },
  sectionTitle: { fontSize: ms(14), fontWeight: '700', color: colors.primary, padding: spacing.md, paddingBottom: spacing.sm },
  divider: { backgroundColor: colors.border },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: spacing.md,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: ms(12), flex: 1 },
  toggleLabel: { fontSize: ms(14), fontWeight: '600', color: colors.primary },
  toggleSub: { fontSize: ms(12), color: colors.muted, marginTop: vs(1) },
  statusRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: vs(10),
  },
  statusLabel: { fontSize: ms(13), color: colors.muted },
  statusPill: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: radius.pill, paddingVertical: vs(3), paddingHorizontal: s(10),
  },
  dot: { width: ms(6), height: ms(6), borderRadius: ms(3), marginRight: s(5) },
  statusVal: { fontSize: ms(11), fontWeight: '700' },
  hint: { fontSize: ms(11), color: colors.muted, paddingHorizontal: spacing.md, paddingBottom: spacing.md, lineHeight: ms(16) },
  actionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingVertical: vs(10),
  },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: ms(10), flex: 1 },
  actionLabel: { fontSize: ms(13), fontWeight: '600', color: colors.primary },
  actionSub: { fontSize: ms(11), color: colors.muted },
  actionBtn: { borderRadius: radius.md, borderColor: colors.border },
  clearAllBtn: { margin: spacing.md, marginTop: spacing.sm, borderRadius: radius.md },
  version: { textAlign: 'center', fontSize: ms(12), color: colors.muted },
});
