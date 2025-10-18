export function generateStructuredData(data: Record<string, unknown>) {
    const baseSchema = {
      '@context': 'https://schema.org',
      ...data,
    }

    return baseSchema
  }

  export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    }
  }

  // lib/headers.ts
  export const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  }

  export const cacheHeaders = {
    // For static content
    static: {
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
    // For ISR pages
    revalidating: {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
    // For dynamic content
    dynamic: {
      'Cache-Control': 'private, no-cache, no-store, must-revalidate',
    },
  }
