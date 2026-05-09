import { useCallback, useState } from 'react';
import { useSharedValue, withRepeat, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAccount } from 'wagmi';
import { CREDIT_PACKAGES, getCreditBalance } from '@core/services/creditService';
import { getPaymentService } from '@core/services/paymentService';
import { useSettingsStore } from '@core/stores/useSettingsStore';
import { analytics } from '@core/services/analyticsService';
import { CreditPackage } from '@t/credits';

const ROI_EXAMPLES = [
  { product: 'LED Face Mask', investment: '$12', revenue: '$8,400/mo', margin: '72%' },
  { product: 'Pet Water Fountain', investment: '$12', revenue: '$4,200/mo', margin: '65%' },
  { product: 'Posture Corrector', investment: '$4', revenue: '$2,800/mo', margin: '58%' },
];

export function useBuyCredits() {
  const navigation = useNavigation<any>();
  const { isConnected } = useAccount();
  const [balance, setBalance] = useState(0);
  const [selectedId, setSelectedId] = useState<string>(CREDIT_PACKAGES[1]?.id ?? CREDIT_PACKAGES[0]?.id);
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [roiIndex, setRoiIndex] = useState(0);
  const [tabIndex, setTabIndex] = useState(0); // 0 = packages, 1 = subscription

  const pulseOpacity = useSharedValue(1);
  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulseOpacity.value }));

  const refresh = useCallback(async () => {
    setBalance(await getCreditBalance());
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
      const interval = setInterval(() => {
        setRoiIndex((i) => (i + 1) % ROI_EXAMPLES.length);
      }, 3500);
      return () => clearInterval(interval);
    }, [refresh]),
  );

  const startPulse = () => {
    pulseOpacity.value = withRepeat(withTiming(0.4, { duration: 600 }), -1, true);
  };
  const stopPulse = () => {
    pulseOpacity.value = withTiming(1, { duration: 200 });
  };

  const runPaymentFlow = async (pkg: CreditPackage) => {
    setProcessing(true);
    setPaymentError(null);
    startPulse();
    try {
      const service = getPaymentService();
      const intent = await service.createUsdcPaymentIntent(pkg);
      const result = await service.verifyUsdcPayment(intent.intentId);
      if (result.status === 'failed') {
        setPaymentError('Transaction was rejected on-chain. No credits were charged. Please try again.');
        return;
      }
      const tx = await service.addCredits(pkg, result);
      analytics.creditsPurchased(pkg.id, pkg.credits, pkg.usdcAmount);
      navigation.navigate('PaymentSuccess', { transaction: tx, packageInfo: pkg });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Payment failed. Please try again.';
      setPaymentError(msg);
    } finally {
      setProcessing(false);
      stopPulse();
    }
  };

  const onPay = async () => {
    const pkg = CREDIT_PACKAGES.find((p) => p.id === selectedId);
    if (!pkg) return;
    await runPaymentFlow(pkg);
  };

  const onSubscribe = async () => {
    const subPkg: CreditPackage = {
      id: 'sub-monthly',
      credits: 25,
      usdcAmount: 19,
      label: 'Monthly Pass',
      isSubscription: true,
    };
    await runPaymentFlow(subPkg);
  };

  const selectedPkg = CREDIT_PACKAGES.find((p) => p.id === selectedId);
  const roi = ROI_EXAMPLES[roiIndex];
  const isTestnet = useSettingsStore((s) => s.paymentMode) === 'testnet';
  const payEnabled = isTestnet ? (isConnected && !processing) : !processing;

  return {
    navigation,
    isConnected,
    balance,
    selectedId,
    setSelectedId,
    processing,
    paymentError,
    roiIndex,
    tabIndex,
    setTabIndex,
    pulseStyle,
    onPay,
    onSubscribe,
    selectedPkg,
    roi,
    isTestnet,
    payEnabled,
    CREDIT_PACKAGES,
  };
}
