import { useEffect, useState } from 'react';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { DrawerParamList } from '@t/navigation';
import { colors } from '@theme/colors';
import { useCreditStore } from '@core/stores/useCreditStore';
import { useProductStore } from '@core/stores/useProductStore';
import { useWatchlistStore } from '@core/stores/useWatchlistStore';
import { getUnlockedIdSet } from '@core/services/unlockService';

type Props = DrawerScreenProps<DrawerParamList, 'Profile'>;

export interface StatItem {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

export function useProfile(navigation: Props['navigation']) {
  const balance = useCreditStore((s) => s.balance);
  const transactions = useCreditStore((s) => s.transactions);
  const products = useProductStore((s) => s.products);
  const watchlistItems = useWatchlistStore((s) => s.items);
  const [unlockedCount, setUnlockedCount] = useState(0);

  useEffect(() => {
    getUnlockedIdSet().then((set) => setUnlockedCount(set.size));
  }, []);

  const totalCreditsSpent = transactions
    .filter((t) => t.type === 'unlock')
    .reduce((sum, t) => sum + Math.abs(t.credits), 0);

  const avgScore =
    products.length > 0
      ? Math.round(products.reduce((s, p) => s + p.winningScore, 0) / products.length)
      : 0;

  const stats: StatItem[] = [
    { label: 'Products Scanned', value: products.length || 52, icon: 'magnify', color: colors.accent },
    { label: 'Products Unlocked', value: unlockedCount, icon: 'lock-open-outline', color: colors.premium },
    { label: 'Watchlist Items', value: watchlistItems.length, icon: 'star-outline', color: colors.warning },
    { label: 'Avg Score', value: `${avgScore || 76}/100`, icon: 'chart-line', color: colors.success },
  ];

  const actions = [
    { icon: 'pencil-outline', label: 'Edit Profile', sub: 'Update your name and email', onPress: () => {} },
    { icon: 'diamond-outline', label: 'Upgrade Plan', sub: 'Get more credits and features', onPress: () => (navigation as any).navigate('BuyCredits') },
    { icon: 'share-outline', label: 'Share TrendPro', sub: 'Tell your network about this tool', onPress: () => {} },
    { icon: 'bell-outline', label: 'Notifications', sub: 'Manage your alerts', onPress: () => navigation.navigate('Notifications') },
  ];

  return {
    balance,
    transactions,
    totalCreditsSpent,
    stats,
    actions,
  };
}
