"use client";

import {
  useScrollDepthTracking,
  useSectionViewTracking,
} from "@/lib/hooks/useAnalytics";

interface PageAnalyticsRuntimeProps {
  trackScroll?: boolean;
  trackSections?: boolean;
  scrollThresholds?: number[];
}

export function PageAnalyticsRuntime({
  trackScroll = true,
  trackSections = true,
  scrollThresholds,
}: PageAnalyticsRuntimeProps) {
  useScrollDepthTracking({
    enabled: trackScroll,
    thresholds: scrollThresholds,
  });
  useSectionViewTracking({ enabled: trackSections });

  return null;
}
