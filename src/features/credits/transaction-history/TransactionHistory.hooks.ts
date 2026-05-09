import { useNavigation } from '@react-navigation/native';
import { usePaginatedList } from '@hooks/usePaginatedList';
import { useTransactionsQuery } from '@hooks/queries';

export function useTransactionHistory() {
  const navigation = useNavigation<any>();
  const { data: transactions = [], isLoading } = useTransactionsQuery();

  const { items: pagedTx, total, hasMore, isLoadingMore, loadMore } = usePaginatedList(transactions, 20);

  const purchases = transactions.filter((t) => t.type === 'purchase');
  const unlocks = transactions.filter((t) => t.type === 'unlock');
  const totalUsdc = purchases.reduce((s, t) => s + t.usdcAmount, 0);

  const goToBuyCredits = () => navigation.navigate('BuyCredits');

  return {
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
  };
}
