import { useQuery } from '@tanstack/react-query';
import { getTransactions } from '../../services/creditService';
import { queryKeys } from './keys';

export const useTransactionsQuery = () =>
  useQuery({
    queryKey: queryKeys.transactions,
    queryFn: getTransactions,
  });
