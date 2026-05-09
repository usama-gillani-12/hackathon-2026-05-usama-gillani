import { useEffect } from 'react';
import { useNotificationStore, AppNotification } from '@core/stores/useNotificationStore';
import { colors } from '@theme/colors';

export const ICON_MAP: Record<AppNotification['type'], { icon: string; color: string; bg: string }> = {
  trend: { icon: 'fire', color: colors.warning, bg: colors.warningSoft },
  price: { icon: 'tag-outline', color: colors.success, bg: colors.successSoft },
  credit: { icon: 'diamond-outline', color: colors.premium, bg: colors.premiumSoft },
  report: { icon: 'chart-bar', color: colors.accent, bg: colors.accentSoft },
};

export function useNotifications() {
  const notifications = useNotificationStore((s) => s.notifications);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    return () => {
      markAllRead();
    };
  }, []);

  return { notifications, markRead, markAllRead, unreadCount };
}
