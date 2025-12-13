"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Analytics from "@/lib/analytics";

// Lazy load heavy components
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
    loading: () => <span>Projekt anfragen</span>,
  },
);

// Animation timing constants
const ANIMATION_DURATIONS = {
  HOVER_SCRAMBLE: 500,
  HOVER_SCRAMBLE_SPEED: 0.04,
} as const;

// Memoized CTA Button with TextScramble effect
const CTAButton = memo(() => {
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
      onClick={() =>
        Analytics.trackButtonClick("Projekt anfragen", "Project CTA")
      }
      className="inline-block"
    >
      <div
        className={`flex-shrink-0 cursor-pointer relative inline-block border-b transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
          isHovered ? "border-primary" : "border-white/50"
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role="button"
        tabIndex={0}
        aria-label="Projekt anfragen"
      >
        <TextScramble
          className="text-white font-light text-sm sm:text-base uppercase tracking-[0.2em]"
          trigger={shouldTrigger}
          duration={ANIMATION_DURATIONS.HOVER_SCRAMBLE}
          speed={ANIMATION_DURATIONS.HOVER_SCRAMBLE_SPEED}
          onScrambleComplete={handleScrambleComplete}
          as="span"
        >
          Request a Project
        </TextScramble>
      </div>
    </Link>
  );
});

CTAButton.displayName = "CTAButton";

export function ProjectCTA() {
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    setMounted(true);
  }, []);

  return (
    <section className="relative bg-black text-white py-24 md:py-32 overflow-hidden">
      {/* Grid Pattern Background */}
      {mounted && !prefersReducedMotion && (
        <GridPattern
          className="absolute inset-0 z-0"
          gridClassName="stroke-current/10"
          width={32}
          height={32}
          surroundingCells={4}
          surroundingRadius={1}
        />
      )}

      {/* Content */}
      <div className="relative z-10 w-full flex justify-center px-4">
        <div className="max-w-2xl space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Would you like to be featured here as well?
          </h2>

          <p className="text-base md:text-lg text-white/70">
            Feel free to use the contact form or other contact options.
          </p>

          <div className="pt-4">
            <CTAButton />
          </div>
        </div>
      </div>
    </section>
  );
}
