import type { Metadata } from "next";
import "@fontsource-variable/syne/wght.css";
import "@fontsource-variable/jetbrains-mono/wght.css";
import "./globals.css";
import { MotionProvider } from "@/components/MotionProvider";
import { LenisProvider } from "@/components/LenisProvider";
import { AnalyticsProvider } from "@/components/analytics-provider";
import DeferredProviders from "@/components/DeferredProviders";
import { SkipToContent } from "@/components/skip-to-content";
import { rootMetadata, SOCIAL_PROFILES } from "@/lib/seo";

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

export const metadata: Metadata = rootMetadata;

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
        <SkipToContent />
        <LenisProvider>
          <MotionProvider>{children}</MotionProvider>
        </LenisProvider>
        <DeferredProviders />
        <AnalyticsProvider />
      </body>
    </html>
  );
}
