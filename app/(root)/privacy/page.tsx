import { PrivacyPolicyWrapper } from "@/components/PrivacyPolicyWrapper";
import { getPrivacyContent } from "@/lib/content";
import { generateStructuredData } from "@/lib/seo";
import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { PageAnalytics } from "@/components/PageAnalytics";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how we collect, use, and protect your personal information. Our privacy policy outlines our commitment to your data security.",
  keywords: [
    "privacy policy",
    "data protection",
    "GDPR",
    "personal information",
    "data security",
  ],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy | Gerald Bahati",
    description:
      "Our commitment to protecting your personal information and data privacy.",
    url: "/privacy",
    siteName: "Gerald Bahati Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | Gerald Bahati",
    description:
      "Our commitment to protecting your personal information and data privacy.",
  },
};

// Skeleton component for inline Suspense fallback
function PrivacyContentSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-32">
        <div className="bg-card rounded-3xl shadow-xl border border-border p-8 sm:p-12 animate-pulse">
          {/* Title skeleton */}
          <div className="h-10 bg-muted rounded w-1/3 mb-8" />
          {/* Last updated skeleton */}
          <div className="h-4 bg-muted rounded w-1/4 mb-12" />
          {/* Content sections skeleton */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-1/2" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-5/6" />
                <div className="h-4 bg-muted rounded w-4/6" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-6 bg-muted rounded w-2/5" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Separate async component that handles dynamic data
async function PrivacyContent() {
  await connection();
  const content = await getPrivacyContent();
  return <PrivacyPolicyWrapper content={content} />;
}

export default function PrivacyPolicyPage() {
  const structuredData = generateStructuredData({
    type: "Organization",
    name: "Gerald Bahati",
    url: "https://geraldbahati.dev",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Privacy Inquiries",
      email: "bahatigerald0@gmail.com",
    },
  });

  return (
    <>
      {/* Analytics - streams in, returns null */}
      <Suspense fallback={null}>
        <PageAnalytics trackPageView trackScroll trackTime />
      </Suspense>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Suspense fallback={<PrivacyContentSkeleton />}>
        <PrivacyContent />
      </Suspense>
    </>
  );
}
