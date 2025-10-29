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
    qualities: [60, 75, 85, 90, 100], // Added 60 for mobile optimization
  },

  // Experimental optimizations
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
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
};

export default nextConfig;
