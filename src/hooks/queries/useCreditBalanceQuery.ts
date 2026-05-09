import { useQuery } from '@tanstack/react-query';
import { getCreditBalance } from '@core/services/creditService';
import { queryKeys } from './keys';

export const useCreditBalanceQuery = () =>
  useQuery({
    queryKey: queryKeys.creditBalance,
    queryFn: getCreditBalance,
    staleTime: 0,
  });
