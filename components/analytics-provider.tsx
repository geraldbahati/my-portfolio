"use client";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { ConsentBanner } from "@/components/consent-banner";

/**
 * Product analytics run through PostHog, initialized in
 * `instrumentation-client.ts`. Vercel Speed Insights stays because it reports
 * real-user Core Web Vitals straight into the Vercel dashboard next to the
 * deployment that caused them.
 */
export function AnalyticsProvider() {
  const isVercelProduction =
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PUBLIC_VERCEL_ENV === "production";

  return (
    <>
      {isVercelProduction && <SpeedInsights />}
      <ConsentBanner />
    </>
  );
}
