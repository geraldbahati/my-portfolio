"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import dynamic from "next/dynamic";
import BioTextAnimator, {
  type SubscribeToTextProgress,
} from "@/sections/bio-text-animator";

const HeroEnhancements = dynamic(() => import("@/sections/hero-enhancements"), {
  ssr: false,
  loading: () => null,
});

// Stable references for useSyncExternalStore
const noop = () => () => {};
const getCssScrollSupport = () =>
  typeof CSS !== "undefined" && CSS.supports("animation-timeline", "scroll()");
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
  const textProgressListenersRef = useRef(
    new Set<(progress: number) => void>(),
  );

  const cssScrollSupported = useSyncExternalStore(
    noop,
    getCssScrollSupport,
    serverSnapshot,
  );

  const subscribeToTextProgress = useCallback<SubscribeToTextProgress>(
    (listener) => {
      textProgressListenersRef.current.add(listener);
      listener(textProgressRef.current);

      return () => {
        textProgressListenersRef.current.delete(listener);
      };
    },
    [],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const scrollContainer: HTMLDivElement = container;

    // Grab DOM refs for direct manipulation
    heroScaleRef.current = container.querySelector("[data-hero-scale]");
    bioImageRef.current = container.querySelector("[data-bio-image]");
    bioBgRef.current = container.querySelector("[data-bio-bg]");
    bioCtaRef.current = container.querySelector("[data-bio-cta]");

    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let rafId = 0;

    function updateScrollAnimations() {
      rafId = 0;

      const rect = scrollContainer.getBoundingClientRect();
      const containerHeight = scrollContainer.offsetHeight;

      // scrollYProgress: 0 when container top at viewport top, 1 when container center at viewport top
      // This matches motion/react's offset: ["start start", "center start"]
      const scrolled = -rect.top;
      const halfHeight = containerHeight / 2;
      const progress = Math.min(1, Math.max(0, scrolled / halfHeight));

      // Compute derived progress values matching the original transforms
      const contentProgress = Math.min(1, Math.max(0, (progress - 0.4) / 0.6));
      const rawTextProgress = Math.min(
        1,
        Math.max(0, (progress - 0.55) / 0.45),
      );
      const prefersReducedMotion = reducedMotionQuery.matches;
      const textProgress = prefersReducedMotion ? 1 : rawTextProgress;

      textProgressRef.current = textProgress;
      textProgressListenersRef.current.forEach((listener) => {
        listener(textProgress);
      });

      const animatedElements = [
        heroScaleRef.current,
        bioImageRef.current,
        bioBgRef.current,
        bioCtaRef.current,
      ];
      animatedElements.forEach((element) => {
        if (element) {
          element.style.animation = prefersReducedMotion ? "none" : "";
        }
      });

      // Reduced motion uses the fully revealed static state. Otherwise, mutate
      // styles only for the JS fallback.
      if (prefersReducedMotion || !cssScrollSupported) {
        const effectiveProgress = prefersReducedMotion ? 1 : progress;
        const effectiveContentProgress = prefersReducedMotion
          ? 1
          : contentProgress;

        // Hero image scale: 1 → 0.85
        if (heroScaleRef.current) {
          const scale = 1 - effectiveProgress * 0.15;
          heroScaleRef.current.style.transform = `scale(${scale}) translateZ(0)`;
        }

        // Bio image: scale, opacity, translateY
        if (bioImageRef.current) {
          const imgScale = 0.6 + effectiveContentProgress * 0.4;
          const imgOpacity = Math.min(1, effectiveContentProgress / 0.2);
          const imgY = 100 - effectiveContentProgress * 100;
          bioImageRef.current.style.transform = `translateY(${imgY}px) scale(${imgScale}) translateZ(0)`;
          bioImageRef.current.style.opacity = String(imgOpacity);
        }

        // Bio background opacity
        if (bioBgRef.current) {
          const bgProgress = Math.min(1, Math.max(0, effectiveProgress / 0.5));
          const bgOpacity = 0.3 + bgProgress * 0.7;
          bioBgRef.current.style.opacity = String(bgOpacity);
        }

        // Bio CTA opacity and translateY
        if (bioCtaRef.current) {
          const ctaTextProgress = prefersReducedMotion ? 1 : rawTextProgress;
          const ctaProgress = Math.min(
            1,
            Math.max(0, (ctaTextProgress - 0.7) / 0.3),
          );
          const ctaOpacity = ctaProgress;
          const ctaY = 20 - ctaProgress * 20;
          bioCtaRef.current.style.opacity = String(ctaOpacity);
          bioCtaRef.current.style.transform = `translateY(${ctaY}px)`;
        }
      } else {
        heroScaleRef.current?.style.removeProperty("transform");
        bioImageRef.current?.style.removeProperty("transform");
        bioImageRef.current?.style.removeProperty("opacity");
        bioBgRef.current?.style.removeProperty("opacity");
        bioCtaRef.current?.style.removeProperty("opacity");
        bioCtaRef.current?.style.removeProperty("transform");
      }
    }

    function scheduleUpdate() {
      if (rafId === 0) {
        rafId = requestAnimationFrame(updateScrollAnimations);
      }
    }

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    reducedMotionQuery.addEventListener("change", scheduleUpdate);
    scheduleUpdate();

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      reducedMotionQuery.removeEventListener("change", scheduleUpdate);
      if (rafId !== 0) {
        cancelAnimationFrame(rafId);
      }
    };
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

      <BioTextAnimator subscribeToTextProgress={subscribeToTextProgress} />
    </>
  );
}
