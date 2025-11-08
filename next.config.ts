import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'videos.pexels.com',
      },
    ],
    formats: ['image/webp', 'image/avif'], // Use modern formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    qualities: [50, 60, 75, 85, 90, 95, 100], // Added 50 for blur backgrounds and 95 for sharp center images
  },

  // Experimental optimizations
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
    turbopackFileSystemCacheForDev: true,
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Turbopack configuration
  turbopack: {
    root: __dirname,
  },

  cacheComponents: true,
  reactCompiler: true,
};

export default nextConfig;
