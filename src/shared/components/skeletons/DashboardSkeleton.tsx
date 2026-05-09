import React from 'react';
import { View } from 'react-native';
import { radius } from '@theme/spacing';
import { ms, s, vs } from '@theme/responsive';
import { SkeletonBox } from './SkeletonBox';
import { styles } from './DashboardSkeleton.styles';

const MetricCardSkeleton = () => (
  <View style={styles.metricCard}>
    <SkeletonBox width={s(28)} height={vs(28)} borderRadius={radius.md} />
    <SkeletonBox width="60%" height={vs(20)} borderRadius={radius.sm} style={styles.mt8} />
    <SkeletonBox width="80%" height={vs(12)} borderRadius={radius.sm} style={styles.mt4} />
  </View>
);

export const DashboardSkeleton: React.FC = () => (
  <View style={styles.container}>
    {/* Hero */}
    <View style={styles.hero}>
      <SkeletonBox width={s(120)} height={vs(12)} borderRadius={radius.sm} style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
      <SkeletonBox width="70%" height={vs(28)} borderRadius={radius.md} style={[styles.mt8, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
      <SkeletonBox width="50%" height={vs(28)} borderRadius={radius.md} style={[styles.mt4, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
      <View style={styles.creditRow}>
        <SkeletonBox width={s(100)} height={vs(36)} borderRadius={radius.pill} style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
        <SkeletonBox width={s(80)} height={vs(36)} borderRadius={radius.pill} style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
      </View>
    </View>

    {/* Metric grid */}
    <View style={styles.grid}>
      <MetricCardSkeleton />
      <MetricCardSkeleton />
      <MetricCardSkeleton />
      <MetricCardSkeleton />
    </View>

    {/* Opportunity card */}
    <View style={styles.oppCard}>
      <SkeletonBox width={s(80)} height={vs(10)} borderRadius={radius.sm} />
      <View style={styles.oppRow}>
        <SkeletonBox width={ms(56)} height={ms(56)} borderRadius={radius.lg} style={styles.mt8} />
        <View style={styles.oppMiddle}>
          <SkeletonBox width="90%" height={vs(14)} borderRadius={radius.sm} />
          <SkeletonBox width="60%" height={vs(14)} borderRadius={radius.sm} style={styles.mt4} />
          <SkeletonBox width={s(100)} height={vs(12)} borderRadius={radius.sm} style={styles.mt4} />
        </View>
        <SkeletonBox width={ms(48)} height={ms(48)} borderRadius={radius.md} />
      </View>
      <SkeletonBox width="100%" height={vs(40)} borderRadius={radius.lg} style={styles.mt8} />
    </View>
  </View>
);

