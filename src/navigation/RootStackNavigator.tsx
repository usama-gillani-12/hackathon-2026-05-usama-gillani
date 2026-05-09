import React from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DrawerNavigator } from './DrawerNavigator';
import { NetworkModeBanner } from '../components/NetworkModeBanner';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { ScoreBreakdownScreen } from '../screens/ScoreBreakdownScreen';
import { CompareProductsScreen } from '../screens/CompareProductsScreen';
import { ProductTestPlanScreen } from '../screens/ProductTestPlanScreen';
import { PaymentSuccessScreen } from '../screens/PaymentSuccessScreen';
import { RootStackParamList } from '../types/navigation';
import { colors } from '../theme/colors';

const DrawerRoot = () => {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <NetworkModeBanner />
      <DrawerNavigator />
    </View>
  );
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.card },
        headerTitleStyle: { color: colors.primary, fontWeight: '700' },
        headerTintColor: colors.accent,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="DrawerRoot"
        component={DrawerRoot}
        options={{ headerShown: false, title: 'Home' }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={ProductDetailScreen}
        options={{ title: 'Product Insight' }}
      />
      <Stack.Screen
        name="ScoreBreakdown"
        component={ScoreBreakdownScreen}
        options={{ title: 'Score Breakdown' }}
      />
      <Stack.Screen
        name="CompareProducts"
        component={CompareProductsScreen}
        options={{ title: 'Compare Products' }}
      />
      <Stack.Screen
        name="ProductTestPlan"
        component={ProductTestPlanScreen}
        options={{ title: 'Test Plan' }}
      />
      <Stack.Screen
        name="PaymentSuccess"
        component={PaymentSuccessScreen}
        options={{
          title: 'Payment Successful',
          headerBackVisible: false,
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
};
