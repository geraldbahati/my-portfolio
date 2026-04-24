"use client";

import { useAnalytics } from "@/lib/hooks/useAnalytics";

interface PageAnalyticsRuntimeProps {
  trackPageView?: boolean;
  trackScroll?: boolean;
  trackTime?: boolean;
  scrollThresholds?: number[];
}

export function PageAnalyticsRuntime({
  trackPageView = true,
  trackScroll = true,
  trackTime = true,
  scrollThresholds = [25, 50, 75, 100],
}: PageAnalyticsRuntimeProps) {
  useAnalytics({
    trackPageView,
    trackScroll,
    trackTime,
    scrollThresholds,
  });

  return null;
}
