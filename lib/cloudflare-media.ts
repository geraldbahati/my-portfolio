/**
 * Cloudflare Media Utilities
 *
 * Helpers for generating optimized URLs for:
 * - Images: R2 storage + Cloudflare Image Transformations
 * - Videos: Cloudflare Stream HLS/DASH delivery
 */

const R2_CUSTOM_DOMAIN = "media.geraldbahati.dev";
const STREAM_SUBDOMAIN = "customer-pdxnd9di8ybc2kur.cloudflarestream.com";
const TRANSFORM_ZONE = "geraldbahati.dev";

// ============================================================================
// IMAGE TRANSFORMATIONS
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

/**
 * Generate a Cloudflare Image Transformation URL
 *
 * For images stored in R2 at media.geraldbahati.dev,
 * this generates a transformation URL via your zone.
 *
 * @example
 * // Original: https://media.geraldbahati.dev/projects/image/abc123.webp
 * // Transformed: https://geraldbahati.dev/cdn-cgi/image/width=800,quality=80,format=auto/https://media.geraldbahati.dev/projects/image/abc123.webp
 */
export function getTransformedImageUrl(
  originalUrl: string,
  options: ImageTransformOptions = {}
): string {
  // Default options for optimal delivery
  const opts: ImageTransformOptions = {
    format: "auto",
    quality: 85,
    fit: "cover",
    ...options,
  };

  // Build options string
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

  return `https://${TRANSFORM_ZONE}/cdn-cgi/image/${optionsString}/${originalUrl}`;
}

/**
 * Generate responsive image srcSet for different screen sizes
 */
export function getResponsiveImageSrcSet(
  originalUrl: string,
  widths: number[] = [320, 640, 960, 1280, 1920],
  options: Omit<ImageTransformOptions, "width"> = {}
): string {
  return widths
    .map((width) => {
      const url = getTransformedImageUrl(originalUrl, { ...options, width });
      return `${url} ${width}w`;
    })
    .join(", ");
}

/**
 * Get optimized thumbnail URL for project cards
 */
export function getProjectThumbnail(
  originalUrl: string,
  size: "small" | "medium" | "large" = "medium"
): string {
  const sizes = {
    small: { width: 400, height: 300 },
    medium: { width: 800, height: 600 },
    large: { width: 1200, height: 900 },
  };

  return getTransformedImageUrl(originalUrl, {
    ...sizes[size],
    fit: "cover",
    format: "auto",
    quality: 80,
  });
}

// ============================================================================
// VIDEO (CLOUDFLARE STREAM)
// ============================================================================

export interface StreamVideoUrls {
  /** HLS manifest for adaptive streaming (recommended for most players) */
  hls: string;
  /** DASH manifest for adaptive streaming */
  dash: string;
  /** Direct MP4 download URL */
  mp4?: string;
  /** Thumbnail image URL */
  thumbnail: string;
  /** Animated thumbnail GIF */
  animatedThumbnail: string;
  /** Embed iframe URL */
  iframe: string;
}

/**
 * Get all playback URLs for a Cloudflare Stream video
 */
export function getStreamVideoUrls(uid: string): StreamVideoUrls {
  return {
    hls: `https://${STREAM_SUBDOMAIN}/${uid}/manifest/video.m3u8`,
    dash: `https://${STREAM_SUBDOMAIN}/${uid}/manifest/video.mpd`,
    thumbnail: `https://${STREAM_SUBDOMAIN}/${uid}/thumbnails/thumbnail.jpg`,
    animatedThumbnail: `https://${STREAM_SUBDOMAIN}/${uid}/thumbnails/thumbnail.gif`,
    iframe: `https://${STREAM_SUBDOMAIN}/${uid}/iframe`,
  };
}

/**
 * Get a thumbnail at a specific timestamp
 */
export function getStreamThumbnailAt(
  uid: string,
  options: {
    time?: string; // "1s", "50%", "2m30s"
    width?: number;
    height?: number;
    fit?: "crop" | "clip" | "scale" | "fill";
  } = {}
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
// URL DETECTION & PARSING
// ============================================================================

/**
 * Check if a URL is a Cloudflare Stream video
 */
export function isStreamUrl(url: string): boolean {
  return url.includes("cloudflarestream.com") || url.includes("/stream/");
}

/**
 * Check if a URL is an R2/media URL
 */
export function isR2Url(url: string): boolean {
  return url.includes(R2_CUSTOM_DOMAIN) || url.includes(".r2.cloudflarestorage.com");
}

/**
 * Extract Stream video UID from various URL formats
 */
export function extractStreamUid(url: string): string | null {
  // Format: https://customer-xxx.cloudflarestream.com/{uid}/...
  const streamMatch = url.match(/cloudflarestream\.com\/([a-f0-9]+)/i);
  if (streamMatch) return streamMatch[1];

  // Format: https://watch.cloudflarestream.com/{uid}
  const watchMatch = url.match(/watch\.cloudflarestream\.com\/([a-f0-9]+)/i);
  if (watchMatch) return watchMatch[1];

  return null;
}

/**
 * Get the R2 key from a media URL
 */
export function extractR2Key(url: string): string | null {
  // Format: https://media.geraldbahati.dev/{key}
  if (url.includes(R2_CUSTOM_DOMAIN)) {
    const urlObj = new URL(url);
    return urlObj.pathname.slice(1); // Remove leading /
  }
  return null;
}
