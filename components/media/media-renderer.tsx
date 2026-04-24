"use client";

import { memo, useCallback } from "react";
import { StreamVideo } from "./stream-video";
import { OptimizedImage } from "./optimized-image";
import { detectMediaSource, isStreamUrl } from "@/lib/media-utils";

export interface MediaRendererProps {
  src: string;
  type: "video" | "gif" | "image";
  poster?: string;
  alt?: string;
  aspectRatio?: string | number;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  priority?: boolean;
  className?: string;
  showPosterWhenPaused?: boolean;
  onError?: () => void;
  onLoad?: () => void;
}

/**
 * Unified media renderer that automatically selects the appropriate
 * component based on the source URL and media type.
 *
 * - Stream URLs → StreamVideo (HLS player)
 * - R2 URLs → OptimizedImage (Cloudflare transforms)
 * - Other URLs → OptimizedImage (Next.js Image)
 */
function MediaRendererComponent({
  src,
  type,
  poster,
  alt = "",
  aspectRatio = "16/9",
  autoPlay = true,
  muted = true,
  loop = true,
  priority = false,
  className = "",
  showPosterWhenPaused = true,
  onError,
  onLoad,
}: MediaRendererProps) {
  const source = detectMediaSource(src);
  const isVideo = type === "video" || isStreamUrl(src);

  const handleError = useCallback(() => {
    onError?.();
  }, [onError]);

  const handleLoad = useCallback(() => {
    onLoad?.();
  }, [onLoad]);

  // Render video for Stream URLs or video type
  if (isVideo && (source === "stream" || type === "video")) {
    return (
      <StreamVideo
        src={src}
        poster={poster}
        alt={alt}
        aspectRatio={aspectRatio}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        className={className}
        showPosterWhenPaused={showPosterWhenPaused}
        onError={handleError}
        onLoad={handleLoad}
      />
    );
  }

  // Render image for all other cases
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      aspectRatio={aspectRatio}
      priority={priority}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
    />
  );
}

export const MediaRenderer = memo(MediaRendererComponent);
