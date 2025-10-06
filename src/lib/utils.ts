import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date string according to the given locale.
 * @param dateString - The ISO or valid date string to format.
 * @param locale - Optional locale (e.g., 'fr', 'en-US'). Defaults to 'en-US'.
 * @returns Formatted date string.
 */
export function formatDate(dateString: string, locale: string = "en-US"): string {
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
