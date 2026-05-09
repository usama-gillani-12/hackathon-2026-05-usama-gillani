import { CreditTransaction, UnlockRecord } from '@t/credits';
import { generateTxHash } from '@utils/generateTxHash';
import { recordTransaction, spendCredits } from './creditService';
import { readJson, StorageKeys, writeJson } from './storageService';

export async function getUnlocks(): Promise<UnlockRecord[]> {
  return readJson<UnlockRecord[]>(StorageKeys.Unlocks, []);
}

export async function isUnlocked(productId: string): Promise<boolean> {
  const list = await getUnlocks();
  return list.some((u) => u.productId === productId);
}

export async function getUnlockedIdSet(): Promise<Set<string>> {
  const list = await getUnlocks();
  return new Set(list.map((u) => u.productId));
}

export interface UnlockOutcome {
  success: boolean;
  reason?: 'insufficient-credits';
  balance: number;
  record?: UnlockRecord;
}

export async function unlockProduct(params: {
  productId: string;
  productTitle: string;
  cost: number;
}): Promise<UnlockOutcome> {
  const spend = await spendCredits(params.cost);
  if (!spend.ok) {
    return { success: false, reason: 'insufficient-credits', balance: spend.balance };
  }

  const record: UnlockRecord = {
    productId: params.productId,
    unlockedAt: Date.now(),
    creditsSpent: params.cost,
    txHash: generateTxHash(),
  };

  const list = await getUnlocks();
  const next = [record, ...list.filter((r) => r.productId !== params.productId)];
  await writeJson(StorageKeys.Unlocks, next);

  const tx: CreditTransaction = {
    id: record.txHash,
    type: 'unlock',
    credits: -params.cost,
    usdcAmount: 0,
    txHash: record.txHash,
    status: 'confirmed',
    createdAt: record.unlockedAt,
    productId: params.productId,
    productTitle: params.productTitle,
    network: 'mock',
  };
  await recordTransaction(tx);

  return { success: true, balance: spend.balance, record };
}

export async function clearUnlocks(): Promise<void> {
  await writeJson(StorageKeys.Unlocks, []);
}
