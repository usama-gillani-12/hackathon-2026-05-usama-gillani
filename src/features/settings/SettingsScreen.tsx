import React from 'react';
import { ScrollView, View } from 'react-native';
import { Text, Surface, Switch, Button, Divider } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { DrawerParamList } from '@t/navigation';
import { colors } from '@theme/colors';
import { ms } from '@theme/responsive';
import { useSettings } from './Settings.hooks';
import { styles } from './Settings.styles';

type Props = DrawerScreenProps<DrawerParamList, 'Settings'>;

const APP_VERSION = '1.0.0';

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const {
    mockApiMode,
    status,
    busy,
    isDemoMode,
    toggleMock,
    handleClearAll,
    apiStatusRows,
    dataActions,
  } = useSettings();

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
          {apiStatusRows.map((row) => (
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
            <View style={[styles.statusPill, { backgroundColor: isDemoMode ? colors.warningSoft : colors.successSoft }]}>
              <View style={[styles.dot, { backgroundColor: isDemoMode ? colors.warning : colors.success }]} />
              <Text style={[styles.statusVal, { color: isDemoMode ? colors.warning : colors.success }]}>
                {isDemoMode ? 'Mock / Demo' : 'Live'}
              </Text>
            </View>
          </View>
          <Text style={styles.hint}>Replace MockPaymentService in paymentService.ts with a backend-verified implementation for live USDC.</Text>
        </Surface>

        {/* Section: Data management */}
        <Surface style={styles.section} elevation={1}>
          <Text style={styles.sectionTitle}>Local Data</Text>
          <Divider style={styles.divider} />
          {dataActions.map((item) => (
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
