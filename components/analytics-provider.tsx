'use client';

import { Analytics, type BeforeSendEvent } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

export function AnalyticsProvider() {
  // Only load analytics in production (when deployed on Vercel)
  const isProduction = process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

  // Custom beforeSend hook for data privacy and filtering
  const handleBeforeSend = (event: BeforeSendEvent) => {
    // Filter out sensitive query parameters
    const url = new URL(event.url);
    const sensitiveParams = ['token', 'secret', 'key', 'password', 'api_key'];

    sensitiveParams.forEach(param => {
      if (url.searchParams.has(param)) {
        url.searchParams.delete(param);
      }
    });

    // Optionally ignore specific routes (e.g., admin, private pages)
    if (url.pathname.includes('/admin') || url.pathname.includes('/private')) {
      return null; // Don't track these pages
    }

    // Check for user opt-out
    if (typeof window !== 'undefined' && window.localStorage?.getItem('analytics-opt-out')) {
      return null;
    }

    return {
      ...event,
      url: url.toString(),
    };
  };

  // Don't render analytics in local development
  if (!isProduction) {
    return null;
  }

  return (
    <>
      <Analytics beforeSend={handleBeforeSend} />
      <SpeedInsights />
    </>
  );
}
