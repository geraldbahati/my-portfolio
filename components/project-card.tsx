"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { CldImage, CldVideoPlayer } from "next-cloudinary";
import "next-cloudinary/dist/cld-video-player.css";
import { motion, AnimatePresence } from "framer-motion";
import { Cursor } from "@/components/ui/cursor";
import { EyeIcon } from "lucide-react";
import Analytics from "@/lib/analytics";
import { optimizeCloudinaryVideo, isCloudinaryUrl } from "@/lib/cloudinary";

// Types
export interface ProjectCardProps {
  id: string;
  src: string;
  type: "video" | "gif";
  poster?: string;
  alt?: string;
  title?: string;
  url?: string; // Live project URL
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

export const ProjectCard: React.FC<ProjectCardProps> = ({
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
}) => {
  const mediaRef = useRef<HTMLVideoElement | HTMLImageElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null);
  const hasTrackedView = useRef(false);

  // Check for reduced motion preference and mobile view
  useEffect(() => {
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const mobileQuery = window.matchMedia("(max-width: 768px)");

    setPrefersReducedMotion(reducedMotionQuery.matches);
    setIsMobile(mobileQuery.matches);

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    const handleMobileChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);
    mobileQuery.addEventListener("change", handleMobileChange);

    return () => {
      reducedMotionQuery.removeEventListener(
        "change",
        handleReducedMotionChange,
      );
      mobileQuery.removeEventListener("change", handleMobileChange);
    };
  }, []);

  // Setup Intersection Observer for visibility detection
  useEffect(() => {
    const element = targetRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // FIX: Simply check isIntersecting.
          // If it's in the viewport (even 1 pixel), we consider it "visible" enough to start logic,
          // but usually, a small threshold like 0.2 is better for UX.
          const visible = entry.isIntersecting;

          setIsVisible(visible);
          onVisible?.(visible);

          if (visible && !hasTrackedView.current) {
            hasTrackedView.current = true;
            Analytics.trackMediaInteraction({
              mediaType: type === "video" ? "video" : "image",
              action: "view",
              mediaId: id,
            });
          }
        });
      },
      {
        // FIX: simplified threshold. 0.2 means "play when 20% visible"
        threshold: 0.2,
        // rootMargin: "0px" is usually safer for exact viewports,
        // but "100px" preloads it slightly before it enters.
        rootMargin: "50px",
      },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [onVisible, id, type]);

  // Control video playback based on visibility
  // Note: CldVideoPlayer handles autoplay with 'on-scroll' mode
  // We only keep the IntersectionObserver above for Analytics tracking

  const handleVideoError = useCallback(() => {
    console.error(`Video failed to load: ${id}`);
    setHasError(true);
  }, [id]);

  // Calculate aspect ratio style
  const aspectRatioStyle =
    typeof aspectRatio === "string"
      ? { aspectRatio }
      : { aspectRatio: aspectRatio.toString() };

  // Optimize video URL with Cloudinary transformations
  // Note: CldVideoPlayer handles this internally now
  const optimizedVideoSrc = useMemo(() => {
    return src;
  }, [src]);

  // Optimize poster URL if it's a Cloudinary URL
  const optimizedPoster = useMemo(() => {
    if (poster && isCloudinaryUrl(poster)) {
      // Poster is already optimized via CldImage, but we can use it for the video tag
      return poster;
    }
    return poster;
  }, [poster]);

  // Render media content
  const renderMedia = () => {
    // 1. Handle Fallback / Reduced Motion
    if (prefersReducedMotion || hasError) {
      // Determine which ID to use: content of 'poster' OR the main 'src' (if it's the video ID)
      const mediaId = poster || src;

      // If we have a Cloudinary ID (or URL), render the optimized thumbnail
      // Note: We assume 'src' or 'poster' contains the public ID (e.g., 'teamflow_qduwrr')
      if (mediaId) {
        return (
          <CldImage
            src={mediaId}
            alt={alt || title || `Project ${id}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            crop="fill"
            gravity="auto"
            // CRITICAL FIX:
            // If the ID belongs to a video, we must tell CldImage to look in the video DB
            assetType={type === "video" ? "video" : "image"}
            quality="auto"
            format="auto"
            preserveTransformations
          />
        );
      }

      // Fallback if no media ID found
      return (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
          <span className="text-gray-400">Media unavailable</span>
        </div>
      );
    }

    // 2. Handle GIF (Images)
    if (type === "gif") {
      return (
        <CldImage
          src={src}
          alt={alt || title || `Project ${id}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          crop="fill"
          gravity="auto"
          quality="auto"
          format="auto"
          preserveTransformations
        />
      );
    }

    // 3. Handle Video Player (using CldVideoPlayer for robust autoplay)
    return (
      <div className="absolute inset-0 w-full h-full [&_video]:object-cover">
        <CldVideoPlayer
          src={src} // Pass public ID directly
          width="1920"
          height="1080"
          autoplay="on-scroll"
          muted
          loop
          controls={false}
          playsinline
          className="w-full h-full"
          poster={poster} // Can be public ID or URL
          transformation={{
            quality: "auto",
            format: "auto",
          }}
        />
      </div>
    );
  };

  // Handle cursor position change with scroll compensation
  const handlePositionChange = useCallback((x: number, y: number) => {
    if (targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect();
      const isInside =
        x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      setIsHovering(isInside);
    }
  }, []);

  // Animation variants for Framer Motion
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
      <Cursor
        attachToParent
        variants={{
          initial: { scale: 0.3, opacity: 0 },
          animate: { scale: 1, opacity: 1 },
          exit: { scale: 0.3, opacity: 0 },
        }}
        springConfig={{
          bounce: 0.001,
        }}
        transition={{
          ease: "easeInOut",
          duration: 0.15,
        }}
        onPositionChange={handlePositionChange}
      >
        <motion.div
          animate={{
            width: isHovering ? 80 : 16,
            height: isHovering ? 32 : 16,
          }}
          className="flex items-center justify-center rounded-[24px] bg-black/90 backdrop-blur-md"
        >
          <AnimatePresence>
            {isHovering ? (
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
            ) : null}
          </AnimatePresence>
        </motion.div>
      </Cursor>

      <motion.div
        ref={targetRef}
        id={id}
        className={`relative overflow-hidden rounded-lg bg-gray-900 ${className}`}
        style={{
          ...aspectRatioStyle,
          ...style,
          cursor: url ? "pointer" : "default",
        }}
        role="article"
        aria-label={title || `Project ${id}`}
        onClick={() => {
          Analytics.trackButtonClick(title || `Project ${id}`, "Project Card");

          // If URL exists, open in new tab
          if (url) {
            window.open(url, "_blank", "noopener,noreferrer");
          }

          // Call custom onClick handler if provided
          onClick?.();
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        whileTap={{ scale: 0.98 }}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();

            // If URL exists, open in new tab
            if (url) {
              window.open(url, "_blank", "noopener,noreferrer");
            }

            // Call custom onClick handler if provided
            onClick?.();
          }
        }}
      >
        {/* Media Content with Grayscale Animation */}
        <motion.div
          className="absolute inset-0"
          variants={mediaVariants}
          initial="initial"
          animate={isHovered ? "hover" : "initial"}
        >
          {renderMedia()}
        </motion.div>

        {/* Hover Overlay - Subtle gradient that appears on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Title Overlay with Animation */}
        {title && (
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
        )}

        {/* Badges with Animation */}
        {badges.map((badge, index) => {
          const positionClasses =
            badge.position === "bottom-right"
              ? "bottom-4 right-4"
              : "bottom-4 left-4";

          return (
            <motion.div
              key={`${id}-badge-${index}`}
              className={`absolute ${positionClasses} z-10`}
              initial={{
                y: 10,
                opacity: 0.7,
                scale: 0.95,
              }}
              animate={{
                y: isHovered ? 0 : 10,
                opacity: isHovered ? 1 : 0.7,
                scale: isHovered ? 1 : 0.95,
              }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
                delay: index * 0.05, // Stagger badges animation
              }}
            >
              <span className="inline-block bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                {badge.text}
              </span>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default ProjectCard;
