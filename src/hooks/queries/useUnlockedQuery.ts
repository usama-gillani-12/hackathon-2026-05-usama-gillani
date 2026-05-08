import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUnlockedIdSet, unlockProduct } from '../../services/unlockService';
import { queryKeys } from './keys';

export const useUnlockedQuery = () =>
  useQuery({
    queryKey: queryKeys.unlockedIds,
    queryFn: getUnlockedIdSet,
  });

export const useUnlockProductMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: unlockProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.unlockedIds });
      qc.invalidateQueries({ queryKey: queryKeys.creditBalance });
    },
  });
};
