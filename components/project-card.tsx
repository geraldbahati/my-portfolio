"use client";

import { memo, useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { m, AnimatePresence } from "motion/react";
import { EyeIcon } from "lucide-react";
import { Cursor } from "@/components/ui/cursor";
import { MediaRenderer } from "@/components/media";
import { parseAspectRatio } from "@/lib/media-utils";
import Analytics from "@/lib/analytics";
import { useMediaQuery } from "@/hooks/use-media-query";

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

const EMPTY_BADGES: NonNullable<ProjectCardProps["badges"]> = [];

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to detect reduced motion preference
 */
function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

function useIsMobile(breakpoint = 768): boolean {
  return useMediaQuery(`(max-width: ${breakpoint}px)`);
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
    <m.div
      animate={{
        width: isHovering ? 80 : 16,
        height: isHovering ? 32 : 16,
      }}
      className="flex items-center justify-center rounded-[24px] bg-black/90 backdrop-blur-md"
    >
      <AnimatePresence>
        {isHovering && (
          <m.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="inline-flex w-full items-center justify-center"
          >
            <div className="inline-flex items-center text-sm text-white font-medium">
              View <EyeIcon className="ml-1 h-4 w-4" />
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
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
    <m.div
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
    </m.div>
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
    <m.div
      className="absolute top-4 left-4 z-10"
      initial={{ y: -10, opacity: 0.8 }}
      animate={{
        y: isHovered ? 0 : -10,
        opacity: isHovered ? 1 : 0.8,
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <h2 className="text-white text-lg font-semibold px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm">
        {title}
      </h2>
    </m.div>
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
  badges = EMPTY_BADGES,
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

  // Track visibility for analytics and video play/pause
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

  // Handle card click - track analytics
  const handleClick = useCallback(() => {
    Analytics.trackButtonClick(title || `Project ${id}`, "Project Card");
    onClick?.();
  }, [id, title, onClick]);

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
    <Link href={`/projects/${id}`} className="block relative" prefetch={true}>
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
      <m.div
        ref={containerRef}
        id={id}
        className={`relative overflow-hidden rounded-lg bg-gray-900 ${className}`}
        style={{
          ...aspectRatioStyle,
          ...style,
        }}
        role="article"
        aria-label={title || `Project ${id}`}
        onClick={handleClick}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileTap={{ scale: 0.98 }}
      >
        {/* Media content with grayscale animation */}
        <m.div
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
        </m.div>

        {/* Hover overlay gradient */}
        <m.div
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
            key={`${id}-badge-${badge.text}`}
            text={badge.text}
            position={badge.position || "bottom-left"}
            isHovered={isHovered}
            index={index}
          />
        ))}
      </m.div>
    </Link>
  );
}

export const ProjectCard = memo(ProjectCardComponent);
export default ProjectCard;
