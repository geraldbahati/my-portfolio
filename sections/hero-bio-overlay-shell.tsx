"use client";

import { ReactNode, useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import BioTextAnimator from "@/sections/bio-text-animator";

const HeroEnhancements = dynamic(
  () => import("@/sections/hero-enhancements"),
  { ssr: false, loading: () => null },
);

// Stable references for useSyncExternalStore
const noop = () => () => {};
const getCssScrollSupport = () =>
  CSS.supports("animation-timeline", "scroll()");
const serverSnapshot = () => false;

/**
 * HeroBioOverlayShell - Thin client shell with vanilla scroll tracking.
 *
 * Accepts server-rendered heroSlot and bioSlot as children.
 * Replaces motion/react's useScroll with a vanilla scroll listener (~0.3KB).
 */
export default function HeroBioOverlayShell({
  heroSlot,
  bioSlot,
}: {
  heroSlot: ReactNode;
  bioSlot: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroScaleRef = useRef<HTMLDivElement | null>(null);
  const bioImageRef = useRef<HTMLElement | null>(null);
  const bioBgRef = useRef<HTMLElement | null>(null);
  const bioCtaRef = useRef<HTMLElement | null>(null);
  const textProgressRef = useRef(0);

  const cssScrollSupported = useSyncExternalStore(
    noop,
    getCssScrollSupport,
    serverSnapshot,
  );

  // Stable callback for BioTextAnimator to read progress
  const getTextProgress = useCallback(() => textProgressRef.current, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Grab DOM refs for direct manipulation
    heroScaleRef.current = container.querySelector("[data-hero-scale]");
    bioImageRef.current = container.querySelector("[data-bio-image]");
    bioBgRef.current = container.querySelector("[data-bio-bg]");
    bioCtaRef.current = container.querySelector("[data-bio-cta]");

    function onScroll() {
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const containerHeight = container.offsetHeight;

      // scrollYProgress: 0 when container top at viewport top, 1 when container center at viewport top
      // This matches motion/react's offset: ["start start", "center start"]
      const scrolled = -rect.top;
      const halfHeight = containerHeight / 2;
      const progress = Math.min(1, Math.max(0, scrolled / halfHeight));

      // Compute derived progress values matching the original transforms
      const contentProgress = Math.min(1, Math.max(0, (progress - 0.4) / 0.6));
      const rawTextProgress = Math.min(1, Math.max(0, (progress - 0.55) / 0.45));

      // Forward text progress for BioTextAnimator
      textProgressRef.current = rawTextProgress;

      // JS fallback animations (when CSS scroll-driven animations are NOT supported)
      if (!cssScrollSupported) {
        // Hero image scale: 1 → 0.85
        if (heroScaleRef.current) {
          const scale = 1 - progress * 0.15;
          heroScaleRef.current.style.transform = `scale(${scale}) translateZ(0)`;
        }

        // Bio image: scale, opacity, translateY
        if (bioImageRef.current) {
          const imgScale = 0.6 + contentProgress * 0.4;
          const imgOpacity = Math.min(1, contentProgress / 0.2);
          const imgY = 100 - contentProgress * 100;
          bioImageRef.current.style.transform = `translateY(${imgY}px) scale(${imgScale}) translateZ(0)`;
          bioImageRef.current.style.opacity = String(imgOpacity);
        }

        // Bio background opacity
        if (bioBgRef.current) {
          const bgProgress = Math.min(1, Math.max(0, progress / 0.5));
          const bgOpacity = 0.3 + bgProgress * 0.7;
          bioBgRef.current.style.opacity = String(bgOpacity);
        }

        // Bio CTA opacity and translateY
        if (bioCtaRef.current) {
          const ctaTextProgress = rawTextProgress;
          const ctaProgress = Math.min(1, Math.max(0, (ctaTextProgress - 0.7) / 0.3));
          const ctaOpacity = ctaProgress;
          const ctaY = 20 - ctaProgress * 20;
          bioCtaRef.current.style.opacity = String(ctaOpacity);
          bioCtaRef.current.style.transform = `translateY(${ctaY}px)`;
        }
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    // Run once on mount
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, [cssScrollSupported]);

  return (
    <>
      <div
        ref={containerRef}
        className="relative"
        style={{
          height: "200vh",
          contain: "layout style paint",
        }}
      >
        {/* Fixed Hero Section */}
        <div
          className="sticky top-0 h-screen w-full"
          style={{ transform: "translateZ(0)" }}
        >
          <div className="relative h-full w-full">
            {heroSlot}
            <HeroEnhancements />
          </div>
        </div>

        {/* Bio Section - slides up from bottom */}
        <div
          className="absolute left-0 w-full h-screen"
          style={{
            top: "100vh",
            zIndex: 10,
            transform: "translateZ(0)",
          }}
        >
          {bioSlot}
        </div>
      </div>

      {/* Per-character text animator - always uses JS */}
      <BioTextAnimator getTextProgress={getTextProgress} />
    </>
  );
}
