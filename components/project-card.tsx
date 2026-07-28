"use client";

import { useRef, useState, useEffect } from "react";
import { m } from "motion/react";
import { Cursor } from "@/components/ui/cursor";
import { MediaRenderer } from "@/components/media";
import { parseAspectRatio } from "@/lib/media-utils";
import {
  trackProjectCardViewed,
  trackProjectOpened,
  type Surface,
} from "@/lib/analytics";
import { useMediaQuery } from "@/hooks/use-media-query";
import { AdaptiveLink } from "@/components/AdaptiveLink";
import { warmImages } from "@/lib/resource-warmup";
import {
  ProjectCardBadge,
  ProjectCardHoverCursor,
  ProjectCardLiveLink,
  ProjectCardTitleOverlay,
} from "@/components/project-card-overlays";

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
  playbackEnabled?: boolean;
  freezeFrameOnPause?: boolean;
  onVisible?: (visible: boolean) => void;
  onClick?: () => void;
  /** Where this card is rendered, so card views and opens can be compared. */
  surface?: Surface;
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
  const { onVisible, rootMargin, threshold } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const visible = entry.isIntersecting;
          setIsVisible(visible);
          onVisible?.(visible);
        });
      },
      {
        threshold: threshold ?? 0.2,
        rootMargin: rootMargin ?? "50px",
      },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [onVisible, ref, rootMargin, threshold]);

  return isVisible;
}

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
  playbackEnabled = true,
  freezeFrameOnPause = false,
  onVisible,
  onClick,
  surface,
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
    onVisible: (visible: boolean) => {
      onVisible?.(visible);

      if (visible && !hasTrackedView.current) {
        hasTrackedView.current = true;
        trackProjectCardViewed({
          project_slug: id,
          project_title: title,
          surface,
        });
      }
    },
  });

  // Calculate aspect ratio style
  const { ratio } = parseAspectRatio(aspectRatio);
  const aspectRatioStyle = { aspectRatio: `${ratio}` };

  // Handle cursor position for hover state
  const handlePositionChange = (x: number, y: number) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const isInside =
        x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      setIsHovering(isInside);
    }
  };

  const projectPath = `/projects/${id}`;
  const previewImage = poster || (type === "gif" ? src : undefined);

  const handleCardClick = () => {
    trackProjectOpened({
      project_slug: id,
      project_title: title,
      surface,
    });
    onClick?.();
  };

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    warmImages([previewImage], 1);
  }, [isVisible, previewImage]);

  const shouldAutoPlay = isVisible && playbackEnabled && !prefersReducedMotion;
  const shouldShowPosterWhenPaused = !freezeFrameOnPause || !playbackEnabled;

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
    <div
      className="block relative"
      onMouseEnter={() => {
        setIsHovered(true);
        warmImages([previewImage], 1);
      }}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Custom cursor */}
      <Cursor
        attachToParent
        variants={{
          initial: { scale: 0.3, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0.3, opacity: 0 },
        }}
        springConfig={{ stiffness: 500, damping: 30, mass: 0.5 }}
        transition={{ ease: "easeInOut", duration: 0.15 }}
        onPositionChange={handlePositionChange}
      >
        <ProjectCardHoverCursor isHovering={isHovering} />
      </Cursor>

      <AdaptiveLink
        href={projectPath}
        aria-label={title || `View project ${id}`}
        className="absolute inset-0 z-10 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        prefetchOnViewport
        prefetchRootMargin="250px"
        onClick={handleCardClick}
      >
        <span className="sr-only">{title || `View project ${id}`}</span>
      </AdaptiveLink>

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
              autoPlay={shouldAutoPlay}
              active={isVisible && playbackEnabled}
              muted
              loop
              className="absolute inset-0"
              showPosterWhenPaused={shouldShowPosterWhenPaused}
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
        {title && (
          <ProjectCardTitleOverlay title={title} isHovered={isHovered} />
        )}

        {/* Live link */}
        {url && <ProjectCardLiveLink url={url} isHovered={isHovered} />}

        {/* Badges */}
        {badges.map((badge, index) => (
          <ProjectCardBadge
            key={`${id}-badge-${badge.text}`}
            text={badge.text}
            position={badge.position || "bottom-left"}
            isHovered={isHovered}
            index={index}
          />
        ))}
      </m.div>
    </div>
  );
}

export const ProjectCard = ProjectCardComponent;
export default ProjectCard;
