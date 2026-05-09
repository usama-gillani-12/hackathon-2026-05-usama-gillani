import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WatchlistItem, WatchlistStatus } from '@t/product';
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  setWatchlistStatus,
  clearWatchlist,
} from '@core/services/watchlistService';
import { analytics } from '@core/services/analyticsService';

interface WatchlistState {
  items: WatchlistItem[];
  hydrated: boolean;
  initialize: () => Promise<void>;
  add: (productId: string, status?: WatchlistStatus) => Promise<void>;
  remove: (productId: string) => Promise<void>;
  setStatus: (productId: string, status: WatchlistStatus) => Promise<void>;
  clear: () => Promise<void>;
  isInList: (productId: string) => boolean;
  getStatus: (productId: string) => WatchlistStatus | null;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [],
      hydrated: false,

      initialize: async () => {
        const items = await getWatchlist();
        set({ items, hydrated: true });
      },

      add: async (productId, status = 'Watching') => {
        const items = await addToWatchlist(productId, status);
        set({ items });
        analytics.productWatchlisted(productId);
      },

      remove: async (productId) => {
        const items = await removeFromWatchlist(productId);
        set({ items });
        analytics.productUnwatchlisted(productId);
      },

      setStatus: async (productId, status) => {
        const items = await setWatchlistStatus(productId, status);
        set({ items });
      },

      clear: async () => {
        await clearWatchlist();
        set({ items: [] });
      },

      isInList: (productId) => get().items.some((i) => i.productId === productId),

      getStatus: (productId) => get().items.find((i) => i.productId === productId)?.status ?? null,
    }),
    {
      name: '@trendpro/watchlist-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ items: s.items }),
    },
  ),
);
