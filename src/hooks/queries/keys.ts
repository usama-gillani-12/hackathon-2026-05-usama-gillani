export const queryKeys = {
  products: ['products'] as const,
  product: (id: string) => ['products', id] as const,
  transactions: ['transactions'] as const,
  watchlist: ['watchlist'] as const,
  unlockedIds: ['unlockedIds'] as const,
  creditBalance: ['creditBalance'] as const,
} as const;
