"use client";

import { useRef, useState, useEffect, useCallback, memo, useMemo } from "react";
import { m, AnimatePresence } from "motion/react";
import { EyeIcon } from "lucide-react";
import Image from "next/image";
import { MediaRenderer } from "@/components/media";
import { Cursor } from "@/components/ui/cursor";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProjectVideoProps {
  videoUrl?: string | null;
  posterUrl?: string | null;
  alt?: string;
  url?: string | null;
}

// Static filter style for arrow GIFs - extracted to avoid recreation
const ARROW_FILTER_STYLE = {
  filter: "sepia(100%) saturate(300%) brightness(90%) hue-rotate(-10deg)",
  width: "auto",
  height: "auto",
} as const;

// Animation variants - extracted outside component to prevent recreation
const CURSOR_VARIANTS = {
  initial: { scale: 0.3, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.3, opacity: 0 },
} as const;

const CURSOR_SPRING_CONFIG = { bounce: 0.001 } as const;
const CURSOR_TRANSITION = { ease: "easeInOut" as const, duration: 0.15 };

/**
 * Hook for intersection observer visibility tracking
 */
function useVisibility(
  ref: React.RefObject<HTMLDivElement | null>,
  threshold = 0.5,
) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold, rootMargin: "50px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return isVisible;
}

/**
 * Hook to detect reduced motion preference
 */
function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

// Custom cursor component - memoized for performance
const HoverCursor = memo(function HoverCursor({
  isHovering,
}: {
  isHovering: boolean;
}) {
  return (
    <m.div
      animate={{
        width: isHovering ? 80 : 16,
        height: isHovering ? 32 : 16,
      }}
      className="flex items-center justify-center rounded-[24px] bg-primary/90 backdrop-blur-md will-change-transform"
    >
      <AnimatePresence>
        {isHovering && (
          <m.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="inline-flex w-full items-center justify-center"
          >
            <div className="inline-flex items-center text-sm text-primary-foreground font-medium">
              View <EyeIcon className="ml-1 h-4 w-4" />
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
});

// Left arrow indicator - memoized to prevent re-renders
const LeftArrowIndicator = memo(function LeftArrowIndicator() {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="absolute -left-4 top-24 md:-left-56 md:top-8 hidden lg:flex items-center justify-center pointer-events-none z-10 will-change-transform"
    >
      <span className="font-handwriting text-xl md:text-2xl font-medium text-primary whitespace-nowrap drop-shadow-[0_0_12px_hsl(var(--primary)/0.6)] mb-32 -mr-20">
        Check it out!
      </span>
      <Image
        src="/arrow-left.gif"
        alt=""
        width={120}
        height={120}
        className="drop-shadow-[0_0_8px_hsl(var(--primary))]"
        style={ARROW_FILTER_STYLE}
        unoptimized
        loading="lazy"
      />
    </m.div>
  );
});

// Right arrow indicator - memoized to prevent re-renders
const RightArrowIndicator = memo(function RightArrowIndicator() {
  return (
    <m.div
      initial={{ opacity: 0, y: -20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.4 }}
      className="absolute -right-4 top-1/2 md:-right-32 hidden lg:flex flex-col items-end justify-center gap-4 pointer-events-none z-10 will-change-transform"
    >
      <span className="font-handwriting text-xl md:text-2xl font-medium text-primary whitespace-nowrap drop-shadow-[0_0_12px_hsl(var(--primary)/0.6)] -mr-16">
        Click to visit
      </span>
      <Image
        src="/arrow.gif"
        alt=""
        width={120}
        height={120}
        className="drop-shadow-[0_0_8px_hsl(var(--primary))] rotate-[290deg]"
        style={ARROW_FILTER_STYLE}
        unoptimized
        loading="lazy"
      />
    </m.div>
  );
});

// Mobile arrow indicator - centered above video, only visible on mobile
const MobileArrowIndicator = memo(function MobileArrowIndicator() {
  return (
    <m.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="flex lg:hidden flex-col items-center justify-center pointer-events-none"
    >
      <span className="font-handwriting text-lg font-medium text-primary whitespace-nowrap drop-shadow-[0_0_12px_hsl(var(--primary)/0.6)]">
        Tap to visit
      </span>
      <Image
        src="/arrow-down.gif"
        alt=""
        width={80}
        height={80}
        className="drop-shadow-[0_0_8px_hsl(var(--primary))]"
        style={ARROW_FILTER_STYLE}
        unoptimized
        loading="lazy"
      />
    </m.div>
  );
});

export function ProjectVideo({
  videoUrl,
  posterUrl,
  alt,
  url,
}: ProjectVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const prefersReducedMotion = useReducedMotion();
  const isVisible = useVisibility(containerRef, 0.3);

  // Memoized floating animation config
  const floatingAnimation = useMemo(
    () => (url && !prefersReducedMotion ? { y: [0, -15, 0] } : {}),
    [url, prefersReducedMotion],
  );

  const floatingTransition = useMemo(
    () => ({
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" as const,
    }),
    [],
  );

  // Handle cursor position for hover state
  const handlePositionChange = useCallback((x: number, y: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const isInside =
        x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      setIsHovering(isInside);
    }
  }, []);

  // Handle click to open URL
  const handleClick = useCallback(() => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }, [url]);

  // Handle keyboard interaction
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  // Memoized error handler
  const handleError = useCallback(() => setHasError(true), []);

  // Early returns for null states
  if (!videoUrl || hasError) {
    return null;
  }

  const hasInteractiveUrl = Boolean(url);
  const showAnimations = hasInteractiveUrl && !prefersReducedMotion;

  return (
    <section className="py-24 bg-background">
      <div className="max-w-4xl mx-auto px-2">
        <div className="relative">
          {/* Custom cursor - only show if there's a URL */}
          {hasInteractiveUrl && (
            <Cursor
              attachToParent
              variants={CURSOR_VARIANTS}
              springConfig={CURSOR_SPRING_CONFIG}
              transition={CURSOR_TRANSITION}
              onPositionChange={handlePositionChange}
            >
              <HoverCursor isHovering={isHovering} />
            </Cursor>
          )}

          {/* Video container with Floating Animation */}
          <m.div
            animate={floatingAnimation}
            transition={floatingTransition}
            className="relative will-change-transform"
          >
            {/* Mobile arrow indicator - above video */}
            {showAnimations && <MobileArrowIndicator />}

            {/* Arrow indicators - desktop only */}
            {showAnimations && <LeftArrowIndicator />}
            {showAnimations && <RightArrowIndicator />}

            <div
              ref={containerRef}
              className="relative w-full rounded-lg overflow-hidden shadow-2xl border border-border/30 hover:shadow-primary/20 transition-shadow duration-500"
              style={{ cursor: hasInteractiveUrl ? "none" : "default" }}
              {...(hasInteractiveUrl
                ? {
                    role: "button" as const,
                    tabIndex: 0,
                    onClick: handleClick,
                    onKeyDown: handleKeyDown,
                    "aria-label": `View ${alt || "project"} website`,
                  }
                : {})}
            >
              <MediaRenderer
                src={videoUrl}
                type="video"
                poster={posterUrl || undefined}
                alt={alt || "Project showcase video"}
                aspectRatio="16/9"
                autoPlay={isVisible && !prefersReducedMotion}
                muted
                loop
                className="w-full"
                onError={handleError}
              />
            </div>
          </m.div>
        </div>
      </div>
    </section>
  );
}
