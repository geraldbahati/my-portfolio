"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { MotionValue } from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import Analytics from "@/lib/analytics";

// Lazy load heavy components with loading optimization
const GridPattern = dynamic(
  () => import("@/components/ui/shadcn-io/grid-pattern"),
  {
    ssr: false,
    loading: () => null,
  },
);
const TextScramble = dynamic(
  () =>
    import("@/components/ui/text-scramble").then((mod) => ({
      default: mod.TextScramble,
    })),
  {
    ssr: false,
    loading: () => null,
  },
);

// Animation timing constants
const ANIMATION_DURATIONS = {
  NAME_SCRAMBLE: 500,
  NAME_SCRAMBLE_SPEED: 0.05,
  HOVER_SCRAMBLE: 500,
  HOVER_SCRAMBLE_SPEED: 0.04,
} as const;

// Memoized CTA component with optimized hover handling
const TextScrambleHoverTrigger = memo(() => {
  const [isHovered, setIsHovered] = useState(false);
  const [shouldTrigger, setShouldTrigger] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const scrambleTimeoutRef = useRef<NodeJS.Timeout>(null);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (!hasTriggered) {
      setHasTriggered(true);
      setShouldTrigger(true);
      scrambleTimeoutRef.current = setTimeout(() => {
        setShouldTrigger(false);
      }, ANIMATION_DURATIONS.HOVER_SCRAMBLE);
    }
  }, [hasTriggered]);

  const handleMouseLeave = useCallback(() => {
    if (scrambleTimeoutRef.current) {
      clearTimeout(scrambleTimeoutRef.current);
    }
    setIsHovered(false);
    setShouldTrigger(false);
    setHasTriggered(false);
  }, []);

  const handleScrambleComplete = useCallback(() => {
    setShouldTrigger(false);
  }, []);

  useEffect(() => {
    return () => {
      if (scrambleTimeoutRef.current) {
        clearTimeout(scrambleTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Link
      href="/contact"
      prefetch={true}
      onClick={() =>
        Analytics.trackButtonClick("Request a project", "Hero CTA")
      }
      className="inline-block pointer-events-auto"
    >
      <div
        className={`flex-shrink-0 cursor-pointer relative inline-block border-b transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
          isHovered ? "border-primary" : "border-muted-foreground/50"
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="button"
        tabIndex={0}
        aria-label="Request a project"
      >
        <TextScramble
          className="text-white font-light text-sm sm:text-base uppercase tracking-[0.2em]"
          trigger={shouldTrigger}
          duration={ANIMATION_DURATIONS.HOVER_SCRAMBLE}
          speed={ANIMATION_DURATIONS.HOVER_SCRAMBLE_SPEED}
          onScrambleComplete={handleScrambleComplete}
          as="span"
        >
          Request a project
        </TextScramble>
      </div>
    </Link>
  );
});

TextScrambleHoverTrigger.displayName = "TextScrambleHoverTrigger";

interface HeroSectionProps {
  scrollProgress?: MotionValue<number>;
}

export default function HeroSection({ scrollProgress }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);
  const [nameScrambling, setNameScrambling] = useState(false);
  const [imageScale, setImageScale] = useState(1);
  const stopScrambleTimeoutRef = useRef<NodeJS.Timeout>(null);

  // Check for reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    setMounted(true);

    // Start scramble, then stop after 800ms
    if (!mediaQuery.matches) {
      setNameScrambling(true);
      stopScrambleTimeoutRef.current = setTimeout(() => {
        setNameScrambling(false);
      }, 800);
    } else {
      setNameScrambling(false);
    }

    // Subscribe to scroll progress for image scaling
    let unsubscribe: (() => void) | undefined;
    if (scrollProgress && !mediaQuery.matches) {
      unsubscribe = scrollProgress.on("change", (progress: number) => {
        // Scale from 1 to 0.85 as user scrolls (0 to 1)
        const newScale = 1 - progress * 0.15;
        setImageScale(newScale);
      });
      // Set initial value
      setImageScale(1 - scrollProgress.get() * 0.15);
    }

    return () => {
      if (stopScrambleTimeoutRef.current) {
        clearTimeout(stopScrambleTimeoutRef.current);
      }
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [scrollProgress]);

  return (
    <section
      className="relative min-h-screen overflow-hidden bg-hero-bg"
      style={{
        contain: "layout style paint",
      }}
      role="banner"
    >
      {/* Profile Background Image - scales on scroll */}
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <div
          className="relative w-full h-full transition-transform duration-100 ease-out"
          style={{
            transform: `scale(${imageScale}) translateZ(0)`,
          }}
        >
          <Image
            src="/habibi.png"
            alt="Gerald Bahati - Product Software Engineer"
            fill
            priority
            fetchPriority="high"
            className="object-cover sm:object-contain sm:mix-blend-screen"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 100vw, 1920px"
            quality={60}
          />
        </div>
      </div>

      {/* Edge Fade Overlay - Gentle vignette effect */}
      <div
        className="absolute inset-0 z-[5]"
        style={{
          background:
            "linear-gradient(to right, var(--hero-overlay) 0%, transparent 20%, transparent 80%, var(--hero-overlay) 100%)",
        }}
      />
      <div
        className="absolute inset-0 z-[5]"
        style={{
          background:
            "linear-gradient(to bottom, var(--hero-overlay) 0%, transparent 20%, transparent 80%, var(--hero-overlay) 100%)",
        }}
      />

      {/* Grid Pattern Background */}
      {mounted && !prefersReducedMotion && (
        <GridPattern
          className="absolute inset-0 z-10"
          gridClassName="stroke-current/10"
          width={32}
          height={32}
          surroundingCells={4}
          surroundingRadius={1}
        />
      )}

      {/* Hero Content - Renders immediately for fast LCP */}
      <div className="relative z-10 min-h-screen flex items-end justify-center lg:justify-end px-4 sm:px-6 lg:px-8 sm:pb-12 pb-16 pointer-events-none">
        <div className="w-full max-w-7xl mx-auto text-center lg:text-left">
          {/* Name section - Single render with CSS animation + TextScramble */}
          <div className="mb-8 overflow-hidden">
            <div
              className={`reveal-up transition-[filter] duration-700 ease-out ${
                nameScrambling ? "blur-[1px]" : "blur-0"
              }`}
            >
              <TextScramble
                key={nameScrambling ? "scrambling" : "stopped"}
                className="text-xs sm:text-sm lg:text-base font-light text-primary tracking-[0.2em] sm:tracking-[0.3em] uppercase"
                trigger={nameScrambling}
                duration={ANIMATION_DURATIONS.NAME_SCRAMBLE}
                speed={ANIMATION_DURATIONS.NAME_SCRAMBLE_SPEED}
                as="p"
              >
                Gerald Bahati
              </TextScramble>
            </div>
          </div>

          {/* Main Title - Clip reveal animation (text slides up together from greater distance) */}
          <div className="mb-8 sm:mb-10 lg:mb-12">
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-thin leading-tight sm:leading-none tracking-tight grid-interaction-blocked pointer-events-auto text-white"
              style={{ fontSize: "clamp(2.25rem, 8vw, 6rem)" }}
            >
              {/* "Product" with clip reveal */}
              <span className="inline-block overflow-hidden align-bottom">
                <span className="inline-block font-medium reveal-up-title">
                  Product
                </span>
              </span>
              {/* "/" separator with clip reveal */}
              <span className="inline-block overflow-hidden align-bottom">
                <span
                  className="inline-block mx-2 sm:mx-3 reveal-up-title text-white"
                  aria-hidden="true"
                >
                  /
                </span>
              </span>
              {/* "Software Engineer" with clip reveal - same timing */}
              <span className="inline-block overflow-hidden align-bottom">
                <span className="inline-block text-transparent [text-stroke:1px_white] [-webkit-text-stroke:1px_white] reveal-up-title italic pr-[0.15em]">
                  Software Engineer
                </span>
              </span>
            </h1>
          </div>

          {/* Description and CTA - Centered on mobile, row on large */}
          <div className="flex flex-col items-center lg:items-start lg:flex-row lg:justify-between gap-6 sm:gap-8">
            {/* Description with clip reveal */}
            <div className="max-w-xl lg:max-w-2xl overflow-hidden">
              <p className="text-sm sm:text-base lg:text-lg text-muted-foreground font-light leading-relaxed tracking-wide grid-interaction-blocked pointer-events-auto reveal-up">
                4+ years shipping production e-commerce and fintech experiences
                with secure Stripe & M-Pesa payments and scalable real-time
                architectures.
              </p>
            </div>

            {/* CTA Text with clip reveal - Single render */}
            <div className="flex-shrink-0 overflow-hidden">
              <div className="reveal-up">
                <TextScrambleHoverTrigger />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
