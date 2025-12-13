"use client";

import { memo, useRef, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { EyeIcon } from "lucide-react";
import { Cursor } from "@/components/ui/cursor";
import { MediaRenderer } from "@/components/media";
import { parseAspectRatio } from "@/lib/media-utils";
import Analytics from "@/lib/analytics";

// ============================================================================
// Types
// ============================================================================

export interface ProjectCardProps {
  id: string;
  src: string;
  type: "video" | "gif";
  poster?: string;
  alt?: string;
  title?: string;
  url?: string;
  badges?: {
    text: string;
    position?: "bottom-left" | "bottom-right";
  }[];
  aspectRatio?: string | number;
  className?: string;
  style?: React.CSSProperties;
  onVisible?: (visible: boolean) => void;
  onClick?: () => void;
}

// ============================================================================
// Hooks
// ============================================================================

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

/**
 * Hook to detect mobile viewport
 */
function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${breakpoint}px)`);
    setIsMobile(query.matches);

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, [breakpoint]);

  return isMobile;
}

/**
 * Hook for intersection observer visibility tracking
 */
function useVisibility(
  ref: React.RefObject<HTMLElement | null>,
  options: {
    threshold?: number;
    rootMargin?: string;
    onVisible?: (visible: boolean) => void;
  } = {},
) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const visible = entry.isIntersecting;
          setIsVisible(visible);
          options.onVisible?.(visible);
        });
      },
      {
        threshold: options.threshold ?? 0.2,
        rootMargin: options.rootMargin ?? "50px",
      },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, options.threshold, options.rootMargin, options.onVisible]);

  return isVisible;
}

// ============================================================================
// Sub-components
// ============================================================================

interface HoverCursorProps {
  isHovering: boolean;
}

const HoverCursor = memo(function HoverCursor({
  isHovering,
}: HoverCursorProps) {
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

interface BadgeProps {
  text: string;
  position: "bottom-left" | "bottom-right";
  isHovered: boolean;
  index: number;
}

const Badge = memo(function Badge({
  text,
  position,
  isHovered,
  index,
}: BadgeProps) {
  const positionClasses =
    position === "bottom-right" ? "bottom-4 right-4" : "bottom-4 left-4";

  return (
    <motion.div
      className={`absolute ${positionClasses} z-10`}
      initial={{ y: 10, opacity: 0.7, scale: 0.95 }}
      animate={{
        y: isHovered ? 0 : 10,
        opacity: isHovered ? 1 : 0.7,
        scale: isHovered ? 1 : 0.95,
      }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
        delay: index * 0.05,
      }}
    >
      <span className="inline-block bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
        {text}
      </span>
    </motion.div>
  );
});

interface TitleOverlayProps {
  title: string;
  isHovered: boolean;
}

const TitleOverlay = memo(function TitleOverlay({
  title,
  isHovered,
}: TitleOverlayProps) {
  return (
    <motion.div
      className="absolute top-4 left-4 right-4 z-10"
      initial={{ y: -10, opacity: 0.8 }}
      animate={{
        y: isHovered ? 0 : -10,
        opacity: isHovered ? 1 : 0.8,
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <h2 className="text-white text-lg font-semibold drop-shadow-lg">
        {title}
      </h2>
    </motion.div>
  );
});

// ============================================================================
// Main Component
// ============================================================================

function ProjectCardComponent({
  id,
  src,
  type,
  poster,
  alt = "",
  title,
  url,
  badges = [],
  aspectRatio = "16/9",
  className = "",
  style,
  onVisible,
  onClick,
}: ProjectCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasTrackedView = useRef(false);

  const [isHovered, setIsHovered] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hasError, setHasError] = useState(false);

  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  // Track visibility for analytics
  const isVisible = useVisibility(containerRef, {
    threshold: 0.2,
    rootMargin: "50px",
    onVisible: useCallback(
      (visible: boolean) => {
        onVisible?.(visible);

        if (visible && !hasTrackedView.current) {
          hasTrackedView.current = true;
          Analytics.trackMediaInteraction({
            mediaType: type === "video" ? "video" : "image",
            action: "view",
            mediaId: id,
          });
        }
      },
      [id, type, onVisible],
    ),
  });

  // Calculate aspect ratio style
  const { ratio } = parseAspectRatio(aspectRatio);
  const aspectRatioStyle = { aspectRatio: `${ratio}` };

  // Handle cursor position for hover state
  const handlePositionChange = useCallback((x: number, y: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const isInside =
        x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      setIsHovering(isInside);
    }
  }, []);

  // Handle card click - navigate to project details page
  const router = useRouter();
  const handleClick = useCallback(() => {
    Analytics.trackButtonClick(title || `Project ${id}`, "Project Card");

    // Navigate to project details page
    router.push(`/projects/${id}`);

    onClick?.();
  }, [id, title, router, onClick]);

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

  // Animation variants
  const mediaVariants = {
    initial: {
      filter: prefersReducedMotion || isMobile ? "none" : "grayscale(100%)",
    },
    hover: {
      filter: "grayscale(0%)",
    },
  };

  return (
    <div className="relative">
      {/* Custom cursor */}
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

      {/* Card container */}
      <motion.div
        ref={containerRef}
        id={id}
        className={`relative overflow-hidden rounded-lg bg-gray-900 ${className}`}
        style={{
          ...aspectRatioStyle,
          ...style,
        }}
        role="article"
        aria-label={title || `Project ${id}`}
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileTap={{ scale: 0.98 }}
      >
        {/* Media content with grayscale animation */}
        <motion.div
          className="absolute inset-0"
          variants={mediaVariants}
          initial="initial"
          animate={isHovered ? "hover" : "initial"}
        >
          {hasError ? (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <span className="text-gray-400">Media unavailable</span>
            </div>
          ) : (
            <MediaRenderer
              src={prefersReducedMotion ? poster || src : src}
              type={prefersReducedMotion ? "image" : type}
              poster={poster}
              alt={alt || title || `Project ${id}`}
              aspectRatio={aspectRatio}
              autoPlay={isVisible && !prefersReducedMotion}
              muted
              loop
              className="absolute inset-0"
              onError={() => setHasError(true)}
            />
          )}
        </motion.div>

        {/* Hover overlay gradient */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Title */}
        {title && <TitleOverlay title={title} isHovered={isHovered} />}

        {/* Badges */}
        {badges.map((badge, index) => (
          <Badge
            key={`${id}-badge-${index}`}
            text={badge.text}
            position={badge.position || "bottom-left"}
            isHovered={isHovered}
            index={index}
          />
        ))}
      </motion.div>
    </div>
  );
}

export const ProjectCard = memo(ProjectCardComponent);
export default ProjectCard;
