import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { colors } from '@theme/colors';
import { ms, s, vs } from '@theme/responsive';
import { styles } from './CustomDrawerContent.styles';
import { useCreditStore } from '@core/stores/useCreditStore';
import { useNotificationStore } from '@core/stores/useNotificationStore';
import { useAuthStore } from '@core/stores/useAuthStore';
import { useSettingsStore } from '@core/stores/useSettingsStore';

interface DrawerItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

const MAIN_ITEMS: DrawerItem[] = [
  { label: 'Home', icon: 'view-dashboard-outline', route: 'MainTabs' },
  { label: 'Trending Products', icon: 'fire', route: 'MainTabs' },
  { label: 'Watchlist', icon: 'star-outline', route: 'MainTabs' },
  { label: 'Buy Credits', icon: 'diamond-outline', route: 'MainTabs' },
];

const SECONDARY_ITEMS: DrawerItem[] = [
  { label: 'Profile', icon: 'account-circle-outline', route: 'Profile' },
  { label: 'Analytics', icon: 'chart-bar', route: 'Analytics' },
  { label: 'Notifications', icon: 'bell-outline', route: 'Notifications' },
];

const BOTTOM_ITEMS: DrawerItem[] = [
  { label: 'Settings', icon: 'cog-outline', route: 'Settings' },
  { label: 'Transactions', icon: 'receipt', route: 'TransactionHistory' },
];

// Width of each segment — half the track. Used to calculate thumb translateX.
const SEGMENT_WIDTH = s(70);

const TAB_ROUTE_MAP: Record<string, string> = {
  'Home': 'Dashboard',
  'Trending Products': 'TrendingProducts',
  'Watchlist': 'Watchlist',
  'Buy Credits': 'BuyCredits',
};

export const CustomDrawerContent: React.FC<DrawerContentComponentProps> = (props) => {
  const { navigation, state } = props;
  const insets = useSafeAreaInsets();
  const balance = useCreditStore((s) => s.balance);
  const unreadCount = useNotificationStore((s) => s.notifications.filter((n) => !n.read).length);
  const { user, signOut } = useAuthStore();
  const paymentMode = useSettingsStore((st) => st.paymentMode);
  const setPaymentMode = useSettingsStore((st) => st.setPaymentMode);
  const [signingOut, setSigningOut] = useState(false);

  const isTestnet = paymentMode === 'testnet';

  // Segmented control thumb: 0 = Demo (left), 1 = Testnet (right)
  const thumbPos = useSharedValue(isTestnet ? 1 : 0);

  useEffect(() => {
    thumbPos.value = withTiming(isTestnet ? 1 : 0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [isTestnet]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbPos.value * SEGMENT_WIDTH }],
  }));

  const selectDemo = () => {
    if (paymentMode !== 'mock') setPaymentMode('mock');
  };

  const selectTestnet = () => {
    if (paymentMode === 'testnet') return;
    Alert.alert(
      'Switch to Base Sepolia?',
      "You'll need a connected wallet with testnet USDC to purchase credits.",
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Switch', onPress: () => setPaymentMode('testnet') },
      ],
    );
  };

  const currentRouteName = state.routes[state.index]?.name;

  // Resolve which bottom-tab is currently focused inside MainTabs so each
  // MAIN item can be independently highlighted rather than all-at-once.
  const mainTabsRoute = state.routes.find((r) => r.name === 'MainTabs');
  const nestedTabState = mainTabsRoute?.state;
  const activeTabName =
    nestedTabState?.routes[nestedTabState.index ?? 0]?.name ?? 'Dashboard';

  const navigateToTab = (tabName: string) => {
    navigation.navigate('MainTabs', { screen: tabName });
    navigation.closeDrawer();
  };

  const navigateTo = (route: string) => {
    navigation.navigate(route as any);
    navigation.closeDrawer();
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setSigningOut(true);
            await signOut();
            setSigningOut(false);
          },
        },
      ],
    );
  };

  const renderItem = (item: DrawerItem, isTab = false) => {
    const badge = item.label === 'Notifications' ? unreadCount : item.badge;
    const isActive = isTab
      ? currentRouteName === 'MainTabs' && activeTabName === TAB_ROUTE_MAP[item.label]
      : currentRouteName === item.route;

    return (
      <TouchableOpacity
        key={item.label}
        style={[styles.navItem, isActive && styles.navItemActive]}
        onPress={() => {
          if (isTab) {
            navigateToTab(TAB_ROUTE_MAP[item.label] ?? 'Dashboard');
          } else {
            navigateTo(item.route);
          }
        }}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name={item.icon}
          size={ms(22)}
          color={isActive ? colors.accent : 'rgba(255,255,255,0.7)'}
        />
        <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
          {item.label}
        </Text>
        {badge != null && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={[colors.heroDark, colors.heroMid]} style={[styles.header, { paddingTop: insets.top + vs(16) }]}>
        <View style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>TP</Text>
          </View>
          <View style={styles.logoInfo}>
            <Text style={styles.appName}>TrendPro</Text>
            {user?.email ? (
              <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
            ) : (
              <Text style={styles.appTagline}>Find winning products first</Text>
            )}
          </View>
        </View>

        {/* Credit balance mini card */}
        <TouchableOpacity
          style={styles.creditCard}
          onPress={() => navigateToTab('BuyCredits')}
          activeOpacity={0.8}
        >
          <View style={styles.creditLeft}>
            <MaterialCommunityIcons name="diamond" size={ms(16)} color={colors.premium} />
            <Text style={styles.creditBalance}>{balance} credits</Text>
          </View>
          <View style={styles.creditBuyRow}>
            <Text style={styles.creditBuyLabel}>Buy more</Text>
            <MaterialCommunityIcons name="chevron-right" size={ms(14)} color="rgba(255,255,255,0.5)" />
          </View>
        </TouchableOpacity>
      </LinearGradient>

      {/* Navigation items */}
      <DrawerContentScrollView
        {...props}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        scrollIndicatorInsets={{ right: 1 }}
      >
        <Text style={styles.sectionLabel}>MAIN</Text>
        {MAIN_ITEMS.map((item) => renderItem(item, true))}

        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>EXPLORE</Text>
        {SECONDARY_ITEMS.map((item) => renderItem(item, false))}

        <View style={styles.divider} />
        {BOTTOM_ITEMS.map((item) => renderItem(item, false))}
      </DrawerContentScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + vs(8) }]}>
        <View style={styles.footerTop}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.7}
            disabled={signingOut}
          >
            {signingOut ? (
              <ActivityIndicator size="small" color={colors.danger} />
            ) : (
              <MaterialCommunityIcons name="logout" size={ms(18)} color={colors.danger} />
            )}
            <Text style={styles.logoutLabel}>
              {signingOut ? 'Signing out…' : 'Sign Out'}
            </Text>
          </TouchableOpacity>
        </View>
        {/* Network mode segmented control */}
        <View style={styles.networkRow}>
          <Text style={styles.networkLabel}>NETWORK</Text>
          <View style={styles.segmentTrack}>
            {/* Sliding thumb */}
            <Animated.View style={[styles.segmentThumb, isTestnet ? styles.segmentThumbTestnet : styles.segmentThumbDemo, thumbStyle]} />
            {/* Demo segment */}
            <TouchableOpacity style={styles.segment} onPress={selectDemo} activeOpacity={0.8}>
              <MaterialCommunityIcons
                name="flask-outline"
                size={ms(13)}
                color={!isTestnet ? colors.heroDark : 'rgba(255,255,255,0.45)'}
              />
              <Text style={[styles.segmentLabel, !isTestnet && styles.segmentLabelActive]}>
                Demo
              </Text>
            </TouchableOpacity>
            {/* Testnet segment */}
            <TouchableOpacity style={styles.segment} onPress={selectTestnet} activeOpacity={0.8}>
              <MaterialCommunityIcons
                name="ethereum"
                size={ms(13)}
                color={isTestnet ? colors.heroDark : 'rgba(255,255,255,0.45)'}
              />
              <Text style={[styles.segmentLabel, isTestnet && styles.segmentLabelActiveTestnet]}>
                Sepolia
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footerBottom}>
          <Text style={styles.versionText}>v1.0.0</Text>
        </View>
      </View>
    </View>
  );
};

