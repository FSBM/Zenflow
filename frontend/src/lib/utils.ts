export function formatCurrencyINR(v: unknown) {
  const n = Number(v as any);
  if (Number.isNaN(n)) return '₹0.00';
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);
  } catch (e) {
    return `₹${n.toLocaleString()}`;
  }
}

export default { formatCurrencyINR };
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
