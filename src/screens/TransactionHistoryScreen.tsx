import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { DrawerParamList } from '../types/navigation';
import { ListFooterLoader } from '../components/ListFooterLoader';
import { TransactionCard } from '../components/TransactionCard';
import { ListSkeleton } from '../components/skeletons/ListSkeleton';
import { usePaginatedList } from '../hooks/usePaginatedList';
import { useTransactionsQuery } from '../hooks/queries';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { ms, vs } from '../theme/responsive';

type Props = DrawerScreenProps<DrawerParamList, 'TransactionHistory'>;

export const TransactionHistoryScreen: React.FC<Props> = () => {
  const navigation = useNavigation<any>();
  const { data: transactions = [], isLoading } = useTransactionsQuery();

  const { items: pagedTx, total, hasMore, isLoadingMore, loadMore } = usePaginatedList(transactions, 20);

  const purchases = transactions.filter((t) => t.type === 'purchase');
  const unlocks = transactions.filter((t) => t.type === 'unlock');
  const totalUsdc = purchases.reduce((s, t) => s + t.usdcAmount, 0);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ListSkeleton count={4} />
      </SafeAreaView>
    );
  }

  if (transactions.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.empty}>
          <MaterialCommunityIcons name="receipt" size={ms(56)} color={colors.border} />
          <Text style={styles.emptyTitle}>No transactions yet</Text>
          <Text style={styles.emptySub}>Buy credits or unlock a premium product to see activity here.</Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('BuyCredits')}
            buttonColor={colors.accent}
            style={styles.emptyBtn}
          >
            Buy USDC Credits
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.banner}>
        <View style={styles.bannerItem}>
          <Text style={styles.bannerVal}>{transactions.length}</Text>
          <Text style={styles.bannerLbl}>Total Txns</Text>
        </View>
        <View style={styles.bannerDivider} />
        <View style={styles.bannerItem}>
          <Text style={styles.bannerVal}>{purchases.length}</Text>
          <Text style={styles.bannerLbl}>Purchases</Text>
        </View>
        <View style={styles.bannerDivider} />
        <View style={styles.bannerItem}>
          <Text style={styles.bannerVal}>{unlocks.length}</Text>
          <Text style={styles.bannerLbl}>Unlocks</Text>
        </View>
        <View style={styles.bannerDivider} />
        <View style={styles.bannerItem}>
          <Text style={styles.bannerVal}>${totalUsdc.toFixed(0)}</Text>
          <Text style={styles.bannerLbl}>USDC Spent</Text>
        </View>
      </View>

      <FlatList
        data={pagedTx}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.content}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        renderItem={({ item }) => <TransactionCard tx={item} />}
        ListFooterComponent={
          <ListFooterLoader
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
            total={total}
            shown={pagedTx.length}
            label="transactions"
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  emptyTitle: { fontSize: ms(20), fontWeight: '700', color: colors.primary },
  emptySub: { fontSize: ms(14), color: colors.muted, textAlign: 'center' },
  emptyBtn: { marginTop: spacing.sm, borderRadius: radius.lg },
  banner: {
    flexDirection: 'row', backgroundColor: colors.card,
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  bannerItem: { flex: 1, alignItems: 'center' },
  bannerVal: { fontSize: ms(18), fontWeight: '800', color: colors.primary },
  bannerLbl: { fontSize: ms(10), color: colors.muted, marginTop: vs(1) },
  bannerDivider: { width: 1, backgroundColor: colors.border },
  content: { padding: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxxl },
});
