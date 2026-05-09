import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
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
import { DrawerParamList } from '@t/navigation';
import { AnalyticsSkeleton } from '@shared/components/skeletons';
import { colors, gradients, withOpacity } from '@theme/colors';
import { spacing, radius } from '@theme/spacing';
import { ms, vs } from '@theme/responsive';
import { typography } from '@theme/typography';
import { useAnalytics, DONUT_SIZE, DONUT_R, DONUT_STROKE, CIRCUMFERENCE } from './Analytics.hooks';
import { styles, kpiStyles, barStyles } from './Analytics.styles';

type Props = DrawerScreenProps<DrawerParamList, 'Analytics'>;

// Layout constants (width-independent)
const BAR_LABEL_W = ms(88);
const BAR_SCORE_W = ms(36);

// Per-category gradient pairs
const CHART_GRADS: [string, string][] = [
  [colors.accent,       colors.accentHover],
  [colors.premium,      colors.premiumDark],
  [colors.success,      colors.successDark],
  [colors.warning,      colors.warningDark],
  [colors.successDark,  colors.successDark],
  [colors.danger,       colors.dangerDark],
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

// ─── Animated horizontal bar row ──────────────────────────────────────────────
interface BarRowProps {
  cat: string;
  score: number;
  maxScore: number;
  index: number;
  gradColors: [string, string];
  barAreaW: number;
}

const BarRow: React.FC<BarRowProps> = ({ cat, score, maxScore, index, gradColors, barAreaW }) => {
  const targetW = (score / maxScore) * barAreaW;
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
        <Svg width={barAreaW} height={ms(18)}>
          <Defs>
            <SvgGrad id={gradId} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={gradColors[0]} />
              <Stop offset="1" stopColor={gradColors[1]} />
            </SvgGrad>
          </Defs>
          <Rect x={0} y={0} width={barAreaW} height={ms(18)} rx={ms(9)}
            fill={withOpacity(gradColors[0], 0.10)} />
          <AnimatedRect x={0} y={0} height={ms(18)} rx={ms(9)}
            fill={`url(#${gradId})`} animatedProps={barProps} />
        </Svg>
      </View>
      <Animated.Text style={[barStyles.score, scoreStyle]}>{score}</Animated.Text>
    </View>
  );
};

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
  const {
    products,
    loading,
    transactions,
    categoryStats,
    scoreDistribution,
    maxCatScore,
    totalProducts,
    highOpp,
    totalSpent,
    donutSegments,
    cx,
    cy,
    BAR_AREA_W,
    openDrawer,
  } = useAnalytics(navigation);

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
            <TouchableOpacity onPress={openDrawer} style={styles.navBtn}>
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
                  barAreaW={BAR_AREA_W}
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
