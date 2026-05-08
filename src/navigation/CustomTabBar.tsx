import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'react-native-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, gradients } from '../theme/colors';
import { radius, shadow } from '../theme/spacing';
import { ms, vs } from '../theme/responsive';
import { hapticLight } from '../utils/haptics';
import { useCreditStore } from '../stores/useCreditStore';
import { AppText } from '../components/AppText';

const { width: SCREEN_W } = Dimensions.get('window');

const TAB_ICONS: Record<string, { active: string; inactive: string }> = {
  Dashboard:        { active: 'view-dashboard',  inactive: 'view-dashboard-outline' },
  TrendingProducts: { active: 'fire',             inactive: 'fire' },
  Discover:         { active: 'compass',          inactive: 'compass-outline' },
  Watchlist:        { active: 'star',             inactive: 'star-outline' },
  BuyCredits:       { active: 'diamond-stone',    inactive: 'diamond-outline' },
};

const TAB_LABELS: Record<string, string> = {
  Dashboard:        'Home',
  TrendingProducts: 'Trending',
  Discover:         'Discover',
  Watchlist:        'Watchlist',
  BuyCredits:       'Credits',
};

const UNDERLINE_WIDTH = ms(28);
const UNDERLINE_HEIGHT = vs(3);

export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const balance = useCreditStore((s) => s.balance);

  const tabCount = state.routes.length;
  const tabWidth = SCREEN_W / tabCount;

  // Sliding underline
  const underlineX = useSharedValue(
    state.index * tabWidth + (tabWidth - UNDERLINE_WIDTH) / 2,
  );

  useEffect(() => {
    underlineX.value = withSpring(
      state.index * tabWidth + (tabWidth - UNDERLINE_WIDTH) / 2,
      { damping: 18, stiffness: 220, mass: 0.7 },
    );
  }, [state.index, tabWidth]);

  const underlineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: underlineX.value }],
  }));

  return (
    <View style={[styles.wrap, { paddingBottom: insets.bottom, height: vs(60) + insets.bottom }]}>
      {/* Top hairline */}
      <View style={styles.hairline} />

      {/* Sliding gold underline (under whichever tab is active) */}
      <Animated.View style={[styles.underline, underlineStyle]}>
        <LinearGradient
          colors={gradients.premium}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.underlineFill}
        />
      </Animated.View>

      {/* Tab cells */}
      <View style={styles.tabsRow}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons?.active : icons?.inactive;
          const label = TAB_LABELS[route.name] ?? route.name;
          const showBadge = route.name === 'BuyCredits' && balance > 0;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              hapticLight();
              navigation.navigate(route.name as never);
            }
          };

          return (
            <TabCell
              key={route.key}
              focused={focused}
              iconName={iconName ?? 'circle'}
              label={label}
              onPress={onPress}
              showBadge={showBadge}
              badgeValue={balance}
              width={tabWidth}
            />
          );
        })}
      </View>
    </View>
  );
};

interface CellProps {
  focused: boolean;
  iconName: string;
  label: string;
  onPress: () => void;
  showBadge: boolean;
  badgeValue: number;
  width: number;
}

const TabCell: React.FC<CellProps> = ({
  focused, iconName, label, onPress, showBadge, badgeValue, width,
}) => {
  const iconScale = useSharedValue(focused ? 1.1 : 1);

  useEffect(() => {
    if (focused) {
      iconScale.value = withSequence(
        withTiming(1.22, { duration: 130 }),
        withSpring(1.1, { damping: 12, stiffness: 220 }),
      );
    } else {
      iconScale.value = withTiming(1, { duration: 180 });
    }
  }, [focused]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.cell, { width }]}
    >
      <View style={styles.iconWrap}>
        <Animated.View style={iconStyle}>
          <MaterialCommunityIcons
            name={iconName}
            size={ms(22)}
            color={focused ? colors.accent : colors.textCaption}
          />
        </Animated.View>
        {showBadge && (
          <View style={styles.badge}>
            <AppText
              variant="caption2"
              color={colors.white}
              tabular
              style={styles.badgeText}
            >
              {badgeValue > 99 ? '99+' : badgeValue}
            </AppText>
          </View>
        )}
      </View>
      <AppText
        variant="caption2"
        color={focused ? colors.accent : colors.textCaption}
        style={[styles.label, focused && styles.labelActive]}
      >
        {label}
      </AppText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.card,
    paddingTop: vs(6),
    ...shadow.tabBar,
  },
  hairline: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  underline: {
    position: 'absolute',
    top: vs(6),
    width: UNDERLINE_WIDTH,
    height: UNDERLINE_HEIGHT,
    borderRadius: radius.pill,
    overflow: 'hidden',
    ...shadow.sm,
    shadowColor: colors.premium,
  },
  underlineFill: { flex: 1 },

  tabsRow: { flexDirection: 'row' },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: vs(8),
    paddingBottom: vs(4),
    gap: vs(4),
  },
  iconWrap: { position: 'relative' },
  label: {
    fontWeight: '600',
    letterSpacing: ms(0.2),
  },
  labelActive: {
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    top: -ms(6),
    right: -ms(10),
    minWidth: ms(16),
    height: ms(16),
    borderRadius: ms(8),
    backgroundColor: colors.premium,
    paddingHorizontal: ms(4),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.card,
  },
  badgeText: { fontWeight: '700', fontSize: ms(9), lineHeight: ms(11) },
});
