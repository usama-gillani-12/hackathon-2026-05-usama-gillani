import React, { useMemo, useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import Svg, {
  Circle,
  Rect,
  Text as SvgText,
  Defs,
  LinearGradient as SvgGrad,
  Stop,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withDelay,
  interpolate,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { DrawerParamList } from '../types/navigation';
import { useProductStore } from '../stores/useProductStore';
import { useCreditStore } from '../stores/useCreditStore';
import { AnalyticsSkeleton } from '../components/skeletons/AnalyticsSkeleton';
import { colors, gradients, withOpacity } from '../theme/colors';
import { spacing, radius, shadow } from '../theme/spacing';
import { ms, vs } from '../theme/responsive';
import { typography } from '../theme/typography';

type Props = DrawerScreenProps<DrawerParamList, 'Analytics'>;

const { width } = Dimensions.get('window');

// Layout constants
const CARD_MX   = spacing.lg;
const CARD_PAD  = spacing.lg;
const INNER_W   = width - CARD_MX * 2 - CARD_PAD * 2;
const BAR_LABEL_W = ms(88);
const BAR_SCORE_W = ms(36);
const BAR_AREA_W  = INNER_W - BAR_LABEL_W - BAR_SCORE_W - spacing.sm;

// Donut geometry
const DONUT_SIZE  = ms(164);
const DONUT_R     = ms(52);
const DONUT_STROKE = ms(20);
const CIRCUMFERENCE = 2 * Math.PI * DONUT_R;

// Per-category gradient pairs
const CHART_GRADS: [string, string][] = [
  [colors.accent,       colors.accentHover],
  [colors.premium,      colors.premiumDark],
  [colors.success,      colors.successDark],
  [colors.warning,      colors.warningDark],
  [colors.successDark,  colors.successDark],
  [colors.danger,       colors.dangerDark],
];

// Score tier definitions
const SCORE_TIERS = [
  { label: 'Elite', range: '90–100', min: 90, max: 100, color: colors.scoreElite },
  { label: 'High',  range: '75–89',  min: 75, max: 89,  color: colors.scoreHigh },
  { label: 'Fair',  range: '60–74',  min: 60, max: 74,  color: colors.scoreMid },
  { label: 'Low',   range: '< 60',   min: 0,  max: 59,  color: colors.muted },
];

// ─── Animated SVG primitives (module-level, not inside components) ────────────
const AnimatedRect   = Animated.createAnimatedComponent(Rect);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// ─── Number count-up (JS thread RAF, no worklet needed) ───────────────────────
function useCountUp(target: number, duration = 1400, delay = 0): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number | null = null;
    let rafId: ReturnType<typeof requestAnimationFrame>;
    const timer = setTimeout(() => {
      const tick = () => {
        if (startTime === null) startTime = Date.now();
        const elapsed = Date.now() - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setCount(Math.round(eased * target));
        if (t < 1) rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    }, delay);
    return () => { clearTimeout(timer); cancelAnimationFrame(rafId); };
  }, [target, duration, delay]);
  return count;
}

// ─── KPI glassmorphism card ───────────────────────────────────────────────────
interface KpiCardProps {
  icon: string;
  iconColor: string;
  iconBg: string;
  target: number;
  prefix?: string;
  label: string;
  delay?: number;
  highlight?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({
  icon, iconColor, iconBg, target, prefix = '', label, delay = 0, highlight = false,
}) => {
  const count = useCountUp(target, 1300, delay);
  return (
    <View style={[kpiStyles.card, highlight && kpiStyles.cardHL]}>
      <View style={[kpiStyles.iconWrap, { backgroundColor: iconBg }]}>
        <MaterialCommunityIcons name={icon} size={ms(16)} color={iconColor} />
      </View>
      <Text style={kpiStyles.val}>{prefix}{count}</Text>
      <Text style={kpiStyles.lbl}>{label}</Text>
    </View>
  );
};

const kpiStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    paddingVertical: vs(12),
    paddingHorizontal: ms(8),
    alignItems: 'center',
    gap: vs(4),
  },
  cardHL: {
    backgroundColor: 'rgba(255,255,255,0.11)',
    borderColor: 'rgba(255,255,255,0.20)',
  },
  iconWrap: {
    width: ms(32), height: ms(32),
    borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: vs(2),
  },
  val: {
    ...typography.numericLg,
    color: colors.white,
    letterSpacing: ms(-0.8),
  },
  lbl: {
    fontSize: ms(9),
    fontWeight: '600',
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase',
    letterSpacing: ms(0.5),
    textAlign: 'center',
  },
});

// ─── Animated horizontal bar row ──────────────────────────────────────────────
interface BarRowProps {
  cat: string;
  score: number;
  maxScore: number;
  index: number;
  gradColors: [string, string];
}

const BarRow: React.FC<BarRowProps> = ({ cat, score, maxScore, index, gradColors }) => {
  const targetW = (score / maxScore) * BAR_AREA_W;
  const prog    = useSharedValue(0);

  useEffect(() => {
    prog.value = withDelay(
      280 + index * 85,
      withTiming(1, { duration: 650, easing: Easing.out(Easing.cubic) }),
    );
  }, []);

  const barProps = useAnimatedProps(() => ({
    width: interpolate(prog.value, [0, 1], [0, targetW]),
  }));

  const scoreStyle = useAnimatedStyle(() => ({
    opacity: prog.value,
    transform: [{ translateX: interpolate(prog.value, [0, 1], [8, 0]) }],
  }));

  const gradId = `bg${index}`;

  return (
    <View style={barStyles.row}>
      <Text style={barStyles.label} numberOfLines={1}>
        {cat.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
      </Text>
      <View style={barStyles.trackArea}>
        <Svg width={BAR_AREA_W} height={ms(18)}>
          <Defs>
            <SvgGrad id={gradId} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={gradColors[0]} />
              <Stop offset="1" stopColor={gradColors[1]} />
            </SvgGrad>
          </Defs>
          <Rect x={0} y={0} width={BAR_AREA_W} height={ms(18)} rx={ms(9)}
            fill={withOpacity(gradColors[0], 0.10)} />
          <AnimatedRect x={0} y={0} height={ms(18)} rx={ms(9)}
            fill={`url(#${gradId})`} animatedProps={barProps} />
        </Svg>
      </View>
      <Animated.Text style={[barStyles.score, scoreStyle]}>{score}</Animated.Text>
    </View>
  );
};

const barStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(9),
  },
  label: {
    width: BAR_LABEL_W,
    fontSize: ms(11),
    fontWeight: '500',
    color: colors.textSecondary,
  },
  trackArea: { flex: 1 },
  score: {
    width: BAR_SCORE_W,
    textAlign: 'right',
    fontSize: ms(12),
    fontWeight: '800',
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
});

// ─── Animated donut segment ───────────────────────────────────────────────────
interface DonutSegProps {
  targetDash: number;
  dashOffset: number;
  color: string;
  cx: number;
  cy: number;
  mountDelay: number;
}

const DonutSegment: React.FC<DonutSegProps> = ({
  targetDash, dashOffset, color, cx, cy, mountDelay,
}) => {
  const prog = useSharedValue(0);

  useEffect(() => {
    prog.value = withDelay(
      mountDelay,
      withTiming(1, { duration: 580, easing: Easing.out(Easing.cubic) }),
    );
  }, []);

  const animProps = useAnimatedProps(() => {
    const len = interpolate(prog.value, [0, 1], [0, targetDash]);
    // strokeDasharray as array is supported by react-native-svg v15
    return { strokeDasharray: [len, CIRCUMFERENCE] as unknown as string };
  });

  return (
    <AnimatedCircle
      cx={cx} cy={cy} r={DONUT_R}
      fill="none"
      stroke={color}
      strokeWidth={DONUT_STROKE - ms(2)}
      strokeLinecap="butt"
      strokeDashoffset={-dashOffset}
      transform={`rotate(-90, ${cx}, ${cy})`}
      animatedProps={animProps}
    />
  );
};

// ─── Main screen ─────────────────────────────────────────────────────────────
export const AnalyticsScreen: React.FC<Props> = ({ navigation }) => {
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

  if (loading && products.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <AnalyticsSkeleton />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.heroDark} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ─── Dark hero ───────────────────────────────────────────────── */}
        <LinearGradient colors={[colors.heroDark, colors.heroMid, colors.heroLight]} style={styles.hero}>
          <View style={styles.navRow}>
            <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.navBtn}>
              <MaterialCommunityIcons name="menu" size={ms(22)} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
            <View style={styles.navCenter}>
              <Text style={styles.heroTitle}>Analytics</Text>
              <Text style={styles.heroSub}>{totalProducts} products tracked</Text>
            </View>
            <View style={styles.navBtn} />
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.kpiRow}>
            <KpiCard
              icon="chart-box-outline"
              iconColor={colors.accent}
              iconBg={withOpacity(colors.accent, 0.22)}
              target={totalProducts}
              label="Analyzed"
              delay={200}
            />
            <KpiCard
              icon="fire"
              iconColor={colors.warning}
              iconBg={withOpacity(colors.warning, 0.22)}
              target={highOpp}
              label="High Opp."
              delay={360}
              highlight
            />
            <KpiCard
              icon="currency-usd"
              iconColor={colors.success}
              iconBg={withOpacity(colors.success, 0.22)}
              target={Math.round(totalSpent)}
              prefix="$"
              label="Credits Spent"
              delay={520}
            />
          </View>
        </LinearGradient>

        {/* ─── Category performance ─────────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(160).duration(460)} style={styles.card}>
          <View style={styles.sectionHead}>
            <View>
              <Text style={styles.sectionTitle}>Category Performance</Text>
              <Text style={styles.sectionSub}>Average winning score per category</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillText}>TOP 6</Text>
            </View>
          </View>

          {categoryStats.length > 0 ? (
            <View style={{ marginTop: vs(4) }}>
              {categoryStats.map((item, i) => (
                <BarRow
                  key={item.cat}
                  cat={item.cat}
                  score={item.avgScore}
                  maxScore={maxCatScore}
                  index={i}
                  gradColors={CHART_GRADS[i % CHART_GRADS.length]}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="chart-bar" size={ms(36)} color={colors.border} />
              <Text style={styles.emptyText}>Load products to see category data</Text>
            </View>
          )}
        </Animated.View>

        {/* ─── Score breakdown (donut) ──────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(260).duration(460)} style={styles.card}>
          <View style={styles.sectionHead}>
            <View>
              <Text style={styles.sectionTitle}>Score Breakdown</Text>
              <Text style={styles.sectionSub}>Products bucketed by winning score tier</Text>
            </View>
          </View>

          <View style={styles.donutRow}>
            <View style={styles.donutWrap}>
              <Svg width={DONUT_SIZE} height={DONUT_SIZE}>
                {/* track ring */}
                <Circle cx={cx} cy={cy} r={DONUT_R}
                  fill="none" stroke={colors.border} strokeWidth={DONUT_STROKE} />
                {/* animated segments */}
                {donutSegments.map((seg, i) => (
                  <DonutSegment
                    key={seg.label}
                    targetDash={seg.dashLen}
                    dashOffset={seg.offset}
                    color={seg.color}
                    cx={cx} cy={cy}
                    mountDelay={460 + i * 130}
                  />
                ))}
                {/* center labels */}
                <SvgText x={cx} y={cy - ms(3)} textAnchor="middle"
                  fill={colors.primary} fontSize={ms(20)} fontWeight="800">
                  {products.length}
                </SvgText>
                <SvgText x={cx} y={cy + ms(13)} textAnchor="middle"
                  fill={colors.muted} fontSize={ms(9)} fontWeight="600">
                  TOTAL
                </SvgText>
              </Svg>
            </View>

            <View style={styles.legend}>
              {scoreDistribution.map((b) => {
                const pct = products.length > 0
                  ? Math.round((b.count / products.length) * 100)
                  : 0;
                return (
                  <View key={b.label} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: b.color }]} />
                    <View style={{ flex: 1 }}>
                      <View style={styles.legendTopRow}>
                        <Text style={styles.legendName}>{b.label}</Text>
                        <Text style={[styles.legendCount, { color: b.color }]}>{b.count}</Text>
                      </View>
                      <View style={styles.legendTrack}>
                        <View style={[styles.legendFill, { width: `${pct}%`, backgroundColor: b.color }]} />
                      </View>
                      <Text style={styles.legendRange}>{b.range}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </Animated.View>

        {/* ─── Credit activity ─────────────────────────────────────────── */}
        <Animated.View
          entering={FadeInDown.delay(360).duration(460)}
          style={[styles.card, styles.lastCard]}
        >
          <View style={styles.sectionHead}>
            <View>
              <Text style={styles.sectionTitle}>Credit Activity</Text>
              <Text style={styles.sectionSub}>Recent transaction history</Text>
            </View>
            {transactions.length > 5 && (
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            )}
          </View>

          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="credit-card-outline" size={ms(36)} color={colors.border} />
              <Text style={styles.emptyText}>No transactions yet</Text>
            </View>
          ) : (
            transactions.slice(0, 5).map((t, i) => {
              const isPurchase = t.type === 'purchase';
              const isLast     = i === Math.min(transactions.length, 5) - 1;
              return (
                <View key={t.id} style={[styles.txRow, !isLast && styles.txDivider]}>
                  <LinearGradient
                    colors={isPurchase ? gradients.accent : gradients.premium}
                    style={styles.txIcon}
                  >
                    <MaterialCommunityIcons
                      name={isPurchase ? 'plus' : 'lock-open-outline'}
                      size={ms(13)}
                      color={colors.white}
                    />
                  </LinearGradient>

                  <View style={styles.txBody}>
                    <Text style={styles.txLabel} numberOfLines={1}>
                      {t.packageLabel ?? t.productTitle ?? 'Unlock'}
                    </Text>
                    <Text style={styles.txSub}>
                      {isPurchase ? `+${t.credits} credits added` : `${Math.abs(t.credits)} credits used`}
                    </Text>
                  </View>

                  <View style={styles.txRight}>
                    <Text style={[styles.txAmt, { color: isPurchase ? colors.success : colors.textPrimary }]}>
                      {isPurchase ? `+$${t.usdcAmount}` : `-${Math.abs(t.credits)}cr`}
                    </Text>
                    <View style={[
                      styles.txBadge,
                      { backgroundColor: isPurchase ? colors.successSoft : colors.premiumSoft },
                    ]}>
                      <Text style={[
                        styles.txBadgeText,
                        { color: isPurchase ? colors.success : colors.premium },
                      ]}>
                        {isPurchase ? 'BUY' : 'USE'}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: vs(40) },

  // Hero
  hero: { paddingBottom: vs(20) },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: vs(10),
    paddingBottom: vs(12),
  },
  navBtn: {
    width: ms(40), height: ms(40),
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  navCenter:  { alignItems: 'center' },
  heroTitle:  { fontSize: ms(18), fontWeight: '700', color: colors.white, letterSpacing: ms(-0.2) },
  heroSub:    { fontSize: ms(11), color: 'rgba(255,255,255,0.42)', marginTop: vs(1) },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginHorizontal: spacing.lg,
    marginBottom: vs(16),
  },
  kpiRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm },

  // Cards
  card: {
    marginHorizontal: CARD_MX,
    marginTop: spacing.lg,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: CARD_PAD,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  lastCard: { marginBottom: spacing.lg },

  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.h2, color: colors.primary },
  sectionSub:   { ...typography.small, color: colors.muted, marginTop: vs(2) },

  pill: {
    backgroundColor: colors.accentSubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: vs(3),
    borderRadius: radius.pill,
  },
  pillText: { fontSize: ms(9), fontWeight: '700', color: colors.accent, letterSpacing: ms(0.8) },

  seeAll: { ...typography.smallStrong, color: colors.accent, paddingTop: vs(2) },

  emptyState: { height: vs(90), alignItems: 'center', justifyContent: 'center', gap: vs(8) },
  emptyText:  { ...typography.small, color: colors.muted },

  // Donut
  donutRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing.xl, marginTop: vs(4) },
  donutWrap: { alignItems: 'center', justifyContent: 'center' },

  // Legend
  legend:      { flex: 1, gap: vs(10) },
  legendRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  legendDot:   { width: ms(8), height: ms(8), borderRadius: radius.pill, marginTop: vs(3) },
  legendTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  legendName:   { fontSize: ms(12), fontWeight: '700', color: colors.primary },
  legendCount:  { fontSize: ms(13), fontWeight: '800' },
  legendTrack:  { height: vs(4), backgroundColor: colors.border, borderRadius: radius.pill, marginTop: vs(4), overflow: 'hidden' },
  legendFill:   { height: '100%', borderRadius: radius.pill, opacity: 0.85 },
  legendRange:  { fontSize: ms(9), color: colors.muted, fontWeight: '500', marginTop: vs(2) },

  // Transactions
  txRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: vs(11) },
  txDivider: { borderBottomWidth: 1, borderBottomColor: colors.border },
  txIcon:   { width: ms(36), height: ms(36), borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  txBody:   { flex: 1, marginLeft: spacing.md },
  txLabel:  { ...typography.bodyStrong, color: colors.primary },
  txSub:    { ...typography.small, color: colors.muted, marginTop: vs(1) },
  txRight:  { alignItems: 'flex-end', gap: vs(4) },
  txAmt:    { fontSize: ms(14), fontWeight: '800', letterSpacing: ms(-0.3) },
  txBadge:  { paddingHorizontal: spacing.sm, paddingVertical: vs(2), borderRadius: radius.pill },
  txBadgeText: { fontSize: ms(8), fontWeight: '700', letterSpacing: ms(0.6) },
});
