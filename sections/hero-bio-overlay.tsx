"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useScroll } from "motion/react";
import HeroSection from "@/sections/hero";
import BioOverlay from "@/sections/bio-overlay";

// Stable references for useSyncExternalStore (value never changes after hydration)
const noop = () => () => {};
const getCssScrollSupport = () =>
  CSS.supports("animation-timeline", "scroll()");
const serverSnapshot = () => false;

/**
 * HeroBioOverlay Component
 *
 * This component creates a scroll-triggered overlay effect where:
 * - The hero section remains fixed in place
 * - The bio section slides up from the bottom as the user scrolls
 * - The bio section's position is directly tied to scroll progress
 * - Animation is smooth and performance-optimized using CSS Scroll-Driven
 *   Animations (compositor thread) with Framer Motion as fallback
 */
export default function HeroBioOverlay() {
  // Reference to the scroll container that triggers the animation
  const containerRef = useRef<HTMLDivElement>(null);

  // Ref for direct DOM manipulation of hero image scale (JS fallback only)
  const heroScaleRef = useRef<HTMLDivElement>(null);

  // Feature detection: CSS Scroll-Driven Animations
  // useSyncExternalStore avoids the flash from useEffect+setState on mount
  const cssScrollSupported = useSyncExternalStore(
    noop,
    getCssScrollSupport,
    serverSnapshot,
  );

  // Track scroll progress within the container - Memoized for performance
  // offset: ["start start", "center start"] means:
  // - Animation starts when container top hits viewport top (scroll 0) → immediate!
  // - Animation ends when container center hits viewport top (scroll 100vh with 200vh container)
  // This gives exactly 100vh of animation distance while keeping container at 200vh for buffer
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "center start"],
  });

  // Forward scroll progress to hero image scale via direct DOM mutation (JS fallback)
  // Only runs when CSS scroll-driven animations are NOT supported
  useEffect(() => {
    if (cssScrollSupported) return;
    const unsubscribe = scrollYProgress.on("change", (progress: number) => {
      if (heroScaleRef.current) {
        const scale = 1 - progress * 0.15;
        heroScaleRef.current.style.transform = `scale(${scale}) translateZ(0)`;
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress, cssScrollSupported]);

  return (
    <>
      {/* Scroll container - height determines scroll distance for the overlay animation */}
      <div
        ref={containerRef}
        className="relative"
        style={{
          // 200vh total container height provides buffer space:
          //
          // Scroll 0-100vh: Animation runs
          //   - Bio slides from y=100vh (bottom edge) to y=0vh (fully visible)
          //   - offset ["start start", "center start"] ensures animation completes at 100vh
          //
          // Scroll 100-200vh: Bio stays visible
          //   - scrollYProgress maxed at 1, y stays at 0vh
          //   - Bio remains fixed at viewport top (doesn't disappear!)
          //
          // Scroll >200vh: Container ends, next section appears naturally
          height: "200vh",
          contain: "layout style paint",
        }}
      >
        {/* Fixed Hero Section - stays in place during scroll */}
        <div
          className="sticky top-0 h-screen w-full"
          style={{
            transform: "translateZ(0)",
          }}
        >
          <HeroSection
            scaleRef={cssScrollSupported ? undefined : heroScaleRef}
            cssScrollSupported={cssScrollSupported}
          />
        </div>

        {/* Bio Section - slides up from bottom based on scroll position */}
        {/* ABSOLUTE positioning within container - exits naturally when container ends */}
        {/* Positioned at top: 100vh (stays at document 100vh while viewport scrolls past) */}
        {/* Creating slide-up illusion as viewport scrolls */}
        <div
          className="absolute left-0 w-full h-screen"
          style={{
            top: "100vh",
            // Ensure bio appears above hero
            zIndex: 10,
            transform: "translateZ(0)",
          }}
        >
          <BioOverlay
            scrollProgress={scrollYProgress}
            cssScrollSupported={cssScrollSupported}
          />
        </div>
      </div>
    </>
  );
}
