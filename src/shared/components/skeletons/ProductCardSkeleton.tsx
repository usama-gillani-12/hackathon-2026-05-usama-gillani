import React from 'react';
import { View } from 'react-native';
import { radius } from '@theme/spacing';
import { ms, s, vs } from '@theme/responsive';
import { SkeletonBox } from './SkeletonBox';
import { styles } from './ProductCardSkeleton.styles';

export const ProductCardSkeleton: React.FC = () => (
  <View style={styles.card}>
    <View style={styles.row}>
      <SkeletonBox width={ms(70)} height={ms(70)} borderRadius={radius.lg} />
      <View style={styles.middle}>
        <SkeletonBox width={s(60)} height={vs(10)} borderRadius={radius.sm} />
        <SkeletonBox width="90%" height={vs(14)} borderRadius={radius.sm} style={styles.mt6} />
        <SkeletonBox width="70%" height={vs(14)} borderRadius={radius.sm} style={styles.mt4} />
        <View style={styles.statsRow}>
          <SkeletonBox width={s(60)} height={vs(10)} borderRadius={radius.sm} />
          <SkeletonBox width={s(60)} height={vs(10)} borderRadius={radius.sm} />
        </View>
      </View>
      <SkeletonBox width={ms(52)} height={ms(52)} borderRadius={radius.lg} />
    </View>
  </View>
);

