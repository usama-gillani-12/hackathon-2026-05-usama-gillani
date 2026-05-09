import React from 'react';
import { View } from 'react-native';
import { radius } from '@theme/spacing';
import { s, vs } from '@theme/responsive';
import { SkeletonBox } from './SkeletonBox';
import { styles } from './AnalyticsSkeleton.styles';

const ChartBarSkeleton = ({ widthPct }: { widthPct: number }) => (
  <View style={styles.barRow}>
    <SkeletonBox width={s(70)} height={vs(12)} borderRadius={radius.sm} />
    <SkeletonBox width={`${widthPct}%` as any} height={vs(24)} borderRadius={radius.sm} style={styles.bar} />
  </View>
);

export const AnalyticsSkeleton: React.FC = () => (
  <View style={styles.container}>
    {/* Summary cards */}
    <View style={styles.summaryRow}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.summaryCard}>
          <SkeletonBox width={s(28)} height={vs(28)} borderRadius={radius.md} style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
          <SkeletonBox width="70%" height={vs(18)} borderRadius={radius.sm} style={[styles.mt6, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
          <SkeletonBox width="50%" height={vs(12)} borderRadius={radius.sm} style={[styles.mt4, { backgroundColor: 'rgba(255,255,255,0.15)' }]} />
        </View>
      ))}
    </View>

    {/* Bar chart card */}
    <View style={styles.card}>
      <SkeletonBox width={s(140)} height={vs(14)} borderRadius={radius.sm} />
      <SkeletonBox width={s(80)} height={vs(10)} borderRadius={radius.sm} style={styles.mt4} />
      <View style={styles.chartArea}>
        <ChartBarSkeleton widthPct={85} />
        <ChartBarSkeleton widthPct={72} />
        <ChartBarSkeleton widthPct={60} />
        <ChartBarSkeleton widthPct={55} />
        <ChartBarSkeleton widthPct={40} />
      </View>
    </View>

    {/* Column chart card */}
    <View style={styles.card}>
      <SkeletonBox width={s(160)} height={vs(14)} borderRadius={radius.sm} />
      <SkeletonBox width={s(100)} height={vs(10)} borderRadius={radius.sm} style={styles.mt4} />
      <View style={styles.colChart}>
        {[70, 50, 85, 40, 65, 30].map((h, i) => (
          <SkeletonBox key={i} width={s(32)} height={vs(h)} borderRadius={radius.sm} style={styles.col} />
        ))}
      </View>
    </View>
  </View>
);

