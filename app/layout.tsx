import type { Metadata } from "next";
import "@fontsource-variable/syne/wght.css";
import "@fontsource-variable/jetbrains-mono/wght.css";
import "./globals.css";
import { MotionProvider } from "@/components/MotionProvider";
import { LenisProvider } from "@/components/LenisProvider";
import { AnalyticsProvider } from "@/components/analytics-provider";
import DeferredProviders from "@/components/DeferredProviders";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  SOCIAL_PROFILES,
} from "@/lib/seo";

/**
 * Ported from a stray `app/(root)/contact/head.tsx`, which used the legacy
 * `head.tsx` convention that Next.js 16 no longer supports — so the preconnect
 * it declared was never actually emitted.
 */
function getConvexOrigin() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return null;
  }

  try {
    return new URL(convexUrl).origin;
  } catch {
    return null;
  }
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: "%s | Gerald Bahati",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "Gerald Bahati",
    "product engineer",
    "software engineer",
    "full stack developer",
    "React developer",
    "Next.js expert",
    "Spring Boot developer",
    "Go developer",
    "TypeScript",
    "Node.js",
    "e-commerce developer",
    "fintech engineer",
    "real-time systems",
    "AI integration",
    "Kenya software engineer",
    "Nairobi developer",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: "Gerald Bahati",
  publisher: "Gerald Bahati",
  manifest: "/manifest.webmanifest",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    creator: "@gerald_baha",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  category: "technology",
  other: {
    "color-scheme": "light only",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const convexOrigin = getConvexOrigin();

  return (
    <html lang="en-KE">
      <head>
        {SOCIAL_PROFILES.map((profile) => (
          <link key={profile} rel="me" href={profile} />
        ))}
        {convexOrigin && (
          <>
            <link rel="preconnect" href={convexOrigin} crossOrigin="" />
            <link
              rel="dns-prefetch"
              href={`//${new URL(convexOrigin).hostname}`}
            />
          </>
        )}
        <link
          rel="preconnect"
          href="https://customer-pdxnd9di8ybc2kur.cloudflarestream.com"
          crossOrigin=""
        />
        <link
          rel="dns-prefetch"
          href="//customer-pdxnd9di8ybc2kur.cloudflarestream.com"
        />
        <link
          rel="preconnect"
          href="https://media.geraldbahati.dev"
          crossOrigin=""
        />
        <link rel="dns-prefetch" href="//media.geraldbahati.dev" />
      </head>
      <body className="antialiased bg-background">
        <LenisProvider>
          <MotionProvider>{children}</MotionProvider>
        </LenisProvider>
        <DeferredProviders />
        <AnalyticsProvider />
      </body>
    </html>
  );
}
