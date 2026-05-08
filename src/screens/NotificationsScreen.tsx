import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { DrawerParamList } from '../types/navigation';
import { useNotificationStore, AppNotification } from '../stores/useNotificationStore';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';
import { ms, s, vs } from '../theme/responsive';
import { formatDateTime } from '../utils/formatCurrency';

type Props = DrawerScreenProps<DrawerParamList, 'Notifications'>;

const ICON_MAP: Record<AppNotification['type'], { icon: string; color: string; bg: string }> = {
  trend: { icon: 'fire', color: colors.warning, bg: colors.warningSoft },
  price: { icon: 'tag-outline', color: colors.success, bg: colors.successSoft },
  credit: { icon: 'diamond-outline', color: colors.premium, bg: colors.premiumSoft },
  report: { icon: 'chart-bar', color: colors.accent, bg: colors.accentSoft },
};

export const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const notifications = useNotificationStore((s) => s.notifications);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    return () => {
      markAllRead();
    };
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuBtn}>
          <MaterialCommunityIcons name="menu" size={ms(24)} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.screenTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={markAllRead} style={styles.clearBtn}>
          <Text style={styles.clearText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View style={styles.empty}>
            <MaterialCommunityIcons name="bell-sleep-outline" size={ms(48)} color={colors.border} />
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptySub}>No notifications right now.</Text>
          </View>
        ) : (
          notifications.map((n) => {
            const icon = ICON_MAP[n.type];
            return (
              <TouchableOpacity key={n.id} onPress={() => markRead(n.id)} activeOpacity={0.7}>
                <Surface style={[styles.card, !n.read && styles.cardUnread]} elevation={1}>
                  {!n.read && <View style={styles.unreadDot} />}
                  <View style={[styles.iconWrap, { backgroundColor: icon.bg }]}>
                    <MaterialCommunityIcons name={icon.icon} size={ms(20)} color={icon.color} />
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={[styles.cardTitle, !n.read && styles.cardTitleUnread]}>
                      {n.title}
                    </Text>
                    <Text style={styles.cardBody2} numberOfLines={2}>
                      {n.body}
                    </Text>
                    <Text style={styles.cardTime}>{formatDateTime(n.createdAt)}</Text>
                  </View>
                </Surface>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  menuBtn: {
    width: ms(40), height: ms(40),
    borderRadius: radius.md,
    backgroundColor: colors.mutedSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ms(8),
  },
  screenTitle: {
    fontSize: ms(18),
    fontWeight: '700',
    color: colors.primary,
  },
  unreadBadge: {
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: s(8),
    paddingVertical: vs(2),
  },
  unreadBadgeText: {
    color: colors.white,
    fontSize: ms(11),
    fontWeight: '700',
  },
  clearBtn: { paddingVertical: vs(4) },
  clearText: {
    fontSize: ms(12),
    color: colors.accent,
    fontWeight: '600',
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    position: 'relative',
  },
  cardUnread: {
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: `${colors.accent}33`,
  },
  unreadDot: {
    position: 'absolute',
    top: vs(12),
    right: s(12),
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: colors.accent,
  },
  iconWrap: {
    width: ms(44),
    height: ms(44),
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardBody: { flex: 1 },
  cardTitle: {
    fontSize: ms(14),
    fontWeight: '600',
    color: colors.primary,
    marginBottom: vs(4),
  },
  cardTitleUnread: { fontWeight: '700' },
  cardBody2: {
    fontSize: ms(13),
    color: colors.muted,
    lineHeight: ms(18),
    marginBottom: vs(6),
  },
  cardTime: {
    fontSize: ms(11),
    color: colors.muted,
  },
  empty: {
    alignItems: 'center',
    paddingTop: vs(80),
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: ms(18),
    fontWeight: '700',
    color: colors.primary,
  },
  emptySub: {
    fontSize: ms(14),
    color: colors.muted,
  },
});
