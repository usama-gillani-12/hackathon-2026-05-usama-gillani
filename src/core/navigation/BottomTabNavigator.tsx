import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { DashboardScreen } from '@features/dashboard';
import { TrendingProductsScreen } from '@features/trending';
import { DiscoverScreen } from '@features/discover';
import { WatchlistScreen } from '@features/watchlist';
import { BuyCreditsScreen } from '@features/credits/buy-credits';
import { BottomTabParamList } from '@t/navigation';
import { CustomTabBar } from './CustomTabBar';

const Tab = createBottomTabNavigator<BottomTabParamList>();

export const BottomTabNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false }}
    tabBar={(props) => <CustomTabBar {...props} />}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="TrendingProducts" component={TrendingProductsScreen} />
    <Tab.Screen name="Discover" component={DiscoverScreen} />
    <Tab.Screen name="Watchlist" component={WatchlistScreen} />
    <Tab.Screen name="BuyCredits" component={BuyCreditsScreen} />
  </Tab.Navigator>
);
