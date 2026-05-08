import React from 'react';
import { View } from 'react-native';
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
import { shadow } from '../theme/spacing';
import { ms } from '../theme/responsive';
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
          borderTopWidth: 0,
          height: 64 + insets.bottom,
          paddingBottom: insets.bottom,
          ...shadow.tabBar,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: {
          fontSize: ms(10),
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
              fontSize: ms(10),
              fontWeight: focused ? '700' : '400',
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
