import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
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

import { colors, withOpacity } from '../../theme/colors';
import { ms, s, vs } from '../../theme/responsive';
import { useCreditStore } from '../../stores/useCreditStore';
import { useNotificationStore } from '../../stores/useNotificationStore';
import { useAuthStore } from '../../stores/useAuthStore';
import { useSettingsStore } from '../../stores/useSettingsStore';

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.heroDark,
  },
  header: {
    paddingHorizontal: s(20),
    paddingBottom: vs(20),
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: vs(16),
  },
  logoCircle: {
    width: ms(44),
    height: ms(44),
    borderRadius: ms(12),
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: s(12),
  },
  logoText: {
    color: colors.white,
    fontSize: ms(16),
    fontWeight: '800',
  },
  logoInfo: {
    flex: 1,
  },
  appName: {
    color: colors.white,
    fontSize: ms(20),
    fontWeight: '800',
    letterSpacing: ms(-0.5),
  },
  appTagline: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: ms(11),
    marginTop: vs(1),
  },
  userEmail: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: ms(11),
    marginTop: vs(1),
  },
  creditCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: ms(12),
    paddingHorizontal: s(14),
    paddingVertical: vs(10),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  creditLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(8),
  },
  creditBalance: {
    color: colors.white,
    fontSize: ms(14),
    fontWeight: '700',
  },
  creditBuyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(2),
  },
  creditBuyLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: ms(12),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: vs(16),
    paddingBottom: vs(8),
  },
  sectionLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: ms(10),
    fontWeight: '700',
    letterSpacing: ms(1.5),
    paddingHorizontal: s(20),
    marginBottom: vs(4),
    marginTop: vs(4),
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(20),
    paddingVertical: vs(12),
    marginHorizontal: s(8),
    borderRadius: ms(10),
    gap: ms(12),
  },
  navItemActive: {
    // Gold at 18% on the dark drawer — visible without washing out the text.
    backgroundColor: withOpacity(colors.accent, 0.18),
    borderWidth: 1,
    borderColor: withOpacity(colors.accent, 0.30),
  },
  navLabel: {
    flex: 1,
    color: 'rgba(255,255,255,0.65)',
    fontSize: ms(14),
    fontWeight: '500',
  },
  navLabelActive: {
    // Gold label on dark bg — high contrast, matches the icon tint.
    color: colors.accent,
    fontWeight: '700',
  },
  badge: {
    backgroundColor: colors.premium,
    borderRadius: ms(10),
    minWidth: ms(20),
    height: ms(20),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: s(6),
  },
  badgeText: {
    color: colors.white,
    fontSize: ms(10),
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: s(20),
    marginVertical: vs(12),
  },
  footer: {
    paddingHorizontal: s(20),
    paddingTop: vs(12),
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  footerTop: {
    marginBottom: vs(12),
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(10),
    paddingVertical: vs(10),
    paddingHorizontal: s(12),
    borderRadius: ms(10),
    backgroundColor: colors.dangerSubtle,
    borderWidth: 1,
    borderColor: colors.dangerSoft,
  },
  logoutLabel: {
    color: colors.danger,
    fontSize: ms(14),
    fontWeight: '600',
  },
  networkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: vs(10),
  },
  networkLabel: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: ms(10),
    fontWeight: '700',
    letterSpacing: ms(1.2),
  },
  segmentTrack: {
    flexDirection: 'row',
    width: SEGMENT_WIDTH * 2,
    height: vs(30),
    borderRadius: ms(8),
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    position: 'relative',
  },
  segmentThumb: {
    position: 'absolute',
    width: SEGMENT_WIDTH,
    height: '100%',
    borderRadius: ms(7),
  },
  segmentThumbDemo: {
    backgroundColor: colors.premium,
  },
  segmentThumbTestnet: {
    backgroundColor: colors.accent,
  },
  segment: {
    width: SEGMENT_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: ms(4),
    zIndex: 1,
  },
  segmentLabel: {
    fontSize: ms(11),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.45)',
  },
  segmentLabelActive: {
    color: colors.heroDark,
  },
  segmentLabelActiveTestnet: {
    color: colors.heroDark,
  },
  footerBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  versionText: {
    color: 'rgba(255,255,255,0.25)',
    fontSize: ms(11),
  },
});
