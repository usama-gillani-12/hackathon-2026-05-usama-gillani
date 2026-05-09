import React, { useEffect } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
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
import { colors, gradients } from '@theme/colors';
import { radius, shadow, spacing } from '@theme/spacing';
import { ms, vs } from '@theme/responsive';
import { hapticLight } from '@utils/haptics';
import { useCreditStore } from '@core/stores/useCreditStore';
import { AppText } from '@shared/components/app-text';

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

const BAR_HEIGHT = vs(62);
const ELEVATED_SIZE = ms(56);
const ELEVATED_LIFT = ms(7);

export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const balance = useCreditStore((s) => s.balance);

  const centerIndex = Math.floor(state.routes.length / 2);

  return (
    <View
      style={[
        styles.outer,
        { paddingBottom: Math.max(insets.bottom, vs(10)) },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons?.active : icons?.inactive;
          const label = TAB_LABELS[route.name] ?? route.name;
          const showBadge = route.name === 'BuyCredits' && balance > 0;
          const isCenter = index === centerIndex;

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
              isCenter={isCenter}
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
  isCenter: boolean;
}

const TabCell: React.FC<CellProps> = ({
  focused, iconName, label, onPress, showBadge, badgeValue, isCenter,
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

  if (isCenter) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={styles.cellCenter}
      >
        <Animated.View style={[styles.elevatedBubble, iconStyle]}>
          <LinearGradient
            colors={gradients.premium}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <MaterialCommunityIcons
            name={iconName}
            size={ms(26)}
            color={colors.white}
          />
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.cell}
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
  outer: {
    paddingHorizontal: spacing.lg,
    paddingTop: vs(8),
    backgroundColor: 'transparent',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: BAR_HEIGHT,
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    ...shadow.tabBar,
  },

  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: vs(3),
    paddingVertical: vs(6),
  },
  cellCenter: {
    flex: 1,
    height: BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },

  elevatedBubble: {
    marginTop: -ELEVATED_LIFT,
    width: ELEVATED_SIZE,
    height: ELEVATED_SIZE,
    borderRadius: ELEVATED_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: ms(3),
    borderColor: colors.card,
    ...shadow.lg,
    shadowColor: colors.premium,
  },

  iconWrap: { position: 'relative' },
  label: {
    fontWeight: '600',
    letterSpacing: ms(0.2),
    fontSize: ms(10),
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
