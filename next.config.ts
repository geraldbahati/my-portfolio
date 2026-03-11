import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "videos.pexels.com",
      },
      {
        protocol: "https",
        hostname: "customer-pdxnd9di8ybc2kur.cloudflarestream.com",
      },
      {
        protocol: "https",
        hostname: "cdn.dribbble.com",
      },
      {
        protocol: "https",
        hostname: "media.geraldbahati.dev",
      },
    ],
    formats: ["image/webp", "image/avif"], // Use modern formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year — images rarely change
    qualities: [50, 60, 75, 80, 85, 90, 95, 100],
  },

  // Experimental optimizations
  experimental: {
    optimizePackageImports: ["framer-motion", "lucide-react"],
    turbopackFileSystemCacheForDev: true,
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Turbopack configuration
  turbopack: {
    root: __dirname,
  },

  cacheComponents: true,
  reactCompiler: true,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY", // Mitigates clickjacking
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff", // Prevents MIME type sniffing
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin", // Privacy
          },
          {
            key: "Strict-Transport-Security", // HSTS
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
