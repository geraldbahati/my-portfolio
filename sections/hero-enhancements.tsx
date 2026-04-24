"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import dynamic from "next/dynamic";
import { AdaptiveLink } from "@/components/AdaptiveLink";
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

type PortalTargets = {
  gridSlot: Element | null;
  namePortal: Element | null;
  ctaPortal: Element | null;
};

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
    <AdaptiveLink
      href="/contact"
      prefetchOnViewport
      prefetchRootMargin="150px"
      onClick={() =>
        Analytics.trackButtonClick("Request a project", "Hero CTA")
      }
      className="inline-block pointer-events-auto"
    >
      <span
        className={`shrink-0 cursor-pointer relative inline-block border-b transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${
          isHovered ? "border-primary" : "border-muted-foreground/50"
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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
      </span>
    </AdaptiveLink>
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

  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)",
  );

  const portalTargets = useMemo<PortalTargets>(
    () => ({
      gridSlot: document.querySelector("[data-grid-pattern-slot]"),
      namePortal: document.querySelector("[data-hero-name-portal]"),
      ctaPortal: document.querySelector("[data-hero-cta-portal]"),
    }),
    [],
  );

  useEffect(() => {
    const nameStatic = document.querySelector("[data-hero-name-static]");
    const ctaStatic = document.querySelector("[data-hero-cta-static]");

    if (nameStatic instanceof HTMLElement) {
      nameStatic.style.display = "none";
    }
    if (portalTargets.namePortal instanceof HTMLElement) {
      portalTargets.namePortal.classList.remove("hidden");
    }

    if (ctaStatic instanceof HTMLElement) {
      ctaStatic.style.display = "none";
    }
    if (portalTargets.ctaPortal instanceof HTMLElement) {
      portalTargets.ctaPortal.classList.remove("hidden");
    }

    if (prefersReducedMotion) {
      return () => {
        if (nameStatic instanceof HTMLElement) {
          nameStatic.style.removeProperty("display");
        }
        if (portalTargets.namePortal instanceof HTMLElement) {
          portalTargets.namePortal.classList.add("hidden");
        }
        if (ctaStatic instanceof HTMLElement) {
          ctaStatic.style.removeProperty("display");
        }
        if (portalTargets.ctaPortal instanceof HTMLElement) {
          portalTargets.ctaPortal.classList.add("hidden");
        }
      };
    }

    const timer = window.setTimeout(() => {
      setNameScrambling(false);
    }, 800);

    return () => {
      window.clearTimeout(timer);

      if (nameStatic instanceof HTMLElement) {
        nameStatic.style.removeProperty("display");
      }
      if (portalTargets.namePortal instanceof HTMLElement) {
        portalTargets.namePortal.classList.add("hidden");
      }
      if (ctaStatic instanceof HTMLElement) {
        ctaStatic.style.removeProperty("display");
      }
      if (portalTargets.ctaPortal instanceof HTMLElement) {
        portalTargets.ctaPortal.classList.add("hidden");
      }
    };
  }, [portalTargets, prefersReducedMotion]);

  const { ctaPortal, gridSlot, namePortal } = portalTargets;
  const shouldScrambleName = nameScrambling && !prefersReducedMotion;

  return (
    <>
      {/* GridPattern → portaled into empty [data-grid-pattern-slot] */}
      {!prefersReducedMotion && gridSlot &&
        createPortal(
          <GridPattern
            className="absolute inset-0"
            gridClassName="stroke-current/10"
            width={32}
            height={32}
            surroundingCells={4}
            surroundingRadius={1}
          />,
          gridSlot,
        )}

      {/* TextScramble name → portaled into [data-hero-name-portal] */}
      {namePortal &&
        createPortal(
          <span
            className={`transition-[filter] duration-700 ease-out ${
              shouldScrambleName ? "blur-[1px]" : "blur-0"
            }`}
          >
            <TextScramble
              key={shouldScrambleName ? "scrambling" : "stopped"}
              className="text-xs sm:text-sm lg:text-base font-light text-primary tracking-[0.2em] sm:tracking-[0.3em] uppercase"
              trigger={shouldScrambleName}
              duration={ANIMATION_DURATIONS.NAME_SCRAMBLE}
              speed={ANIMATION_DURATIONS.NAME_SCRAMBLE_SPEED}
              as="span"
            >
              Gerald Bahati
            </TextScramble>
          </span>,
          namePortal,
        )}

      {/* TextScramble CTA → portaled into [data-hero-cta-portal] */}
      {ctaPortal &&
        createPortal(
          <TextScrambleHoverTrigger />,
          ctaPortal,
        )}
    </>
  );
}
