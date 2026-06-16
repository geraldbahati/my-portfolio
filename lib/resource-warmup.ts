import ReactDOM from "react-dom";
import { isR2Url, isStreamUrl } from "@/lib/media-utils";
import { cloudflareLoader } from "@/lib/cloudflare-loader";

type ConnectionInformation = {
  effectiveType?: string;
  saveData?: boolean;
};

type NavigatorWithConnection = Navigator & {
  connection?: ConnectionInformation;
};

const warmedRoutes = new Set<string>();
const warmedImages = new Set<string>();
const SLOW_CONNECTIONS = new Set(["slow-2g", "2g"]);

// Mirrors next.config.ts `images.deviceSizes`. Used to build a srcSet that
// matches the candidates next/image emits, so a warmed request is the exact
// URL the browser later reuses.
const DEVICE_SIZES = [640, 750, 828, 1080, 1200, 1920];
// next/image's default quality when a component omits `quality`.
const DEFAULT_QUALITY = 75;

export type WarmImageOptions = {
  /** The `sizes` attribute of the consuming <Image>. Defaults to "100vw". */
  sizes?: string;
  /** The `quality` of the consuming <Image>. MUST match for the warm to be reused. */
  quality?: number;
  /** Override the candidate widths (defaults to deviceSizes). */
  widths?: number[];
  /**
   * Which loader the consuming <Image> uses, so the warmed URL matches:
   * - "auto" (default): infer from host (R2 → Cloudflare, Stream → direct, else Next)
   * - "next": force the Next.js optimizer (/_next/image), even for R2 hosts
   * - "direct": warm the URL as-is (no optimization)
   */
  loader?: "auto" | "next" | "direct";
};

function getConnection() {
  if (typeof navigator === "undefined") {
    return undefined;
  }

  return (navigator as NavigatorWithConnection).connection;
}

export function canWarmResources() {
  if (typeof window === "undefined") {
    return false;
  }

  const connection = getConnection();
  if (connection?.saveData) {
    return false;
  }

  if (connection?.effectiveType && SLOW_CONNECTIONS.has(connection.effectiveType)) {
    return false;
  }

  return true;
}

export function warmRoute(
  href: string,
  prefetch: (href: string) => void | Promise<void>,
) {
  if (!href || !href.startsWith("/") || !canWarmResources()) {
    return false;
  }

  if (warmedRoutes.has(href)) {
    return false;
  }

  warmedRoutes.add(href);
  void prefetch(href);
  return true;
}

function nextImageUrl(src: string, width: number, quality: number): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}

type ResolvedWarmTarget = {
  /** Fallback href (largest candidate). */
  href: string;
  /** Full srcSet string, when the source is optimizable. */
  srcSet?: string;
};

/**
 * Resolve the URL(s) the browser will actually fetch for a given source,
 * matching the loader the consuming <Image> uses:
 * - R2 images        → Cloudflare image-transform loader
 * - Stream thumbnails → served straight from Cloudflare's edge (warm as-is)
 * - everything else  → Next.js image optimizer (/_next/image)
 */
function resolveWarmTarget(
  src: string,
  options?: WarmImageOptions,
): ResolvedWarmTarget {
  const quality = options?.quality ?? DEFAULT_QUALITY;
  const widths = options?.widths ?? DEVICE_SIZES;
  const largest = widths[widths.length - 1];
  const loader = options?.loader ?? "auto";

  const buildNextSrcSet = (): ResolvedWarmTarget => {
    const srcSet = widths
      .map((w) => `${nextImageUrl(src, w, quality)} ${w}w`)
      .join(", ");
    return { href: nextImageUrl(src, largest, quality), srcSet };
  };

  if (loader === "direct") {
    return { href: src };
  }

  if (loader === "next") {
    return buildNextSrcSet();
  }

  // loader === "auto": infer from host.
  if (isR2Url(src)) {
    const srcSet = widths
      .map((w) => `${cloudflareLoader({ src, width: w, quality })} ${w}w`)
      .join(", ");
    return { href: cloudflareLoader({ src, width: largest, quality }), srcSet };
  }

  // Cloudflare Stream thumbnails are edge-resized and served directly (not via
  // /_next/image), so the URL itself is what the browser requests.
  if (isStreamUrl(src)) {
    return { href: src };
  }

  return buildNextSrcSet();
}

export function warmImage(src?: string | null, options?: WarmImageOptions) {
  if (!src || !canWarmResources()) {
    return false;
  }

  if (warmedImages.has(src)) {
    return false;
  }

  const { href, srcSet } = resolveWarmTarget(src, options);

  // ReactDOM.preload injects a deduped <link rel="preload" as="image">. When a
  // srcSet is provided the browser fetches the candidate it will actually use,
  // so the real <Image> reuses it from cache instead of re-downloading.
  ReactDOM.preload(href, {
    as: "image",
    fetchPriority: "low",
    ...(srcSet
      ? { imageSrcSet: srcSet, imageSizes: options?.sizes ?? "100vw" }
      : {}),
  });

  warmedImages.add(src);
  return true;
}

export function warmImages(
  sources: Array<string | null | undefined>,
  limit = 2,
  options?: WarmImageOptions,
) {
  if (!canWarmResources() || limit <= 0) {
    return 0;
  }

  let warmedCount = 0;

  for (const source of sources) {
    if (warmedCount >= limit) {
      break;
    }

    if (source && warmImage(source, options)) {
      warmedCount += 1;
    }
  }

  return warmedCount;
}
