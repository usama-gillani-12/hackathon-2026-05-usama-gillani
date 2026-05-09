import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { DrawerParamList } from '@t/navigation';
import { colors } from '@theme/colors';
import { ms } from '@theme/responsive';
import { formatDateTime } from '@utils/formatCurrency';
import { useNotifications, ICON_MAP } from './Notifications.hooks';
import { styles } from './Notifications.styles';

type Props = DrawerScreenProps<DrawerParamList, 'Notifications'>;

export const NotificationsScreen: React.FC<Props> = ({ navigation }) => {
  const { notifications, markRead, markAllRead, unreadCount } = useNotifications();

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
