import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AppNotification {
  id: string;
  type: 'trend' | 'price' | 'credit' | 'report';
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
}

const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    type: 'trend',
    title: '🔥 New 10/10 Product Detected',
    body: 'Pet Travel Water Bottle is surging — score jumped to 96/100 this week.',
    createdAt: Date.now() - 1000 * 60 * 30,
    read: false,
  },
  {
    id: 'n2',
    type: 'price',
    title: '📉 Price Drop Alert',
    body: 'Mini Thermal Printer dropped 12% — profit margin now at 68%.',
    createdAt: Date.now() - 1000 * 60 * 120,
    read: false,
  },
  {
    id: 'n3',
    type: 'credit',
    title: '💎 Credits Running Low',
    body: 'You have 2 credits left. Top up to unlock more premium products.',
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    read: false,
  },
  {
    id: 'n4',
    type: 'report',
    title: '📊 Weekly Trend Report Ready',
    body: 'Beauty & Pets are dominating this week. 4 new high-score products added.',
    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    read: true,
  },
  {
    id: 'n5',
    type: 'trend',
    title: '⭐ Watchlist Update',
    body: 'Portable Neck Fan you\'re watching just hit 9/10 — momentum is building.',
    createdAt: Date.now() - 1000 * 60 * 60 * 48,
    read: true,
  },
];

interface NotificationState {
  notifications: AppNotification[];
  markRead: (id: string) => void;
  markAllRead: () => void;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: MOCK_NOTIFICATIONS,

      markRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),

      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),

      unreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    {
      name: '@trendpro/notifications-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ notifications: s.notifications }),
    },
  ),
);
