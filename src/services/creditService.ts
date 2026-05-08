import { CreditPackage, CreditTransaction } from '../types/credits';
import { readJson, StorageKeys, writeJson } from './storageService';

export const CREDIT_PACKAGES: CreditPackage[] = [
  { id: 'pkg-5', credits: 5, usdcAmount: 5, label: 'Starter' },
  { id: 'pkg-15', credits: 15, usdcAmount: 15, label: 'Pro', highlight: true },
  { id: 'pkg-50', credits: 50, usdcAmount: 50, label: 'Studio' },
];

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
