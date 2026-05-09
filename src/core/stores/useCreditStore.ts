import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CreditTransaction } from '@t/credits';
import {
  getCreditBalance,
  setCreditBalance,
  getTransactions,
  recordTransaction as serviceRecordTx,
  clearTransactions,
  CREDIT_PACKAGES,
} from '@core/services/creditService';

interface CreditState {
  balance: number;
  transactions: CreditTransaction[];
  hydrated: boolean;
  initialize: () => Promise<void>;
  addCredits: (amount: number) => Promise<void>;
  spendCredits: (amount: number) => Promise<boolean>;
  recordTransaction: (tx: CreditTransaction) => Promise<void>;
  reset: () => Promise<void>;
  packages: typeof CREDIT_PACKAGES;
}

export const useCreditStore = create<CreditState>()(
  persist(
    (set, get) => ({
      balance: 2,
      transactions: [],
      hydrated: false,
      packages: CREDIT_PACKAGES,

      initialize: async () => {
        const [balance, transactions] = await Promise.all([
          getCreditBalance(),
          getTransactions(),
        ]);
        set({ balance, transactions, hydrated: true });
      },

      addCredits: async (amount) => {
        const current = get().balance;
        const next = current + amount;
        await setCreditBalance(next);
        set({ balance: next });
      },

      spendCredits: async (amount) => {
        const current = get().balance;
        if (current < amount) return false;
        const next = current - amount;
        await setCreditBalance(next);
        set({ balance: next });
        return true;
      },

      recordTransaction: async (tx) => {
        await serviceRecordTx(tx);
        set((s) => ({ transactions: [tx, ...s.transactions] }));
      },

      reset: async () => {
        await Promise.all([setCreditBalance(2), clearTransactions()]);
        set({ balance: 2, transactions: [] });
      },
    }),
    {
      name: '@trendpro/credits-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ balance: s.balance }),
    },
  ),
);
