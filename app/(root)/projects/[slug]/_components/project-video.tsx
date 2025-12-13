"use client";

import { useRef, useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EyeIcon } from "lucide-react";
import { MediaRenderer } from "@/components/media";
import { Cursor } from "@/components/ui/cursor";

interface ProjectVideoProps {
  videoUrl?: string | null;
  posterUrl?: string | null;
  alt?: string;
  url?: string | null; // External link URL
}

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
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(query.matches);

    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

// Custom cursor component with "View" text
const HoverCursor = memo(function HoverCursor({
  isHovering,
}: {
  isHovering: boolean;
}) {
  return (
    <motion.div
      animate={{
        width: isHovering ? 80 : 16,
        height: isHovering ? 32 : 16,
      }}
      className="flex items-center justify-center rounded-[24px] bg-black/90 backdrop-blur-md"
    >
      <AnimatePresence>
        {isHovering && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="inline-flex w-full items-center justify-center"
          >
            <div className="inline-flex items-center text-sm text-white font-medium">
              View <EyeIcon className="ml-1 h-4 w-4" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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

  // Don't render if no video URL
  if (!videoUrl) {
    return null;
  }

  // Show nothing on error
  if (hasError) {
    return null;
  }

  return (
    <section className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-4">
        <div className="relative">
          {/* Custom cursor - only show if there's a URL */}
          {url && (
            <Cursor
              attachToParent
              variants={{
                initial: { scale: 0.3, opacity: 0 },
                animate: { scale: 1, opacity: 1 },
                exit: { scale: 0.3, opacity: 0 },
              }}
              springConfig={{ bounce: 0.001 }}
              transition={{ ease: "easeInOut", duration: 0.15 }}
              onPositionChange={handlePositionChange}
            >
              <HoverCursor isHovering={isHovering} />
            </Cursor>
          )}

          {/* Video container */}
          <div
            ref={containerRef}
            role={url ? "button" : undefined}
            tabIndex={url ? 0 : undefined}
            onClick={url ? handleClick : undefined}
            onKeyDown={url ? handleKeyDown : undefined}
            className="relative w-full rounded-lg overflow-hidden shadow-lg border border-border/30 animate-in fade-in slide-in-from-bottom-4 duration-700"
            style={{ cursor: url ? "none" : "default" }}
            aria-label={url ? `View ${alt || "project"} website` : undefined}
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
              onError={() => setHasError(true)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
