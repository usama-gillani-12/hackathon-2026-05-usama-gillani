import React from 'react';
import { ScrollView, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '@theme/colors';
import { ms } from '@theme/responsive';
import { useInvestorMetrics } from './InvestorMetrics.hooks';
import { styles } from './InvestorMetrics.styles';

export const InvestorMetricsScreen: React.FC = () => {
  const { metrics } = useInvestorMetrics();

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
