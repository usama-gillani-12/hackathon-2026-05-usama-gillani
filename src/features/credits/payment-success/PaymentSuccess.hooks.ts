import { useEffect } from 'react';
import { Linking } from 'react-native';
import { useSharedValue, withSpring, useAnimatedStyle } from 'react-native-reanimated';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@t/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentSuccess'>;

export function usePaymentSuccess(navigation: Props['navigation'], route: Props['route']) {
  const { transaction, packageInfo } = route.params;

  const scale = useSharedValue(0);
  const checkStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  useEffect(() => {
    scale.value = withSpring(1, { damping: 10, stiffness: 180 });
  }, []);

  const goHome = () => {
    navigation.popToTop();
  };

  const goTransactions = () => {
    navigation.popToTop();
    setTimeout(() => navigation.navigate('DrawerRoot', { screen: 'TransactionHistory' } as any), 100);
  };

  const openExplorer = () =>
    Linking.openURL(`https://sepolia.basescan.org/tx/${transaction.txHash}`);

  return { transaction, packageInfo, checkStyle, goHome, goTransactions, openExplorer };
}
