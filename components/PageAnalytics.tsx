"use client";

import { useAnalytics } from "@/lib/hooks/useAnalytics";

interface PageAnalyticsProps {
  trackPageView?: boolean;
  trackScroll?: boolean;
  trackTime?: boolean;
  scrollThresholds?: number[];
}

/**
 * Client component for tracking page analytics
 * Use this in server components to add analytics tracking
 */
export function PageAnalytics({
  trackPageView = true,
  trackScroll = true,
  trackTime = true,
  scrollThresholds = [25, 50, 75, 100],
}: PageAnalyticsProps) {
  useAnalytics({
    trackPageView,
    trackScroll,
    trackTime,
    scrollThresholds,
  });

  return null;
}
