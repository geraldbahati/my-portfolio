/**
 * Custom Next.js image loader for Cloudflare Stream thumbnails.
 *
 * Stream thumbnails are already resized and format-negotiated at Cloudflare's
 * edge (e.g. `.../UID/thumbnails/thumbnail.jpg?time=1s&fit=crop`). Routing them
 * through the Next.js image optimizer would re-download and re-encode them on
 * the origin for no benefit. This loader instead lets next/image emit a srcSet
 * that points straight at the edge, varying only the `width` parameter.
 *
 * Usage:
 *   <Image loader={streamThumbnailLoader} src={baseThumbnailUrl} fill ... />
 */

interface StreamThumbnailLoaderParams {
  src: string;
  width: number;
  quality?: number;
}

export function streamThumbnailLoader({
  src,
  width,
}: StreamThumbnailLoaderParams): string {
  try {
    const url = new URL(src);
    url.searchParams.set("width", String(width));
    return url.toString();
  } catch {
    // Non-absolute or malformed src: hand back untouched.
    return src;
  }
}
