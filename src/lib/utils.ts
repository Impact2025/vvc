import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { nl } from "date-fns/locale";

/** Merge Tailwind classes without conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format cents to a Dutch euro string.
 * e.g. 15000 → "€150,00"
 */
export function formatEuro(cents: number): string {
  const euros = cents / 100;
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(euros);
}

/**
 * Format a date to a short Dutch string.
 * e.g. "ma 14 jul"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "EEE d MMM", { locale: nl });
}

/**
 * Get uppercase initials from a full name.
 * e.g. "Mohammed Khalid" → "MK"
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

/**
 * Human-readable "time ago" in Dutch.
 * e.g. "2 uur geleden"
 */
export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(d, { locale: nl, addSuffix: true });
}
