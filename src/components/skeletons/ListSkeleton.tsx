import React from 'react';
import { View } from 'react-native';
import { spacing } from '../../theme/spacing';
import { ProductCardSkeleton } from './ProductCardSkeleton';

interface Props {
  count?: number;
}

export const ListSkeleton: React.FC<Props> = ({ count = 5 }) => (
  <View style={{ padding: spacing.lg }}>
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </View>
);
