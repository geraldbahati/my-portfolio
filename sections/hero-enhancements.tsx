"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import Link from "next/link";
import Analytics from "@/lib/analytics";
import { useMediaQuery } from "@/hooks/use-media-query";

const GridPattern = dynamic(
  () => import("@/components/ui/shadcn-io/grid-pattern"),
  { ssr: false, loading: () => null },
);
const TextScramble = dynamic(
  () =>
    import("@/components/ui/text-scramble").then((mod) => ({
      default: mod.TextScramble,
    })),
  { ssr: false, loading: () => null },
);

const ANIMATION_DURATIONS = {
  NAME_SCRAMBLE: 500,
  NAME_SCRAMBLE_SPEED: 0.05,
  HOVER_SCRAMBLE: 500,
  HOVER_SCRAMBLE_SPEED: 0.04,
} as const;

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
        className={`shrink-0 cursor-pointer relative inline-block border-b transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
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

/**
 * HeroEnhancements - Progressive enhancements for the hero section.
 *
 * Uses sibling-swap pattern: server renders static content + hidden portal divs.
 * On mount, this component hides the static content, shows the portal divs,
 * and portals enhanced content into them.
 */
export default function HeroEnhancements() {
  const [nameScrambling, setNameScrambling] = useState(true);
  const [mounted, setMounted] = useState(false);
  const gridSlotRef = useRef<Element | null>(null);
  const namePortalRef = useRef<Element | null>(null);
  const ctaPortalRef = useRef<Element | null>(null);

  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)",
  );

  useEffect(() => {
    // Find portal targets
    gridSlotRef.current = document.querySelector("[data-grid-pattern-slot]");
    namePortalRef.current = document.querySelector("[data-hero-name-portal]");
    ctaPortalRef.current = document.querySelector("[data-hero-cta-portal]");

    // Hide static content, show portal containers
    const nameStatic = document.querySelector("[data-hero-name-static]");
    const ctaStatic = document.querySelector("[data-hero-cta-static]");

    if (nameStatic) (nameStatic as HTMLElement).style.display = "none";
    if (namePortalRef.current) (namePortalRef.current as HTMLElement).classList.remove("hidden");

    if (ctaStatic) (ctaStatic as HTMLElement).style.display = "none";
    if (ctaPortalRef.current) (ctaPortalRef.current as HTMLElement).classList.remove("hidden");

    setMounted(true);

    if (prefersReducedMotion) return;
    const timer = setTimeout(() => {
      setNameScrambling(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  if (!mounted) return null;

  return (
    <>
      {/* GridPattern → portaled into empty [data-grid-pattern-slot] */}
      {!prefersReducedMotion && gridSlotRef.current &&
        createPortal(
          <GridPattern
            className="absolute inset-0"
            gridClassName="stroke-current/10"
            width={32}
            height={32}
            surroundingCells={4}
            surroundingRadius={1}
          />,
          gridSlotRef.current,
        )}

      {/* TextScramble name → portaled into [data-hero-name-portal] */}
      {namePortalRef.current &&
        createPortal(
          <span
            className={`transition-[filter] duration-700 ease-out ${
              nameScrambling && !prefersReducedMotion
                ? "blur-[1px]"
                : "blur-0"
            }`}
          >
            <TextScramble
              key={
                nameScrambling && !prefersReducedMotion
                  ? "scrambling"
                  : "stopped"
              }
              className="text-xs sm:text-sm lg:text-base font-light text-primary tracking-[0.2em] sm:tracking-[0.3em] uppercase"
              trigger={nameScrambling && !prefersReducedMotion}
              duration={ANIMATION_DURATIONS.NAME_SCRAMBLE}
              speed={ANIMATION_DURATIONS.NAME_SCRAMBLE_SPEED}
              as="span"
            >
              Gerald Bahati
            </TextScramble>
          </span>,
          namePortalRef.current,
        )}

      {/* TextScramble CTA → portaled into [data-hero-cta-portal] */}
      {ctaPortalRef.current &&
        createPortal(
          <TextScrambleHoverTrigger />,
          ctaPortalRef.current,
        )}
    </>
  );
}
