// ============================================================================
// General utility functions
// ============================================================================

export const CURRENCY_RATES: Record<string, { rate: number; symbol: string; locale: string }> = {
  INR: { rate: 83.0, symbol: '₹', locale: 'en-IN' },
  USD: { rate: 1.0, symbol: '$', locale: 'en-US' },
  GBP: { rate: 0.79, symbol: '£', locale: 'en-GB' },
  EUR: { rate: 0.92, symbol: '€', locale: 'de-DE' },
  CAD: { rate: 1.36, symbol: 'C$', locale: 'en-CA' },
  AUD: { rate: 1.52, symbol: 'A$', locale: 'en-AU' },
  JPY: { rate: 155.0, symbol: '¥', locale: 'ja-JP' },
  AED: { rate: 3.67, symbol: 'AED ', locale: 'ar-AE' },
};

/**
 * Format a price number into a localized currency string.
 * Automatically converts base catalog USD amounts into INR (or active currency) using live rates.
 */
export function formatPrice(
  amount: number,
  currency?: string,
  locale?: string,
  options?: {
    alreadyConverted?: boolean;
    showCode?: boolean;
  },
): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0.00';
  }

  // Detect active currency:
  // 1. Explicit parameter
  let activeCurrency = currency;

  if (!activeCurrency && typeof window !== 'undefined') {
    try {
      const isConsoleRoute =
        window.location.pathname.startsWith('/admin') ||
        window.location.pathname.startsWith('/seller');

      const platformCurrency = localStorage.getItem('amazon_clone_platform_currency');

      if (isConsoleRoute) {
        // Admin and Seller consoles strictly follow Marketplace Platform Settings
        activeCurrency = platformCurrency || 'USD';
      } else {
        // If platform currency is explicitly configured, default to it
        const savedCountry = localStorage.getItem('amazon_clone_delivery_country');
        if (savedCountry === 'US') activeCurrency = 'USD';
        else if (savedCountry === 'GB') activeCurrency = 'GBP';
        else if (savedCountry === 'CA') activeCurrency = 'CAD';
        else if (savedCountry === 'EU' || savedCountry === 'DE') activeCurrency = 'EUR';
        else if (savedCountry === 'JP') activeCurrency = 'JPY';
        else if (savedCountry === 'AE') activeCurrency = 'AED';
        else if (savedCountry === 'AU') activeCurrency = 'AUD';
        else if (savedCountry === 'IN') activeCurrency = 'INR';
        else if (platformCurrency) activeCurrency = platformCurrency;
        else activeCurrency = 'USD';
      }
    } catch {
      activeCurrency = 'USD';
    }
  }

  if (!activeCurrency) {
    activeCurrency = 'USD';
  }

  const config = CURRENCY_RATES[activeCurrency] || CURRENCY_RATES.USD;
  const targetLocale = locale || config.locale;

  // Convert base USD amount to target currency if not already converted
  const converted = options?.alreadyConverted ? amount : amount * config.rate;

  const isZeroDecimal = activeCurrency === 'INR' || activeCurrency === 'JPY';

  try {
    const formatted = new Intl.NumberFormat(targetLocale, {
      style: 'currency',
      currency: activeCurrency,
      minimumFractionDigits: isZeroDecimal ? 0 : 2,
      maximumFractionDigits: isZeroDecimal ? 0 : 2,
    }).format(converted);

    if (options?.showCode) {
      return `${formatted} (${activeCurrency})`;
    }
    return formatted;
  } catch {
    return `${config.symbol}${converted.toFixed(isZeroDecimal ? 0 : 2)}`;
  }
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
