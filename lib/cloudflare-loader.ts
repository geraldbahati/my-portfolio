/**
 * Custom Next.js image loader for Cloudflare Image Transformations.
 *
 * When an image src is from R2 (media.geraldbahati.dev), this loader
 * generates a Cloudflare `/cdn-cgi/image/` URL that transforms images
 * at the edge — resizing, format negotiation (AVIF/WebP), and quality
 * adjustment without storing multiple copies.
 *
 * Usage:
 *   <Image loader={cloudflareLoader} src="https://media.geraldbahati.dev/..." ... />
 */

const TRANSFORM_ZONE = "geraldbahati.dev";
const R2_DOMAIN = "media.geraldbahati.dev";

interface CloudflareLoaderParams {
  src: string;
  width: number;
  quality?: number;
}

export function cloudflareLoader({
  src,
  width,
  quality,
}: CloudflareLoaderParams): string {
  // Only transform R2-hosted images
  if (!src.includes(R2_DOMAIN)) {
    return src;
  }

  const params = [
    `width=${width}`,
    `quality=${quality || 80}`,
    "format=auto",
    "fit=cover",
  ].join(",");

  return `https://${TRANSFORM_ZONE}/cdn-cgi/image/${params}/${src}`;
}
