"use client";

import { startTransition, useEffect, useState } from "react";
import dynamic from "next/dynamic";

interface PageAnalyticsProps {
  trackPageView?: boolean;
  trackScroll?: boolean;
  trackTime?: boolean;
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

export function PageAnalytics({
  trackPageView = true,
  trackScroll = true,
  trackTime = true,
  scrollThresholds = [25, 50, 75, 100],
}: PageAnalyticsProps) {
  const [shouldStartTracking, setShouldStartTracking] = useState(false);
  const isProduction = process.env.NODE_ENV === "production";

  useEffect(() => {
    if (!isProduction) {
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
  }, [isProduction]);

  if (!isProduction || !shouldStartTracking) {
    return null;
  }

  return (
    <DeferredPageAnalyticsRuntime
      trackPageView={trackPageView}
      trackScroll={trackScroll}
      trackTime={trackTime}
      scrollThresholds={scrollThresholds}
    />
  );
}
