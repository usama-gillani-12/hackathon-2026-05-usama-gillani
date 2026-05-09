import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { getChainVolume } from '../services/creditService';
import { getTransactions } from '../services/creditService';
import { ChainVolumeSnapshot } from '../types/credits';
import { colors, gradients } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { ms, s, vs } from '../theme/responsive';

interface MetricCard {
  label: string;
  value: string;
  subValue?: string;
  icon: string;
  color: string;
  bgColor: string;
}

export const InvestorMetricsScreen: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const [volume, txs] = await Promise.all([getChainVolume(), getTransactions()]);
      const onChainPurchases = txs.filter(
        (t) => t.type === 'purchase' && t.network === 'base-sepolia',
      );
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const recentPurchases = onChainPurchases.filter((t) => t.createdAt > thirtyDaysAgo);
      const avgOrderValue =
        onChainPurchases.length > 0
          ? volume.totalUsdcVolume / onChainPurchases.length
          : 0;
      const totalCreditsIssued = onChainPurchases.reduce((sum, t) => sum + t.credits, 0);

      setMetrics([
        {
          label: 'Total On-Chain Volume',
          value: `$${volume.totalUsdcVolume.toFixed(2)}`,
          subValue: 'USDC · Base Sepolia',
          icon: 'ethereum',
          color: colors.success,
          bgColor: colors.successSubtle,
        },
        {
          label: 'Total Transactions',
          value: `${volume.totalTransactions}`,
          subValue: 'on-chain confirmations',
          icon: 'receipt',
          color: colors.accent,
          bgColor: colors.accentSubtle,
        },
        {
          label: 'Avg Order Value',
          value: avgOrderValue > 0 ? `$${avgOrderValue.toFixed(2)}` : '—',
          subValue: 'USDC per purchase',
          icon: 'trending-up',
          color: colors.premium,
          bgColor: colors.premiumSubtle,
        },
        {
          label: 'Purchases (30d)',
          value: `${recentPurchases.length}`,
          subValue: 'last 30 days',
          icon: 'calendar-month-outline',
          color: colors.warning,
          bgColor: colors.warningSubtle,
        },
        {
          label: 'Credits Issued',
          value: `${totalCreditsIssued}`,
          subValue: 'from on-chain payments',
          icon: 'diamond-outline',
          color: colors.success,
          bgColor: colors.successSubtle,
        },
        {
          label: 'Network',
          value: 'Base Sepolia',
          subValue: 'Chain ID 84532',
          icon: 'flask-outline',
          color: colors.accent,
          bgColor: colors.accentSubtle,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMetrics();
    }, [loadMetrics]),
  );

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <LinearGradient colors={[colors.heroDark, colors.heroMid]} style={styles.hero}>
        <View style={styles.heroIcon}>
          <MaterialCommunityIcons name="chart-line-variant" size={ms(28)} color={colors.success} />
        </View>
        <Text style={styles.heroTitle}>Investor Metrics</Text>
        <Text style={styles.heroSub}>Real on-chain transaction data · Base Sepolia testnet</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.businessModelSection}>
          <Text style={styles.sectionLabel}>BUSINESS MODEL</Text>
          <Surface style={styles.modelCard} elevation={1}>
            {[
              { icon: 'arrow-right-circle-outline', color: colors.success, text: 'Starter tier ($4): low-friction trial acquisition' },
              { icon: 'repeat', color: colors.premium, text: 'Monthly Pass ($19/mo): recurring revenue for SaaS multiples' },
              { icon: 'clock-alert-outline', color: colors.warning, text: 'Credit expiry mechanic: FOMO-driven repeat purchases' },
              { icon: 'account-multiple-outline', color: colors.accent, text: 'Bulk tiers: compound value via bonus credits → higher LTV' },
            ].map((item, i) => (
              <View key={i} style={[styles.modelRow, i > 0 && { borderTopWidth: 1, borderTopColor: colors.border }]}>
                <View style={[styles.modelIcon, { backgroundColor: item.color + '18' }]}>
                  <MaterialCommunityIcons name={item.icon} size={ms(16)} color={item.color} />
                </View>
                <Text style={styles.modelText}>{item.text}</Text>
              </View>
            ))}
          </Surface>
        </View>

        <Text style={styles.sectionLabel}>ON-CHAIN METRICS</Text>
        <View style={styles.metricsGrid}>
          {metrics.map((m, i) => (
            <Surface key={i} style={styles.metricCard} elevation={1}>
              <View style={[styles.metricIconWrap, { backgroundColor: m.bgColor }]}>
                <MaterialCommunityIcons name={m.icon} size={ms(20)} color={m.color} />
              </View>
              <Text style={[styles.metricValue, { color: m.color }]}>{m.value}</Text>
              <Text style={styles.metricLabel}>{m.label}</Text>
              {m.subValue && <Text style={styles.metricSub}>{m.subValue}</Text>}
            </Surface>
          ))}
        </View>

        <Surface style={styles.explorerCard} elevation={1}>
          <View style={styles.explorerHeader}>
            <MaterialCommunityIcons name="open-in-new" size={ms(16)} color={colors.accent} />
            <Text style={styles.explorerTitle}>Verify On-Chain</Text>
          </View>
          <Text style={styles.explorerText}>
            All transactions are publicly verifiable on Base Sepolia explorer at{' '}
            <Text style={{ color: colors.accent, fontWeight: '700' }}>
              sepolia.basescan.org
            </Text>
          </Text>
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  hero: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: vs(6),
  },
  heroIcon: {
    width: ms(56),
    height: ms(56),
    borderRadius: ms(28),
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(4),
  },
  heroTitle: { color: colors.white, fontSize: ms(22), fontWeight: '800' },
  heroSub: { color: 'rgba(255,255,255,0.55)', fontSize: ms(13), textAlign: 'center' },
  content: { padding: spacing.lg, paddingBottom: spacing.xxxl, gap: vs(16) },
  businessModelSection: { gap: vs(8) },
  sectionLabel: {
    fontSize: ms(11),
    fontWeight: '800',
    color: colors.muted,
    letterSpacing: ms(1.2),
    marginBottom: vs(4),
  },
  modelCard: { borderRadius: radius.xl, backgroundColor: colors.card, overflow: 'hidden' },
  modelRow: { flexDirection: 'row', alignItems: 'flex-start', gap: ms(12), padding: ms(14) },
  modelIcon: {
    width: ms(32),
    height: ms(32),
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modelText: { flex: 1, fontSize: ms(13), color: colors.muted, lineHeight: ms(19) },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: s(10),
  },
  metricCard: {
    width: '47%',
    borderRadius: radius.xl,
    backgroundColor: colors.card,
    padding: spacing.md,
    alignItems: 'flex-start',
    gap: vs(6),
  },
  metricIconWrap: {
    width: ms(40),
    height: ms(40),
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: { fontSize: ms(22), fontWeight: '900' },
  metricLabel: { fontSize: ms(12), fontWeight: '700', color: colors.primary },
  metricSub: { fontSize: ms(11), color: colors.muted },
  explorerCard: {
    borderRadius: radius.xl,
    backgroundColor: colors.card,
    padding: spacing.md,
    gap: vs(8),
  },
  explorerHeader: { flexDirection: 'row', alignItems: 'center', gap: s(8) },
  explorerTitle: { fontSize: ms(14), fontWeight: '700', color: colors.primary },
  explorerText: { fontSize: ms(13), color: colors.muted, lineHeight: ms(20) },
});
