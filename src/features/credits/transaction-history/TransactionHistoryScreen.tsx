import React from 'react';
import { FlatList, View } from 'react-native';
import { Text, Surface, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { DrawerParamList } from '@t/navigation';
import { ListFooterLoader } from '@shared/components/list-footer-loader';
import { TransactionCard } from '@shared/components/transaction-card';
import { ListSkeleton } from '@shared/components/skeletons';
import { colors } from '@theme/colors';
import { ms } from '@theme/responsive';
import { useTransactionHistory } from './TransactionHistory.hooks';
import { styles } from './TransactionHistory.styles';

type Props = DrawerScreenProps<DrawerParamList, 'TransactionHistory'>;

export const TransactionHistoryScreen: React.FC<Props> = () => {
  const {
    transactions,
    isLoading,
    pagedTx,
    total,
    hasMore,
    isLoadingMore,
    loadMore,
    purchases,
    unlocks,
    totalUsdc,
    goToBuyCredits,
  } = useTransactionHistory();

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
            onPress={goToBuyCredits}
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
