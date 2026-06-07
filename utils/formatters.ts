import { format, formatDistanceToNow } from 'date-fns';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyCompact(amount: number): string {
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(2)} Cr`;
  if (amount >= 100_000) return `₹${(amount / 100_000).toFixed(2)} L`;
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(1)}K`;
  return formatCurrency(amount);
}

export function formatDate(timestamp: number): string {
  return format(new Date(timestamp), 'dd MMM yyyy');
}

export function formatDateTime(timestamp: number): string {
  return format(new Date(timestamp), 'dd MMM yyyy, HH:mm');
}

export function formatRelative(timestamp: number): string {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}

export function formatCapacity(kw: number): string {
  return `${kw} kWp`;
}
