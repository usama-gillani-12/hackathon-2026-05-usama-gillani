import { WatchlistItem, WatchlistStatus } from '@t/product';
import { readJson, StorageKeys, writeJson } from './storageService';

export async function getWatchlist(): Promise<WatchlistItem[]> {
  return readJson<WatchlistItem[]>(StorageKeys.Watchlist, []);
}

export async function isInWatchlist(productId: string): Promise<boolean> {
  const list = await getWatchlist();
  return list.some((item) => item.productId === productId);
}

export async function addToWatchlist(productId: string, status: WatchlistStatus = 'Watching'): Promise<WatchlistItem[]> {
  const list = await getWatchlist();
  const existing = list.find((item) => item.productId === productId);
  if (existing) {
    existing.status = status;
    await writeJson(StorageKeys.Watchlist, list);
    return list;
  }
  const next = [{ productId, status, addedAt: Date.now() }, ...list];
  await writeJson(StorageKeys.Watchlist, next);
  return next;
}

export async function removeFromWatchlist(productId: string): Promise<WatchlistItem[]> {
  const list = await getWatchlist();
  const next = list.filter((item) => item.productId !== productId);
  await writeJson(StorageKeys.Watchlist, next);
  return next;
}

export async function setWatchlistStatus(productId: string, status: WatchlistStatus): Promise<WatchlistItem[]> {
  const list = await getWatchlist();
  const item = list.find((i) => i.productId === productId);
  if (!item) return addToWatchlist(productId, status);
  item.status = status;
  await writeJson(StorageKeys.Watchlist, list);
  return list;
}

export async function clearWatchlist(): Promise<void> {
  await writeJson(StorageKeys.Watchlist, []);
}
