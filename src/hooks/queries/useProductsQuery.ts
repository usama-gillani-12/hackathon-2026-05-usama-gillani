import { useQuery } from '@tanstack/react-query';
import { loadScoredProducts } from '@core/services/productService';
import { queryKeys } from './keys';

export const useProductsQuery = () =>
  useQuery({
    queryKey: queryKeys.products,
    queryFn: async () => {
      const { products } = await loadScoredProducts();
      return products;
    },
  });
