"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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

  // Track scroll progress within the container
  // offset: ["start start", "center start"] means:
  // - Animation starts when container top hits viewport top (scroll 0) → immediate!
  // - Animation ends when container center hits viewport top (scroll 100vh with 200vh container)
  // This gives exactly 100vh of animation distance while keeping container at 200vh for buffer
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "center start"],
  });

  // Transform scroll progress (0 to 1) into Y position for bio section
  // Bio is absolutely positioned at top: 0vh within the container
  // Transform pushes it down initially, keeps it at perfect position for reveal
  //
  // Start (scroll 0vh, scrollYProgress = 0):
  //   - top: 0vh + y: 100vh = document position 100vh
  //   - Viewport shows [0, 100vh], bio top at 100vh (bottom edge of viewport)
  //   - Immediate visibility - bio starts sliding up on first scroll pixel! ✓
  //
  // Mid (scroll 50vh, scrollYProgress = 0.5):
  //   - top: 0vh + y: 100vh = document position 100vh (bio stays at same position)
  //   - Viewport shows [50vh, 150vh], bio entering viewport from bottom ✓
  //
  // End (scroll 100vh, scrollYProgress = 1):
  //   - top: 0vh + y: 100vh = document position 100vh
  //   - Viewport shows [100vh, 200vh], bio at [100vh, 200vh] = fully visible! ✓
  //
  // Bio stays stationary at 100vh, viewport scrolling creates the "slide up" effect!
  const bioY = useTransform(scrollYProgress, [0, 1], ["100vh", "100vh"]);

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
        {/* Positioned at top: 0, pushed down via transform to 100vh */}
        {/* Stays at document 100vh while viewport scrolls past - creating slide-up illusion */}
        <motion.div
          className="absolute left-0 w-full h-screen will-change-transform"
          style={{
            top: 0,
            y: bioY,
            // Ensure bio appears above hero
            zIndex: 10,
          }}
        >
          <BioOverlay scrollProgress={scrollYProgress} />
        </motion.div>
      </div>
    </>
  );
}
