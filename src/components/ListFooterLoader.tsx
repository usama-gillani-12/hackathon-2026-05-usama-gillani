import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { colors } from '../theme/colors';
import { ms, vs } from '../theme/responsive';

interface Props {
  isLoadingMore: boolean;
  hasMore: boolean;
  total: number;
  shown: number;
  label?: string;
}

export const ListFooterLoader: React.FC<Props> = ({
  isLoadingMore,
  hasMore,
  total,
  shown,
  label = 'items',
}) => {
  if (isLoadingMore) {
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.accent} />
      </View>
    );
  }
  if (!hasMore && total > 0) {
    return (
      <View style={styles.footer}>
        <Text style={styles.allText}>All {total} {label} shown</Text>
      </View>
    );
  }
  return null;
};

const styles = StyleSheet.create({
  footer: {
    paddingVertical: vs(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  allText: {
    fontSize: ms(12),
    color: colors.muted,
    fontWeight: '500',
  },
});
