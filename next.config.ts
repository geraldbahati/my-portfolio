import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Clerk origins that must be allowed through the CSP.
 *
 * `*.clerk.accounts.dev` and `*.clerk.com` cover development instances. A
 * production instance on a custom domain serves clerk-js from its own
 * Frontend API host instead — `clerk.geraldbahati.dev` — which those wildcards
 * do NOT match. Omitting it blocks clerk.browser.js outright, so ClerkProvider
 * never initialises and the admin dashboard hangs on "Verifying admin session".
 */
const clerkOrigins = [
  "https://*.clerk.accounts.dev",
  "https://*.clerk.com",
  "https://clerk.geraldbahati.dev", // production Frontend API
  "https://accounts.geraldbahati.dev", // production account portal
].join(" ");

/**
 * A static CSP preserves Next.js static rendering and edge caching. A
 * nonce-based policy would force every page to render dynamically, which is
 * the wrong performance trade-off for a public portfolio.
 */
const contentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""} ${clerkOrigins};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self' data:;
  media-src 'self' blob: https://media.geraldbahati.dev https://customer-pdxnd9di8ybc2kur.cloudflarestream.com;
  connect-src 'self' https://*.convex.cloud wss://*.convex.cloud ${clerkOrigins} https://*.ingest.sentry.io https://*.ingest.us.sentry.io https://*.ingest.de.sentry.io https://eu.i.posthog.com https://eu-assets.i.posthog.com https://media.geraldbahati.dev https://customer-pdxnd9di8ybc2kur.cloudflarestream.com;
  frame-src 'self' ${clerkOrigins} https://customer-pdxnd9di8ybc2kur.cloudflarestream.com;
  worker-src 'self' blob:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  ${isDevelopment ? "" : "upgrade-insecure-requests;"}
`
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig: NextConfig = {
  // Vercel exposes VERCEL_ENV during the build. Publishing it explicitly keeps
  // client analytics off in development and previews without requiring a
  // second, manually maintained environment variable.
  env: {
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV ?? "",
  },

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
    formats: ["image/avif", "image/webp"], // AVIF first (smaller); WebP fallback
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year — images rarely change
    qualities: [50, 60, 75, 80, 85, 90, 95, 100],
  },

  // Experimental optimizations
  experimental: {
    optimizePackageImports: [
      "framer-motion",
      "motion",
      "lenis",
      "convex",
      "lucide-react",
    ],
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

  // PostHog's API rejects the trailing-slash redirect Next.js would otherwise
  // apply to the proxied ingest paths below.
  skipTrailingSlashRedirect: true,

  /**
   * First-party reverse proxy for PostHog.
   *
   * Tracker blockers drop requests to `*.i.posthog.com`, which silently kills
   * session replay and dead-click capture (they load `recorder.js` and
   * `dead-clicks-autocapture.js` from PostHog's asset host). Serving them from
   * this origin avoids that.
   *
   * `/gbx` is deliberately meaningless — blocklists match obvious names like
   * `/analytics`, `/tracking` or `/posthog`.
   *
   * Note this routes ingest traffic, including session-replay payloads, through
   * the host's metered egress. That is fine at portfolio traffic levels; if
   * volume ever grows, switch to PostHog's managed reverse proxy on a subdomain
   * and repoint NEXT_PUBLIC_POSTHOG_HOST at it — no code change needed.
   */
  async rewrites() {
    return [
      {
        source: "/gbx/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/gbx/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },

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
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG || "artlife-5r",
  project: process.env.SENTRY_PROJECT || "portfolio",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  telemetry: false,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
    deleteSourcemapsAfterUpload: true,
  },
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
    excludeReplayIframe: true,
    excludeReplayShadowDom: true,
  },
  webpack: {
    automaticVercelMonitors: false,
    treeshake: {
      removeDebugLogging: true,
      excludeReplayIframe: true,
      excludeReplayShadowDOM: true,
    },
  },
});
