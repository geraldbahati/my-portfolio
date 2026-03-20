"use client";

import { useEffect } from "react";
import { Observer } from "tailwindcss-intersect";
import { initConsoleFilter } from "@/lib/console-filter";

let hasInitializedDeferredProviders = false;

/**
 * DeferredProviders - Initializes non-critical providers after hydration.
 * Loaded with ssr: false so it doesn't block FCP/LCP.
 *
 * Handles:
 * - IntersectObserver (Observer.start())
 * - ConsoleFilter
 *
 * Note: Lenis is still managed by LenisProvider (which the navbar depends on
 * via useLenis()). LenisProvider already defers to useEffect, so it doesn't
 * block SSR paint.
 */
export default function DeferredProviders() {
  useEffect(() => {
    if (hasInitializedDeferredProviders) return;
    hasInitializedDeferredProviders = true;

    // Console filter
    initConsoleFilter();

    // IntersectObserver
    Observer.start();
  }, []);

  return null;
}
