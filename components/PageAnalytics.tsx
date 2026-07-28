"use client";

import { startTransition, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { isPostHogEnabled } from "@/lib/posthog-client";

interface PageAnalyticsProps {
  trackScroll?: boolean;
  trackSections?: boolean;
  scrollThresholds?: number[];
}

const DeferredPageAnalyticsRuntime = dynamic(
  () =>
    import("./PageAnalyticsRuntime").then((mod) => ({
      default: mod.PageAnalyticsRuntime,
    })),
  {
    ssr: false,
    loading: () => null,
  },
);

/**
 * Supplementary page tracking (scroll depth, section visibility), loaded once
 * the browser goes idle so it never competes with LCP.
 *
 * Pageviews, time on page and error capture are handled by PostHog itself and
 * are not repeated here.
 */
export function PageAnalytics({
  trackScroll = true,
  trackSections = true,
  scrollThresholds,
}: PageAnalyticsProps) {
  const [shouldStartTracking, setShouldStartTracking] = useState(false);

  const isEnabled = isPostHogEnabled;

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    let timeoutId: number | null = null;
    let idleId: number | null = null;
    const supportsIdleCallback =
      typeof window.requestIdleCallback === "function";

    const activateTracking = () => {
      startTransition(() => {
        setShouldStartTracking(true);
      });
    };

    if (supportsIdleCallback) {
      idleId = window.requestIdleCallback(activateTracking, {
        timeout: 1500,
      });
    } else {
      timeoutId = window.setTimeout(activateTracking, 1200);
    }

    return () => {
      if (idleId !== null && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isEnabled]);

  if (!isEnabled || !shouldStartTracking) {
    return null;
  }

  return (
    <DeferredPageAnalyticsRuntime
      trackScroll={trackScroll}
      trackSections={trackSections}
      scrollThresholds={scrollThresholds}
    />
  );
}
