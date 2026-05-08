import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface PaginatedList<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  loadMore: () => void;
}

/**
 * Client-side pagination for any memoised array.
 * Resets to page 1 automatically when the source reference changes
 * (i.e. whenever a filter or sort is applied upstream).
 *
 * Usage:
 *   const { items, total, hasMore, isLoadingMore, loadMore } = usePaginatedList(filtered, 15);
 *
 * Pair with <ListFooterLoader> and FlatList props:
 *   onEndReached={loadMore}
 *   onEndReachedThreshold={0.3}
 */
export function usePaginatedList<T>(source: T[], pageSize = 15): PaginatedList<T> {
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const prevSourceRef = useRef<T[]>(source);

  // Reset to first page when source reference changes (filter/sort applied)
  useEffect(() => {
    if (prevSourceRef.current !== source) {
      prevSourceRef.current = source;
      setPage(1);
      setIsLoadingMore(false);
    }
  }, [source]);

  const items = useMemo(
    () => source.slice(0, page * pageSize),
    [source, page, pageSize],
  );

  const hasMore = page * pageSize < source.length;

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    // Small delay so the footer spinner renders before new items arrive
    setTimeout(() => {
      setPage((p) => p + 1);
      setIsLoadingMore(false);
    }, 250);
  }, [hasMore, isLoadingMore]);

  return { items, total: source.length, hasMore, isLoadingMore, loadMore };
}
