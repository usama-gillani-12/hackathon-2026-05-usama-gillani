import React, { useEffect, useState } from 'react';
import {
  Alert, NativeScrollEvent, NativeSyntheticEvent, Share,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@t/navigation';
import { findScoredProduct, loadScoredProducts } from '@core/services/productService';
import { generateProductInsights, generateAdCopy, GeminiInsights } from '@core/services/geminiService';
import { generateTxHash } from '@utils/generateTxHash';
import { useCreditStore } from '@core/stores/useCreditStore';
import { AD_COPY_COST } from '@constants';
import { AdCopyResult } from '@t/adCopy';
import {
  useUnlockedQuery,
  useUnlockProductMutation,
  useWatchlistQuery,
  useAddToWatchlistMutation,
  useRemoveFromWatchlistMutation,
  useCreditBalanceQuery,
  queryKeys,
} from '@hooks/queries';
import { ScoredProduct } from '@t/product';
import { hapticLight, hapticMedium, hapticSuccess, hapticWarning } from '@utils/haptics';
import { analytics } from '@core/services/analyticsService';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductDetail'>;

export function useProductDetail({ navigation, route }: Pick<Props, 'navigation' | 'route'>) {
  const { width } = useWindowDimensions();
  const { productId } = route.params;
  const qc = useQueryClient();
  const insets = useSafeAreaInsets();

  const [scored, setScored] = useState<ScoredProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<GeminiInsights | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [adCopy, setAdCopy] = useState<AdCopyResult | null>(null);
  const [isGeneratingAdCopy, setIsGeneratingAdCopy] = useState(false);
  const [adCopyError, setAdCopyError] = useState<string | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const { data: unlockedSet = new Set<string>() } = useUnlockedQuery();
  const { data: watchlistItems = [] } = useWatchlistQuery();
  const { data: credits = 0 } = useCreditBalanceQuery();
  const spendCredits = useCreditStore((s) => s.spendCredits);
  const recordTransaction = useCreditStore((s) => s.recordTransaction);

  const unlockMutation = useUnlockProductMutation();
  const addToWatchlistMutation = useAddToWatchlistMutation();
  const removeFromWatchlistMutation = useRemoveFromWatchlistMutation();

  const isUnlocked = unlockedSet.has(productId);
  const inWatchlist = watchlistItems.some((w) => w.productId === productId);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;
      (async () => {
        setLoading(true);
        const cached = findScoredProduct(productId);
        if (cached) {
          if (active) {
            setScored(cached);
            setLoading(false);
            analytics.productViewed(cached.product.id, cached.product.title, cached.winningScore);
          }
          return;
        }
        const { products } = await loadScoredProducts();
        if (active) {
          const found = products.find((p) => p.product.id === productId) ?? null;
          setScored(found);
          setLoading(false);
          if (found) {
            analytics.productViewed(found.product.id, found.product.title, found.winningScore);
          }
        }
      })();
      return () => { active = false; };
    }, [productId]),
  );

  useEffect(() => {
    if (!scored || aiInsights) return;
    let active = true;
    setAiLoading(true);
    generateProductInsights(scored).then((insights) => {
      if (active && insights) setAiInsights(insights);
      if (active) setAiLoading(false);
    });
    return () => { active = false; };
  }, [scored]);

  const onUnlock = () => {
    if (!scored) return;
    hapticMedium();
    unlockMutation.mutate(
      { productId: scored.product.id, productTitle: scored.product.title, cost: scored.unlockCost },
      {
        onError: (_, vars) => {
          hapticWarning();
          Alert.alert('Not enough credits', `You need ${vars.cost} credits but have ${credits}.`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Buy Credits', onPress: () => navigation.navigate('BuyCredits' as any) },
          ]);
        },
        onSuccess: (_, vars) => {
          hapticSuccess();
          qc.invalidateQueries({ queryKey: queryKeys.creditBalance });
          analytics.productUnlocked(vars.productId, vars.productTitle, vars.cost);
        },
      },
    );
  };

  const toggleWatchlist = () => {
    if (!scored) return;
    hapticLight();
    if (inWatchlist) {
      removeFromWatchlistMutation.mutate(scored.product.id);
    } else {
      addToWatchlistMutation.mutate({ productId: scored.product.id, status: 'Watching' });
    }
  };

  const handleShareProduct = async () => {
    if (!scored) return;
    hapticLight();
    try {
      await Share.share({
        message: `${scored.product.title} — Score ${scored.winningScore}/100 on TrendPro`,
        title: scored.product.title,
      });
    } catch { /* user cancelled */ }
  };

  const handleBackPress = () => {
    hapticLight();
    navigation.goBack();
  };

  const onCarouselScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== carouselIndex) setCarouselIndex(i);
  };

  const handleGenerateAdCopy = async () => {
    if (!scored || credits < AD_COPY_COST) return;
    setIsGeneratingAdCopy(true);
    setAdCopyError(null);

    // generateAdCopy always returns a result (Gemini or smart fallback)
    const result = await generateAdCopy(scored);

    // Deduct the credit — generation always succeeds now
    const ok = await spendCredits(AD_COPY_COST);
    if (!ok) {
      setAdCopyError('insufficient-credits');
      setIsGeneratingAdCopy(false);
      return;
    }

    // Record the spend — matches unlockService.ts pattern (usdcAmount:0, network:'mock')
    const txHash = generateTxHash();
    await recordTransaction({
      id: txHash,
      type: 'unlock',
      credits: -AD_COPY_COST,
      usdcAmount: 0,
      txHash,
      status: 'confirmed',
      createdAt: Date.now(),
      productId: scored.product.id,
      productTitle: scored.product.title,
      network: 'mock',
    });

    // Refresh credit balance badge in tab bar and this screen
    qc.invalidateQueries({ queryKey: queryKeys.creditBalance });

    setAdCopy(result);
    setIsGeneratingAdCopy(false);
  };

  return {
    // dimensions / layout
    width,
    insets,
    // product data
    scored,
    loading,
    productId,
    // ai
    aiInsights,
    aiLoading,
    // ad copy
    adCopy,
    setAdCopy,
    isGeneratingAdCopy,
    setIsGeneratingAdCopy,
    adCopyError,
    setAdCopyError,
    // carousel
    carouselIndex,
    // credits
    credits,
    // watchlist / unlock state
    isUnlocked,
    inWatchlist,
    unlockMutation,
    // handlers
    onUnlock,
    toggleWatchlist,
    handleShareProduct,
    handleBackPress,
    onCarouselScroll,
    handleGenerateAdCopy,
  };
}
