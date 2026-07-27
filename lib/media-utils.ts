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

const ALLOWED_PREVIEW_HOSTS = [
  R2_DOMAIN,
  STREAM_DOMAIN,
  TRANSFORM_ZONE,
  "cloudinary.com",
] as const;

/**
 * Allowlist media preview URLs before binding to DOM src attributes.
 * Permits local blob previews during upload and trusted CDN/media hosts.
 */
export function sanitizeMediaPreviewUrl(
  url: string | null | undefined,
): string | null {
  if (!url) return null;

  if (url.startsWith("blob:")) {
    try {
      new URL(url);
      return url;
    } catch {
      return null;
    }
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") {
      return null;
    }

    const isAllowed = ALLOWED_PREVIEW_HOSTS.some((domain) =>
      hostnameEndsWith(url, domain),
    );

    return isAllowed ? url : null;
  } catch {
    return null;
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

export interface StreamThumbnailOptions {
  time?: string; // "1s", "50%", "2m30s"
  width?: number;
  height?: number;
  fit?: "crop" | "clip" | "scale" | "fill";
}

export function getStreamThumbnail(
  uid: string,
  options: StreamThumbnailOptions = {},
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
// Aspect Ratio Utilities
// ============================================================================

export function parseAspectRatio(aspectRatio: string | number): {
  width: number;
  height: number;
  ratio: number;
} {
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
