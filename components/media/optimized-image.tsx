"use client";

import { memo, useState, useCallback } from "react";
import Image from "next/image";
import { isR2Url, parseAspectRatio } from "@/lib/media-utils";
import { cloudflareLoader } from "@/lib/cloudflare-loader";

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
 * Optimized image component that uses:
 * - Cloudflare Image Transformations (via custom loader) for R2 images
 * - Next.js built-in optimization for all other sources
 *
 * Both paths get lazy loading, responsive srcSet, and format negotiation.
 */
function OptimizedImageComponent({
  src,
  alt,
  aspectRatio = "16/9",
  width: _width,
  height: _height,
  priority = false,
  className = "",
  objectFit = "cover",
  quality = 80,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  onError,
  onLoad,
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);

  const { ratio } = parseAspectRatio(aspectRatio);
  const isR2 = isR2Url(src);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

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

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: `${ratio}` }}
    >
      <Image
        loader={isR2 ? cloudflareLoader : undefined}
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={quality}
        className={`object-${objectFit}`}
        onError={handleError}
        onLoad={onLoad}
      />
    </div>
  );
}

export const OptimizedImage = memo(OptimizedImageComponent);
