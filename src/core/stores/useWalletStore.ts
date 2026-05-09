import { create } from 'zustand';
import {
  WalletSession,
  clearWalletSession,
  getWalletSession,
  saveWalletSession,
} from '@core/services/walletService';

interface WalletState {
  session: WalletSession | null;
  isConnecting: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  setSession: (session: WalletSession) => Promise<void>;
  disconnect: () => Promise<void>;
  setConnecting: (v: boolean) => void;
  setError: (msg: string | null) => void;
}

export const useWalletStore = create<WalletState>()((set) => ({
  session: null,
  isConnecting: false,
  error: null,

  initialize: async () => {
    const session = await getWalletSession();
    set({ session });
  },

  setSession: async (session) => {
    await saveWalletSession(session);
    set({ session, error: null });
  },

  disconnect: async () => {
    await clearWalletSession();
    set({ session: null });
  },

  setConnecting: (v) => set({ isConnecting: v }),
  setError: (msg) => set({ error: msg }),
}));
