import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { colors, withOpacity } from '@theme/colors';
import { ms } from '@theme/responsive';

import { BottomTabNavigator } from './BottomTabNavigator';
import { CustomDrawerContent } from '@shared/components/drawer';
import { DrawerParamList } from '@t/navigation';
import { ProfileScreen } from '@features/profile';
import { AnalyticsScreen } from '@features/analytics';
import { NotificationsScreen } from '@features/notifications';
import { SettingsScreen } from '@features/settings';
import { TransactionHistoryScreen } from '@features/credits/transaction-history';
import { InvestorMetricsScreen } from '@features/investor-metrics';

const Drawer = createDrawerNavigator<DrawerParamList>();

// Gold tint at 18% opacity — visible against the dark drawer without overpowering.
const DRAWER_ACTIVE_BG = withOpacity(colors.accent, 0.18);

export const DrawerNavigator: React.FC = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ route }) => ({
        headerShown: false,
        drawerStyle: {
          backgroundColor: colors.heroDark,
          width: 300,
        },
        overlayColor: colors.overlayDark,
        drawerType: 'slide',
        drawerStatusBarAnimation: 'fade',
        swipeEdgeWidth: 50,
        // Active item pill
        drawerActiveBackgroundColor: DRAWER_ACTIVE_BG,
        drawerActiveTintColor: colors.accent,
        // Inactive items must be explicitly transparent so no ghost background leaks through.
        drawerInactiveBackgroundColor: 'transparent',
        drawerInactiveTintColor: colors.textInverse,
        drawerItemStyle: {
          borderRadius: ms(10),
          marginHorizontal: ms(8),
          marginVertical: ms(2),
        },
        drawerLabelStyle: {
          fontSize: ms(14),
          fontWeight: '500',
        },
      })}
    >
      <Drawer.Screen name="MainTabs" component={BottomTabNavigator} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen name="Analytics" component={AnalyticsScreen} />
      <Drawer.Screen name="Notifications" component={NotificationsScreen} />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
      <Drawer.Screen name="InvestorMetrics" component={InvestorMetricsScreen} />
    </Drawer.Navigator>
  );
};
