import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { DrawerParamList } from '@t/navigation';
import { useProductStore } from '@core/stores/useProductStore';
import { useCreditStore } from '@core/stores/useCreditStore';
import { colors } from '@theme/colors';
import { spacing } from '@theme/spacing';
import { ms } from '@theme/responsive';

// Layout constants (width-independent)
const CARD_MX   = spacing.lg;
const CARD_PAD  = spacing.lg;
const BAR_LABEL_W = ms(88);
const BAR_SCORE_W = ms(36);

// Donut geometry
export const DONUT_SIZE  = ms(164);
export const DONUT_R     = ms(52);
export const DONUT_STROKE = ms(20);
export const CIRCUMFERENCE = 2 * Math.PI * DONUT_R;

// Score tier definitions
export const SCORE_TIERS = [
  { label: 'Elite', range: '90–100', min: 90, max: 100, color: colors.scoreElite },
  { label: 'High',  range: '75–89',  min: 75, max: 89,  color: colors.scoreHigh },
  { label: 'Fair',  range: '60–74',  min: 60, max: 74,  color: colors.scoreMid },
  { label: 'Low',   range: '< 60',   min: 0,  max: 59,  color: colors.muted },
];

type Props = DrawerScreenProps<DrawerParamList, 'Analytics'>;

export function useAnalytics(navigation: Props['navigation']) {
  const { width } = useWindowDimensions();
  const INNER_W    = width - CARD_MX * 2 - CARD_PAD * 2;
  const BAR_AREA_W = INNER_W - BAR_LABEL_W - BAR_SCORE_W - spacing.sm;

  const products     = useProductStore((s) => s.products);
  const loading      = useProductStore((s) => s.loading);
  const transactions = useCreditStore((s) => s.transactions);

  const categoryStats = useMemo(() => {
    const map: Record<string, { count: number; totalScore: number }> = {};
    products.forEach((p) => {
      const cat = p.product.category;
      if (!map[cat]) map[cat] = { count: 0, totalScore: 0 };
      map[cat].count++;
      map[cat].totalScore += p.winningScore;
    });
    return Object.entries(map)
      .map(([cat, v]) => ({ cat, avgScore: Math.round(v.totalScore / v.count), count: v.count }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 6);
  }, [products]);

  const scoreDistribution = useMemo(() =>
    SCORE_TIERS.map((tier) => ({
      ...tier,
      count: products.filter(
        (p) => p.winningScore >= tier.min && p.winningScore <= tier.max,
      ).length,
    })),
  [products]);

  const maxCatScore   = Math.max(...categoryStats.map((c) => c.avgScore), 1);
  const totalProducts = products.length || 52;
  const highOpp       = products.filter((p) => p.winningScore >= 80).length || 8;
  const totalSpent    = transactions
    .filter((t) => t.type === 'purchase')
    .reduce((s, t) => s + t.usdcAmount, 0);
  const distTotal = scoreDistribution.reduce((s, b) => s + b.count, 0) || 1;

  const donutSegments = useMemo(() => {
    let acc = 0;
    return scoreDistribution.map((b) => {
      const dashLen = (b.count / distTotal) * CIRCUMFERENCE;
      const offset  = acc;
      acc += dashLen;
      return { ...b, dashLen, offset };
    });
  }, [scoreDistribution, distTotal]);

  const cx = DONUT_SIZE / 2;
  const cy = DONUT_SIZE / 2;

  const openDrawer = () => navigation.openDrawer();

  return {
    products,
    loading,
    transactions,
    categoryStats,
    scoreDistribution,
    maxCatScore,
    totalProducts,
    highOpp,
    totalSpent,
    distTotal,
    donutSegments,
    cx,
    cy,
    BAR_AREA_W,
    openDrawer,
  };
}
