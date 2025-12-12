"use client";

import { memo, useState, useCallback } from "react";
import Image from "next/image";
import {
  isR2Url,
  transformR2Image,
  getR2SrcSet,
  parseAspectRatio,
} from "@/lib/media-utils";

export interface OptimizedImageProps {
  src: string;
  alt: string;
  aspectRatio?: string | number;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  objectFit?: "cover" | "contain" | "fill";
  quality?: number;
  sizes?: string;
  onError?: () => void;
  onLoad?: () => void;
}

/**
 * Optimized image component for R2 images with Cloudflare transformations
 * Falls back to Next.js Image for other sources
 */
function OptimizedImageComponent({
  src,
  alt,
  aspectRatio = "16/9",
  width,
  height,
  priority = false,
  className = "",
  objectFit = "cover",
  quality = 85,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  onError,
  onLoad,
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const { ratio } = parseAspectRatio(aspectRatio);
  const isR2 = isR2Url(src);

  // Calculate dimensions if not provided
  const imgWidth = width || 1280;
  const imgHeight = height || Math.round(imgWidth / ratio);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  if (hasError) {
    return (
      <div
        className={`bg-gray-800 flex items-center justify-center ${className}`}
        style={{ aspectRatio: `${ratio}` }}
      >
        <span className="text-gray-400 text-sm">Image unavailable</span>
      </div>
    );
  }

  // For R2 images, use native img with Cloudflare transformations
  if (isR2) {
    const transformedSrc = transformR2Image(src, {
      width: imgWidth,
      height: imgHeight,
      fit: objectFit === "contain" ? "contain" : "cover",
      quality,
      format: "auto",
    });

    const srcSet = getR2SrcSet(src, [320, 640, 960, 1280, 1920], {
      fit: objectFit === "contain" ? "contain" : "cover",
      quality,
      format: "auto",
    });

    return (
      <div
        className={`relative overflow-hidden ${className}`}
        style={{ aspectRatio: `${ratio}` }}
      >
        {/* Low quality placeholder */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-800 animate-pulse" />
        )}

        <img
          src={transformedSrc}
          srcSet={srcSet || undefined}
          sizes={sizes}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={`w-full h-full transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ objectFit }}
          onError={handleError}
          onLoad={handleLoad}
        />
      </div>
    );
  }

  // For non-R2 images, use Next.js Image component
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: `${ratio}` }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={quality}
        className={`object-${objectFit}`}
        onError={handleError}
        onLoad={handleLoad}
      />
    </div>
  );
}

export const OptimizedImage = memo(OptimizedImageComponent);
