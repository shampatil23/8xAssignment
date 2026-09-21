// ============================================================================
// General utility functions
// ============================================================================

/**
 * Format a price number as a currency string.
 */
export function formatPrice(
  amount: number,
  currency: string = 'INR',
  locale: string = 'en-IN',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate discount percentage from original and sale price.
 */
export function calcDiscountPercent(original: number, sale: number): number {
  if (original <= 0) return 0;
  return Math.round(((original - sale) / original) * 100);
}

/**
 * Truncate a string to a max character count, appending "…".
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Generate a URL-friendly slug from a string.
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Deep clone a plain object (JSON-safe values only).
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Get initials from a display name (e.g. "John Doe" → "JD").
 */
export function getInitials(name: string | null | undefined, max = 2): string {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, max)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Check if a value is a non-empty string.
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Debounce a function call.
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Format a date string to a human-readable form.
 */
export function formatDate(
  dateStr: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
  locale = 'en-IN',
): string {
  try {
    return new Intl.DateTimeFormat(locale, options).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

/**
 * Build Cloudinary URL from public ID (basic transformation).
 */
export function buildCloudinaryUrl(
  publicId: string,
  cloudName: string,
  transformations: string = 'f_auto,q_auto,w_400',
): string {
  if (!publicId || !cloudName) return '';
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
}

/**
 * Safely get a nested object value.
 */
export function safeGet<T>(
  obj: Record<string, unknown>,
  path: string,
  fallback: T,
): T {
  try {
    const value = path.split('.').reduce<unknown>((acc, key) => {
      if (acc && typeof acc === 'object' && key in acc) {
        return (acc as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
    return value !== undefined ? (value as T) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Generate a random ID (not cryptographically secure, for UI only).
 */
export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}
