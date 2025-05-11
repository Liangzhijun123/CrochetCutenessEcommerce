import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

// Add formatPrice as an alias to formatCurrency for backward compatibility
export const formatPrice = formatCurrency

export function formatDate(date: string | Date, includeTime = false): string {
  const dateObj = typeof date === "string" ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return "Invalid Date"
  }

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }

  if (includeTime) {
    options.hour = "numeric"
    options.minute = "numeric"
    options.second = "numeric"
    options.timeZoneName = "short"
  }

  return dateObj.toLocaleDateString("en-US", options)
}
