import { readJson, removeKey, StorageKeys, writeJson } from './storageService';

export interface WalletSession {
  address: `0x${string}`;
  connectedAt: number;
  chainId: number;
}

export async function getWalletSession(): Promise<WalletSession | null> {
  return readJson<WalletSession | null>(StorageKeys.WalletAddress, null);
}

export async function saveWalletSession(session: WalletSession): Promise<void> {
  await writeJson(StorageKeys.WalletAddress, session);
}

export async function clearWalletSession(): Promise<void> {
  await removeKey(StorageKeys.WalletAddress);
}

export function formatAddress(address: `0x${string}`): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
