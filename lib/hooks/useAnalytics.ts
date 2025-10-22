/**
 * React Hooks for Vercel Analytics
 *
 * Custom hooks for tracking various user interactions and behaviors
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Analytics from '@/lib/analytics';

/**
 * Hook to track page views automatically on route changes
 */
export function usePageViewTracking() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      Analytics.trackPageView(pathname);
    }
  }, [pathname]);
}

/**
 * Hook to track scroll depth
 */
export function useScrollTracking(thresholds: number[] = [25, 50, 75, 100]) {
  const pathname = usePathname();
  const trackedDepths = useRef<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercent = ((scrollTop + windowHeight) / documentHeight) * 100;

      thresholds.forEach((threshold) => {
        if (scrollPercent >= threshold && !trackedDepths.current.has(threshold)) {
          trackedDepths.current.add(threshold);
          Analytics.trackScrollDepth({
            depth: threshold,
            page: pathname || 'unknown',
          });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname, thresholds]);
}

/**
 * Hook to track time spent on page
 */
export function useTimeTracking(location?: string) {
  const pathname = usePathname();
  const startTime = useRef<number>(Date.now());
  const currentLocation = location || pathname || 'unknown';

  useEffect(() => {
    startTime.current = Date.now();

    return () => {
      const timeSpent = Date.now() - startTime.current;
      // Only track if user spent more than 3 seconds
      if (timeSpent > 3000) {
        Analytics.trackTimeSpent(currentLocation, timeSpent);
      }
    };
  }, [currentLocation]);
}

/**
 * Hook to track visibility (when component comes into view)
 */
export function useVisibilityTracking(
  ref: React.RefObject<HTMLElement>,
  eventName: string,
  options?: IntersectionObserverInit
) {
  const hasTracked = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasTracked.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasTracked.current) {
            Analytics.trackFeatureUse(eventName, {
              visible: true,
            });
            hasTracked.current = true;
          }
        });
      },
      {
        threshold: 0.5,
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, eventName, options]);
}

/**
 * Hook to track link clicks
 */
export function useTrackLink() {
  return useCallback(
    (linkText: string, destination: string, type: 'internal' | 'external' = 'internal') => {
      Analytics.trackLinkClick(linkText, destination, type);
    },
    []
  );
}

/**
 * Hook to track button clicks
 */
export function useTrackButton() {
  return useCallback((buttonName: string, location: string) => {
    Analytics.trackButtonClick(buttonName, location);
  }, []);
}

/**
 * Hook to track form submissions
 */
export function useTrackForm() {
  return useCallback(
    (formName: string, success: boolean, formId?: string, errorMessage?: string) => {
      Analytics.trackFormSubmission({
        formName,
        formId,
        success,
        errorMessage,
      });
    },
    []
  );
}

/**
 * Hook to track media interactions
 */
export function useTrackMedia() {
  return useCallback(
    (
      mediaType: 'image' | 'video' | 'audio',
      action: 'play' | 'pause' | 'complete' | 'view',
      mediaId?: string,
      duration?: number
    ) => {
      Analytics.trackMediaInteraction({
        mediaType,
        action,
        mediaId,
        duration,
      });
    },
    []
  );
}

/**
 * Hook to track errors
 */
export function useTrackError() {
  return useCallback((errorName: string, errorMessage: string, context?: Record<string, string | number | boolean | null>) => {
    Analytics.trackError(errorName, errorMessage, context);
  }, []);
}

/**
 * Hook to track conversions
 */
export function useTrackConversion() {
  return useCallback(
    (
      eventName: string,
      category: string,
      value?: number,
      currency: string = 'USD'
    ) => {
      Analytics.trackConversion(eventName, {
        category,
        value,
        currency,
      });
    },
    []
  );
}

/**
 * Hook to track outbound links
 */
export function useTrackOutboundLink() {
  return useCallback((url: string, context?: string) => {
    Analytics.trackOutboundLink(url, context);
  }, []);
}

/**
 * Hook for analytics preferences
 */
export function useAnalyticsPreferences() {
  const enableAnalytics = useCallback(() => {
    Analytics.enableAnalytics();
  }, []);

  const disableAnalytics = useCallback(() => {
    Analytics.disableAnalytics();
  }, []);

  const isEnabled = Analytics.isAnalyticsEnabled();

  return {
    enableAnalytics,
    disableAnalytics,
    isEnabled,
  };
}

/**
 * Comprehensive hook that combines multiple tracking features
 */
export function useAnalytics(options?: {
  trackPageView?: boolean;
  trackScroll?: boolean;
  trackTime?: boolean;
  scrollThresholds?: number[];
}) {
  const {
    trackPageView = true,
    trackScroll = false,
    trackTime = false,
    scrollThresholds = [25, 50, 75, 100],
  } = options || {};

  const pathname = usePathname();

  // Track page view
  useEffect(() => {
    if (trackPageView && pathname) {
      Analytics.trackPageView(pathname);
    }
  }, [pathname, trackPageView]);

  // Track scroll depth
  useEffect(() => {
    if (!trackScroll) return;

    const trackedDepths = new Set<number>();

    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      const scrollPercent = ((scrollTop + windowHeight) / documentHeight) * 100;

      scrollThresholds.forEach((threshold) => {
        if (scrollPercent >= threshold && !trackedDepths.has(threshold)) {
          trackedDepths.add(threshold);
          Analytics.trackScrollDepth({
            depth: threshold,
            page: pathname || 'unknown',
          });
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [trackScroll, scrollThresholds, pathname]);

  // Track time on page
  useEffect(() => {
    if (!trackTime) return;

    const startTime = Date.now();
    const location = pathname || 'unknown';

    return () => {
      const timeSpent = Date.now() - startTime;
      // Only track if user spent more than 3 seconds
      if (timeSpent > 3000) {
        Analytics.trackTimeSpent(location, timeSpent);
      }
    };
  }, [trackTime, pathname]);

  return {
    trackButton: useTrackButton(),
    trackLink: useTrackLink(),
    trackForm: useTrackForm(),
    trackMedia: useTrackMedia(),
    trackError: useTrackError(),
    trackConversion: useTrackConversion(),
    trackOutbound: useTrackOutboundLink(),
    analytics: Analytics,
  };
}
