import { ChainVolumeSnapshot, CreditPackage, CreditTransaction, SubscriptionPass } from '@t/credits';
import { readJson, StorageKeys, writeJson } from './storageService';

// Investor-grade tiered pricing: bulk bonuses drive LTV, sub-$30/$70 anchors drive conversions
export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'pkg-starter',
    credits: 5,
    bonusCredits: 0,
    usdcAmount: 4,
    label: 'Starter',
    savingsPercent: 0,
    expiryDays: 30,
  },
  {
    id: 'pkg-growth',
    credits: 15,
    bonusCredits: 3,
    usdcAmount: 12,
    label: 'Growth',
    highlight: true,
    badgeText: 'MOST POPULAR',
    savingsPercent: 20,
    expiryDays: 60,
  },
  {
    id: 'pkg-pro',
    credits: 40,
    bonusCredits: 10,
    usdcAmount: 29,
    label: 'Pro',
    badgeText: 'BEST VALUE',
    savingsPercent: 42,
    expiryDays: 90,
  },
  {
    id: 'pkg-studio',
    credits: 100,
    bonusCredits: 30,
    usdcAmount: 69,
    label: 'Studio',
    badgeText: 'POWER USER',
    savingsPercent: 55,
    expiryDays: 180,
  },
];

export const SUBSCRIPTION_PASS: SubscriptionPass = {
  id: 'sub-monthly',
  label: 'Monthly Pass',
  creditsPerMonth: 25,
  usdcPerMonth: 19,
  perks: [
    'New credits auto-loaded monthly',
    'Never lose unused credits',
    'Priority product data refresh',
    '20% off one-time top-ups',
  ],
};

export function getTotalCredits(pkg: CreditPackage): number {
  return pkg.credits + (pkg.bonusCredits ?? 0);
}

export async function getChainVolume(): Promise<ChainVolumeSnapshot> {
  return readJson<ChainVolumeSnapshot>(StorageKeys.ChainVolume, {
    totalUsdcVolume: 0,
    totalTransactions: 0,
    snapshotAt: Date.now(),
  });
}

export async function incrementChainVolume(usdcAmount: number): Promise<void> {
  const existing = await getChainVolume();
  await writeJson(StorageKeys.ChainVolume, {
    totalUsdcVolume: existing.totalUsdcVolume + usdcAmount,
    totalTransactions: existing.totalTransactions + 1,
    snapshotAt: Date.now(),
  });
}

const STARTING_CREDITS = 2; // Give merchants a tiny taste so they can experience an unlock without paying first.

export async function getCreditBalance(): Promise<number> {
  const stored = await readJson<{ balance: number; initialized: boolean } | null>(
    StorageKeys.Credits,
    null,
  );
  if (!stored) {
    await writeJson(StorageKeys.Credits, { balance: STARTING_CREDITS, initialized: true });
    return STARTING_CREDITS;
  }
  return stored.balance ?? 0;
}

export async function setCreditBalance(balance: number): Promise<void> {
  await writeJson(StorageKeys.Credits, { balance: Math.max(0, balance), initialized: true });
}

export async function addCredits(amount: number): Promise<number> {
  const current = await getCreditBalance();
  const next = current + amount;
  await setCreditBalance(next);
  return next;
}

export async function spendCredits(amount: number): Promise<{ ok: boolean; balance: number }> {
  const current = await getCreditBalance();
  if (current < amount) return { ok: false, balance: current };
  const next = current - amount;
  await setCreditBalance(next);
  return { ok: true, balance: next };
}

export async function resetCredits(): Promise<number> {
  await writeJson(StorageKeys.Credits, { balance: STARTING_CREDITS, initialized: true });
  return STARTING_CREDITS;
}

export async function getTransactions(): Promise<CreditTransaction[]> {
  const list = await readJson<CreditTransaction[]>(StorageKeys.Transactions, []);
  return [...list].sort((a, b) => b.createdAt - a.createdAt);
}

export async function recordTransaction(tx: CreditTransaction): Promise<CreditTransaction[]> {
  const existing = await readJson<CreditTransaction[]>(StorageKeys.Transactions, []);
  const next = [tx, ...existing];
  await writeJson(StorageKeys.Transactions, next);
  return next;
}

export async function clearTransactions(): Promise<void> {
  await writeJson(StorageKeys.Transactions, []);
}

export function getPackageById(id: string): CreditPackage | undefined {
  return CREDIT_PACKAGES.find((p) => p.id === id);
}

// Legacy aliases so any stored packageId like 'pkg-5' still resolves gracefully
const LEGACY_ID_MAP: Record<string, string> = {
  'pkg-5': 'pkg-starter',
  'pkg-15': 'pkg-growth',
  'pkg-50': 'pkg-pro',
};

export function resolvePackageId(id: string): CreditPackage | undefined {
  return getPackageById(LEGACY_ID_MAP[id] ?? id);
}
