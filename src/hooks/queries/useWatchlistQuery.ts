import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  setWatchlistStatus,
} from '@core/services/watchlistService';
import { WatchlistStatus } from '@t/product';
import { queryKeys } from './keys';

export const useWatchlistQuery = () =>
  useQuery({
    queryKey: queryKeys.watchlist,
    queryFn: getWatchlist,
  });

export const useAddToWatchlistMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, status }: { productId: string; status: WatchlistStatus }) =>
      addToWatchlist(productId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.watchlist }),
  });
};

export const useRemoveFromWatchlistMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => removeFromWatchlist(productId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.watchlist }),
  });
};

export const useSetWatchlistStatusMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, status }: { productId: string; status: WatchlistStatus }) =>
      setWatchlistStatus(productId, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.watchlist }),
  });
};
