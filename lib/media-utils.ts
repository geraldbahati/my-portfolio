/**
 * Media URL Utilities
 *
 * Centralized utilities for detecting and transforming media URLs
 * from Cloudflare Stream, R2, and legacy Cloudinary sources.
 */

const R2_DOMAIN = "media.geraldbahati.dev";
const STREAM_DOMAIN = "cloudflarestream.com";
const TRANSFORM_ZONE = "geraldbahati.dev";
const STREAM_SUBDOMAIN = "customer-pdxnd9di8ybc2kur.cloudflarestream.com";

// ============================================================================
// Safe URL hostname checking
// ============================================================================

/**
 * Safely check if a URL's hostname matches or is a subdomain of a given domain.
 * Uses URL parsing instead of substring matching to prevent bypass attacks
 * (e.g., "https://evil.com/?cloudflarestream.com").
 */
function hostnameEndsWith(url: string, domain: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === domain || hostname.endsWith(`.${domain}`);
  } catch {
    return false;
  }
}

// ============================================================================
// URL Detection
// ============================================================================

export type MediaSource = "stream" | "r2" | "cloudinary" | "external";

export function detectMediaSource(url: string): MediaSource {
  if (!url) return "external";
  if (hostnameEndsWith(url, STREAM_DOMAIN)) return "stream";
  if (hostnameEndsWith(url, R2_DOMAIN)) return "r2";
  if (hostnameEndsWith(url, "cloudinary.com")) return "cloudinary";
  return "external";
}

export function isStreamUrl(url: string): boolean {
  return hostnameEndsWith(url, STREAM_DOMAIN);
}

export function isR2Url(url: string): boolean {
  return hostnameEndsWith(url, R2_DOMAIN);
}

// ============================================================================
// Stream Video Utilities
// ============================================================================

export function extractStreamUid(url: string): string | null {
  // Format: https://customer-xxx.cloudflarestream.com/{uid}/manifest/video.m3u8
  const match = url.match(/cloudflarestream\.com\/([a-f0-9]+)/i);
  return match ? match[1] : null;
}

export interface StreamUrls {
  hls: string;
  dash: string;
  mp4: string;
  thumbnail: string;
  animatedThumbnail: string;
  iframe: string;
}

export function getStreamUrls(uid: string): StreamUrls {
  const base = `https://${STREAM_SUBDOMAIN}/${uid}`;
  return {
    hls: `${base}/manifest/video.m3u8`,
    dash: `${base}/manifest/video.mpd`,
    mp4: `${base}/downloads/default.mp4`,
    thumbnail: `${base}/thumbnails/thumbnail.jpg`,
    animatedThumbnail: `${base}/thumbnails/thumbnail.gif`,
    iframe: `${base}/iframe`,
  };
}

export interface StreamThumbnailOptions {
  time?: string; // "1s", "50%", "2m30s"
  width?: number;
  height?: number;
  fit?: "crop" | "clip" | "scale" | "fill";
}

export function getStreamThumbnail(
  uid: string,
  options: StreamThumbnailOptions = {}
): string {
  const params = new URLSearchParams();
  if (options.time) params.set("time", options.time);
  if (options.width) params.set("width", options.width.toString());
  if (options.height) params.set("height", options.height.toString());
  if (options.fit) params.set("fit", options.fit);

  const query = params.toString();
  return `https://${STREAM_SUBDOMAIN}/${uid}/thumbnails/thumbnail.jpg${query ? `?${query}` : ""}`;
}

// ============================================================================
// R2 Image Transformation Utilities
// ============================================================================

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  fit?: "scale-down" | "contain" | "cover" | "crop" | "pad";
  quality?: number; // 1-100
  format?: "auto" | "webp" | "avif" | "jpeg" | "png";
  blur?: number; // 1-250
  sharpen?: number; // 0-10
  gravity?: "auto" | "center" | "top" | "bottom" | "left" | "right";
  dpr?: number; // Device pixel ratio 1-3
}

export function transformR2Image(
  url: string,
  options: ImageTransformOptions = {}
): string {
  // Don't transform non-R2 URLs
  if (!isR2Url(url)) return url;

  const opts: ImageTransformOptions = {
    format: "auto",
    quality: 85,
    fit: "cover",
    ...options,
  };

  const optionsArray: string[] = [];
  if (opts.width) optionsArray.push(`width=${opts.width}`);
  if (opts.height) optionsArray.push(`height=${opts.height}`);
  if (opts.fit) optionsArray.push(`fit=${opts.fit}`);
  if (opts.quality) optionsArray.push(`quality=${opts.quality}`);
  if (opts.format) optionsArray.push(`format=${opts.format}`);
  if (opts.blur) optionsArray.push(`blur=${opts.blur}`);
  if (opts.sharpen) optionsArray.push(`sharpen=${opts.sharpen}`);
  if (opts.gravity) optionsArray.push(`gravity=${opts.gravity}`);
  if (opts.dpr) optionsArray.push(`dpr=${opts.dpr}`);

  const optionsString = optionsArray.join(",");
  return `https://${TRANSFORM_ZONE}/cdn-cgi/image/${optionsString}/${url}`;
}

/**
 * Generate responsive srcSet for R2 images
 */
export function getR2SrcSet(
  url: string,
  widths: number[] = [320, 640, 960, 1280, 1920],
  options: Omit<ImageTransformOptions, "width"> = {}
): string {
  if (!isR2Url(url)) return "";

  return widths
    .map((width) => {
      const transformedUrl = transformR2Image(url, { ...options, width });
      return `${transformedUrl} ${width}w`;
    })
    .join(", ");
}

// ============================================================================
// Aspect Ratio Utilities
// ============================================================================

export function parseAspectRatio(
  aspectRatio: string | number
): { width: number; height: number; ratio: number } {
  let ratio = 16 / 9; // Default
  let width = 16;
  let height = 9;

  if (typeof aspectRatio === "number") {
    ratio = aspectRatio;
    // Approximate common ratios
    if (Math.abs(ratio - 16 / 9) < 0.01) {
      width = 16;
      height = 9;
    } else if (Math.abs(ratio - 4 / 3) < 0.01) {
      width = 4;
      height = 3;
    } else if (Math.abs(ratio - 1) < 0.01) {
      width = 1;
      height = 1;
    } else {
      width = Math.round(ratio * 100);
      height = 100;
    }
  } else if (typeof aspectRatio === "string") {
    const parts = aspectRatio.split("/");
    if (parts.length === 2) {
      const w = parseFloat(parts[0]);
      const h = parseFloat(parts[1]);
      if (!isNaN(w) && !isNaN(h) && h !== 0) {
        width = w;
        height = h;
        ratio = w / h;
      }
    }
  }

  return { width, height, ratio };
}

/**
 * Calculate optimal dimensions for a given container width and aspect ratio
 */
export function calculateDimensions(
  containerWidth: number,
  aspectRatio: string | number
): { width: number; height: number } {
  const { ratio } = parseAspectRatio(aspectRatio);
  return {
    width: containerWidth,
    height: Math.round(containerWidth / ratio),
  };
}

// ============================================================================
// Presets for common use cases
// ============================================================================

export const IMAGE_PRESETS = {
  thumbnail: { width: 400, height: 300, quality: 75 },
  card: { width: 800, height: 600, quality: 80 },
  hero: { width: 1920, height: 1080, quality: 85 },
  avatar: { width: 200, height: 200, quality: 80 },
} as const;

export const VIDEO_THUMBNAIL_PRESETS = {
  small: { width: 320, height: 180 },
  medium: { width: 640, height: 360 },
  large: { width: 1280, height: 720 },
} as const;
