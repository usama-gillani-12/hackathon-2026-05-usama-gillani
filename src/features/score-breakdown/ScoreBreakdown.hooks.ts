import { useEffect, useState } from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@t/navigation';
import { findScoredProduct, loadScoredProducts } from '@core/services/productService';
import { colors } from '@theme/colors';
import { ScoredProduct } from '@t/product';

type Props = NativeStackScreenProps<RootStackParamList, 'ScoreBreakdown'>;

export const RECOMMENDATION_INFO = {
  'Test Now': { icon: 'rocket-launch', color: colors.success, message: 'Move fast — fundamentals are strong across demand and margin.' },
  'Watch Closely': { icon: 'eye-outline', color: colors.warning, message: 'Strong signals but worth one more validation pass before scaling.' },
  'Research More': { icon: 'magnify', color: colors.accent, message: 'Mixed signals — consider sourcing or audience tweaks.' },
  'Avoid for Now': { icon: 'close-circle-outline', color: colors.danger, message: 'High risk for the expected return — likely better options elsewhere.' },
};

export function useScoreBreakdown(route: Props['route']) {
  const { productId } = route.params;
  const [scored, setScored] = useState<ScoredProduct | null>(null);

  useEffect(() => {
    (async () => {
      const cached = findScoredProduct(productId);
      if (cached) { setScored(cached); return; }
      const { products } = await loadScoredProducts();
      setScored(products.find((p) => p.product.id === productId) ?? products[0] ?? null);
    })();
  }, [productId]);

  const recInfo = scored ? RECOMMENDATION_INFO[scored.recommendation] : null;

  return { scored, recInfo };
}
