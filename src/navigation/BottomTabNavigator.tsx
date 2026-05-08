import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { DashboardScreen } from '../screens/DashboardScreen';
import { TrendingProductsScreen } from '../screens/TrendingProductsScreen';
import { DiscoverScreen } from '../screens/DiscoverScreen';
import { WatchlistScreen } from '../screens/WatchlistScreen';
import { BuyCreditsScreen } from '../screens/BuyCreditsScreen';
import { BottomTabParamList } from '../types/navigation';
import { colors } from '../theme/colors';
import { useCreditStore } from '../stores/useCreditStore';

const Tab = createBottomTabNavigator<BottomTabParamList>();

type IconName = string;

const TAB_ICONS: Record<string, { active: IconName; inactive: IconName }> = {
  Dashboard: { active: 'view-dashboard', inactive: 'view-dashboard-outline' },
  TrendingProducts: { active: 'fire', inactive: 'fire' },
  Discover: { active: 'compass', inactive: 'compass-outline' },
  Watchlist: { active: 'star', inactive: 'star-outline' },
  BuyCredits: { active: 'diamond', inactive: 'diamond-outline' },
};

const TAB_LABELS: Record<string, string> = {
  Dashboard: 'Home',
  TrendingProducts: 'Trending',
  Discover: 'Discover',
  Watchlist: 'Watchlist',
  BuyCredits: 'Credits',
};

export const BottomTabNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const balance = useCreditStore((s) => s.balance);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          elevation: 20,
          shadowColor: colors.black,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.12,
          shadowRadius: 20,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 4,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons?.active : icons?.inactive;
          return (
            <MaterialCommunityIcons
              name={iconName ?? 'circle'}
              size={size}
              color={color}
            />
          );
        },
        tabBarLabel: ({ focused, color }) => (
          <Text
            style={{
              fontSize: 11,
              fontWeight: focused ? '700' : '500',
              color,
              marginBottom: 4,
            }}
          >
            {TAB_LABELS[route.name]}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="TrendingProducts" component={TrendingProductsScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Watchlist" component={WatchlistScreen} />
      <Tab.Screen
        name="BuyCredits"
        component={BuyCreditsScreen}
        options={{
          tabBarBadge: balance > 0 ? balance : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.premium,
            color: colors.white,
            fontSize: 10,
            fontWeight: '700',
          },
        }}
      />
    </Tab.Navigator>
  );
};
