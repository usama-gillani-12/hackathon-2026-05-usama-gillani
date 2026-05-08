import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { DashboardScreen } from '../screens/DashboardScreen';
import { TrendingProductsScreen } from '../screens/TrendingProductsScreen';
import { DiscoverScreen } from '../screens/DiscoverScreen';
import { WatchlistScreen } from '../screens/WatchlistScreen';
import { BuyCreditsScreen } from '../screens/BuyCreditsScreen';
import { BottomTabParamList } from '../types/navigation';
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
