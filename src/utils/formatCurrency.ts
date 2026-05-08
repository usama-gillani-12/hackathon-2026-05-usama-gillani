export function formatCurrency(amount: number, currency: 'USD' | 'USDC' = 'USD'): string {
  if (Number.isNaN(amount) || !Number.isFinite(amount)) return currency === 'USDC' ? '0 USDC' : '$0.00';
  if (currency === 'USDC') {
    return `${amount.toFixed(2)} USDC`;
  }
  return `$${amount.toFixed(2)}`;
}

export function formatCompactNumber(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return `${Math.round(value)}`;
}

export function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(timestamp: number): string {
  const d = new Date(timestamp);
  return `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
}

export function shortenHash(hash: string, head = 6, tail = 4): string {
  if (!hash) return '';
  if (hash.length <= head + tail + 3) return hash;
  return `${hash.slice(0, head)}…${hash.slice(-tail)}`;
}
