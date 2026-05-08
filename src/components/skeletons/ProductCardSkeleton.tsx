import React from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, shadow, spacing } from '../../theme/spacing';
import { ms, s, vs } from '../../theme/responsive';
import { SkeletonBox } from './SkeletonBox';

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

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.card,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  middle: { flex: 1, paddingHorizontal: spacing.md, gap: 0 },
  mt6: { marginTop: vs(6) },
  mt4: { marginTop: vs(4) },
  statsRow: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm },
});
