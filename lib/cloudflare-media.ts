/**
 * Cloudflare Media Utilities
 *
 * Helpers for generating optimized URLs for:
 * - Images: R2 storage + Cloudflare Image Transformations
 * - Videos: Cloudflare Stream HLS/DASH delivery
 */

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
