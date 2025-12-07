/**
 * Console Filter Utility
 * Suppresses specific console logs in production for better SEO and cleaner output
 */

/**
 * Patterns to filter out in production
 */
const PRODUCTION_FILTERS = [
  /videojs-http-source-selector/i,
  /player\.techName_/i,
  /player\.videojs_http_source_selector_initialized/i,
  /\[Vercel.*Analytics\]/i,
  /\[Vercel.*Speed Insights\]/i,
  /res\.cloudinary\.com.*404/i,
  /Failed to load resource.*cloudinary/i,
];

/**
 * Initialize console filtering for production environments
 * Suppresses specific console logs that are not critical for production
 */
export function initConsoleFilter() {
  // Only filter in production
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  // Store original console methods
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  // Filter console.log
  console.log = (...args: unknown[]) => {
    const message = args.join(' ');
    if (!shouldFilter(message)) {
      originalLog.apply(console, args);
    }
  };

  // Filter console.warn
  console.warn = (...args: unknown[]) => {
    const message = args.join(' ');
    if (!shouldFilter(message)) {
      originalWarn.apply(console, args);
    }
  };

  // Filter console.error (be more careful with errors)
  console.error = (...args: unknown[]) => {
    const message = args.join(' ');
    // Only filter known non-critical errors
    const isNonCritical = PRODUCTION_FILTERS.some(pattern =>
      pattern.test(message) && (
        message.includes('Failed to load script') ||
        message.includes('analytics')
      )
    );

    if (!isNonCritical) {
      originalError.apply(console, args);
    }
  };
}

/**
 * Check if a message should be filtered
 */
function shouldFilter(message: string): boolean {
  return PRODUCTION_FILTERS.some(pattern => pattern.test(message));
}
