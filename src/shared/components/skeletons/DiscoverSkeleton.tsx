import React from 'react';
import { ScrollView, View } from 'react-native';
import { spacing } from '@theme/spacing';
import { s, vs } from '@theme/responsive';
import { SkeletonBox } from './SkeletonBox';
import { ProductCardSkeleton } from './ProductCardSkeleton';

export const DiscoverSkeleton: React.FC = () => (
  <View style={{ flex: 1 }}>
    {/* Category chip strip */}
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: spacing.lg,
        paddingVertical: vs(10),
        gap: s(8),
        alignItems: 'center',
      }}
      pointerEvents="none"
    >
      {[80, 100, 70, 90, 60, 110, 75].map((w, i) => (
        <SkeletonBox key={i} width={s(w)} height={vs(36)} borderRadius={999} />
      ))}
    </ScrollView>

    {/* Banner */}
    <View style={{ paddingHorizontal: spacing.lg, marginBottom: vs(14) }}>
      <SkeletonBox height={vs(72)} borderRadius={16} />
    </View>

    {/* Product cards */}
    <View style={{ paddingHorizontal: spacing.lg }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </View>
  </View>
);
