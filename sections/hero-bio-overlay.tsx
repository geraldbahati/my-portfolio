"use client";

import { useRef } from "react";
import { useScroll } from "framer-motion";
import HeroSection from "@/sections/hero";
import BioOverlay from "@/sections/bio-overlay";

/**
 * HeroBioOverlay Component
 *
 * This component creates a scroll-triggered overlay effect where:
 * - The hero section remains fixed in place
 * - The bio section slides up from the bottom as the user scrolls
 * - The bio section's position is directly tied to scroll progress
 * - Animation is smooth and performance-optimized using Framer Motion
 */
export default function HeroBioOverlay() {
  // Reference to the scroll container that triggers the animation
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress within the container - Memoized for performance
  // offset: ["start start", "center start"] means:
  // - Animation starts when container top hits viewport top (scroll 0) → immediate!
  // - Animation ends when container center hits viewport top (scroll 100vh with 200vh container)
  // This gives exactly 100vh of animation distance while keeping container at 200vh for buffer
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "center start"],
  });

  // useTransform is already optimized internally by Framer Motion
  // No need to memoize - it handles its own caching

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
        }}
      >
        {/* Fixed Hero Section - stays in place during scroll */}
        <div className="sticky top-0 h-screen w-full">
          <HeroSection scrollProgress={scrollYProgress} />
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
          }}
        >
          <BioOverlay scrollProgress={scrollYProgress} />
        </div>
      </div>
    </>
  );
}
