/**
 * Cloudinary Utilities
 * Helper functions for optimizing Cloudinary assets
 */

/**
 * Optimizes a Cloudinary video URL with recommended transformations
 * @param url - The Cloudinary video URL
 * @param options - Optional transformation parameters
 * @returns Optimized video URL
 */
export function optimizeCloudinaryVideo(
  url: string,
  options?: {
    width?: number;
    quality?: 'auto' | 'auto:low' | 'auto:good' | 'auto:best' | number;
    format?: 'auto' | 'mp4' | 'webm';
  }
): string {
  // Check if it's a Cloudinary URL
  if (!url.includes('res.cloudinary.com')) {
    return url;
  }

  const { width = 1200, quality = 'auto', format = 'auto' } = options || {};

  // Parse the URL to insert transformations
  // Pattern: https://res.cloudinary.com/{cloud}/video/upload/{existing-transforms}/v{version}/{publicId}.{ext}

  // If URL already has transformations, preserve them
  const hasTransformations = /\/upload\/[^v]/.test(url);

  if (hasTransformations) {
    // URL already has transformations, return as is
    return url;
  }

  // Add optimized transformations
  const transformations = `w_${width},q_${quality},f_${format}`;

  // Insert transformations after /upload/
  const optimizedUrl = url.replace(
    /\/upload\//,
    `/upload/${transformations}/`
  );

  return optimizedUrl;
}

/**
 * Optimizes a Cloudinary image URL with recommended transformations
 * @param url - The Cloudinary image URL
 * @param options - Optional transformation parameters
 * @returns Optimized image URL
 */
export function optimizeCloudinaryImage(
  url: string,
  options?: {
    width?: number;
    quality?: 'auto' | 'auto:low' | 'auto:good' | 'auto:best' | number;
    format?: 'auto' | 'jpg' | 'png' | 'webp';
    crop?: 'fill' | 'fit' | 'scale' | 'crop';
    gravity?: 'auto' | 'face' | 'faces' | 'center';
  }
): string {
  // Check if it's a Cloudinary URL
  if (!url.includes('res.cloudinary.com')) {
    return url;
  }

  const {
    width = 1200,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
  } = options || {};

  // Parse the URL to insert transformations
  const hasTransformations = /\/upload\/[^v]/.test(url);

  if (hasTransformations) {
    // URL already has transformations, return as is
    return url;
  }

  // Add optimized transformations
  const transformations = `w_${width},q_${quality},f_${format},c_${crop},g_${gravity}`;

  // Insert transformations after /upload/
  const optimizedUrl = url.replace(
    /\/upload\//,
    `/upload/${transformations}/`
  );

  return optimizedUrl;
}

/**
 * Extracts the public ID from a Cloudinary URL
 * @param url - The Cloudinary URL
 * @returns The public ID
 */
export function extractPublicId(url: string): string {
  // Pattern: https://res.cloudinary.com/{cloud}/{type}/upload/{transformations}/v{version}/{publicId}.{ext}
  const match = url.match(/\/v\d+\/([^/.]+)/);
  return match ? match[1] : url;
}

/**
 * Checks if a URL is a Cloudinary URL
 * @param url - The URL to check
 * @returns True if it's a Cloudinary URL
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes('res.cloudinary.com');
}

/**
 * Generates a responsive srcset for Cloudinary images
 * @param url - The Cloudinary image URL
 * @param widths - Array of widths for responsive images
 * @returns srcset string
 */
export function generateCloudinarySrcSet(
  url: string,
  widths: number[] = [640, 750, 828, 1080, 1200, 1920, 2048]
): string {
  if (!isCloudinaryUrl(url)) {
    return '';
  }

  return widths
    .map((width) => {
      const optimizedUrl = optimizeCloudinaryImage(url, { width });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
}

/**
 * Generates a smart poster URL from a Cloudinary video public ID
 * Uses video/upload instead of image/upload to extract frames from videos
 * @param publicId - The Cloudinary video public ID
 * @param options - Optional transformation parameters
 * @returns Optimized poster URL
 */
export function generateVideoPosterUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    quality?: 'auto' | 'auto:low' | 'auto:good' | 'auto:best';
  }
): string {
  const { width = 700, height = 500, quality = 'auto' } = options || {};
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dan7oa2bw';

  // Use video/upload instead of image/upload
  // so_auto: Automatically picks the best frame
  // f_auto: Optimizes format (WebP, AVIF, etc.)
  // q_auto: Optimizes quality
  // .jpg: Extracts a frame as JPEG
  return `https://res.cloudinary.com/${cloudName}/video/upload/so_auto,f_auto,q_${quality},c_limit,h_${height},w_${width}/${publicId}.jpg`;
}
