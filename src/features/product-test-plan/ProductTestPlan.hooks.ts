import { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@t/navigation';
import { findScoredProduct, loadScoredProducts } from '@core/services/productService';
import { buildTestPlan } from '@core/services/scoringService';
import { ProductTestPlan, ScoredProduct } from '@t/product';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductTestPlan'>;

export function useProductTestPlan(route: Props['route']) {
  const { productId } = route.params;
  const [scored, setScored] = useState<ScoredProduct | null>(null);
  const [plan, setPlan] = useState<ProductTestPlan | null>(null);

  useEffect(() => {
    (async () => {
      let s = findScoredProduct(productId);
      if (!s) {
        const { products } = await loadScoredProducts();
        s = products.find((p) => p.product.id === productId);
      }
      if (s) { setScored(s); setPlan(buildTestPlan(s)); }
    })();
  }, [productId]);

  return { scored, plan };
}
