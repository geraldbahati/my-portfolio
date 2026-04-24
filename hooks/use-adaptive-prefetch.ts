"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { warmRoute } from "@/lib/resource-warmup";

interface UseAdaptivePrefetchOptions {
  enabled?: boolean;
  prefetchOnViewport?: boolean;
  rootMargin?: string;
  delayMs?: number;
}

function normalizePath(path: string) {
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }

  return path;
}

export function useAdaptivePrefetch(
  href: string,
  {
    enabled = true,
    prefetchOnViewport = false,
    rootMargin = "200px",
    delayMs = 0,
  }: UseAdaptivePrefetchOptions = {},
) {
  const router = useRouter();
  const pathname = usePathname();
  const elementRef = useRef<HTMLElement | null>(null);

  const isSamePage = normalizePath(pathname || "/") === normalizePath(href);

  const prefetchNow = useCallback(() => {
    if (!enabled || isSamePage) {
      return;
    }

    warmRoute(href, (nextHref) => router.prefetch(nextHref));
  }, [enabled, href, isSamePage, router]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled || !prefetchOnViewport || isSamePage) {
      return;
    }

    let timeoutId: number | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        observer.disconnect();

        if (delayMs > 0) {
          timeoutId = window.setTimeout(prefetchNow, delayMs);
          return;
        }

        prefetchNow();
      },
      { rootMargin },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [delayMs, enabled, isSamePage, prefetchNow, prefetchOnViewport, rootMargin]);

  const handleMouseEnter = useCallback(() => {
    prefetchNow();
  }, [prefetchNow]);

  const handleFocus = useCallback(() => {
    prefetchNow();
  }, [prefetchNow]);

  const setPrefetchRef = useCallback((node: HTMLElement | null) => {
    elementRef.current = node;
  }, []);

  return {
    prefetchNow,
    prefetchRef: setPrefetchRef,
    prefetchProps: {
      onFocus: handleFocus,
      onMouseEnter: handleMouseEnter,
    },
  };
}
