/**
 * Analytics hooks.
 *
 * PostHog already captures pageviews (including App Router client navigation),
 * time on page via `$pageleave`, and max scroll percentage. These hooks only
 * cover what it can't infer on its own:
 *
 *   - scroll depth as discrete events, so depth can be used as a funnel step
 *   - which sections were actually on screen
 */

"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { trackScrollDepthReached, trackSectionViewed } from "@/lib/analytics";

const DEFAULT_THRESHOLDS = [25, 50, 75, 100];

/** Case-study pages report their slug so depth can be compared per project. */
function projectSlugFromPath(pathname: string): string | undefined {
  return pathname.match(/^\/projects\/([^/]+)$/)?.[1];
}

export function useScrollDepthTracking(options?: {
  enabled?: boolean;
  thresholds?: number[];
}) {
  const { enabled = true, thresholds = DEFAULT_THRESHOLDS } = options ?? {};
  const pathname = usePathname();

  useEffect(() => {
    if (!enabled || !pathname) {
      return;
    }

    const reached = new Set<number>();
    const projectSlug = projectSlugFromPath(pathname);
    let frame = 0;

    const measure = () => {
      frame = 0;

      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;

      // Pages shorter than the viewport are fully seen on arrival; reporting
      // 100% for them would drown out real depth data.
      if (scrollable <= 0) {
        return;
      }

      const depthPercent = (window.scrollY / scrollable) * 100;

      for (const threshold of thresholds) {
        if (depthPercent >= threshold && !reached.has(threshold)) {
          reached.add(threshold);
          trackScrollDepthReached({
            depth: threshold,
            page: pathname,
            project_slug: projectSlug,
          });
        }
      }
    };

    const onScroll = () => {
      if (frame) {
        return;
      }
      frame = window.requestAnimationFrame(measure);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    measure();

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [enabled, pathname, thresholds]);
}

/**
 * Reports the first time each `[data-section-id]` element is at least half
 * visible, then stops watching it.
 */
export function useSectionViewTracking(options?: { enabled?: boolean }) {
  const { enabled = true } = options ?? {};
  const pathname = usePathname();
  const seen = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) {
      return;
    }

    seen.current = new Set();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const sectionId = (entry.target as HTMLElement).dataset.sectionId;

          if (
            !entry.isIntersecting ||
            !sectionId ||
            seen.current.has(sectionId)
          ) {
            continue;
          }

          seen.current.add(sectionId);
          trackSectionViewed({ section_id: sectionId, page: pathname ?? "" });
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.5 },
    );

    document
      .querySelectorAll<HTMLElement>("[data-section-id]")
      .forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [enabled, pathname]);
}
