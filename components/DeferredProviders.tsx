"use client";

import { useEffect, useRef } from "react";
import { initConsoleFilter } from "@/lib/console-filter";

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
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Console filter
    initConsoleFilter();

    // IntersectObserver
    import("tailwindcss-intersect").then(({ Observer }) => {
      Observer.start();
    });
  }, []);

  return null;
}
