import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { getChainVolume, getTransactions } from '@core/services/creditService';
import { colors } from '@theme/colors';

export interface MetricCard {
  label: string;
  value: string;
  subValue?: string;
  icon: string;
  color: string;
  bgColor: string;
}

export function useInvestorMetrics() {
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

  return { metrics, loading };
}
