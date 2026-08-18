import { PrivacyPolicy } from "@/components/PrivacyPolicy";
import { getPrivacyContent } from "@/lib/content";
import {
  generateBreadcrumbSchema,
  generateStructuredData,
  PERSON_ID,
  privacyMetadata,
  SITE_URL,
} from "@/lib/seo";
import type { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { PageAnalytics } from "@/components/PageAnalytics";
import { JsonLdScript } from "@/components/JsonLdScript";

export const metadata: Metadata = privacyMetadata;

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
  const { markdown, headings = [] } = await getPrivacyContent();
  return <PrivacyPolicy markdown={markdown} headings={headings} />;
}

export default function PrivacyPolicyPage() {
  const breadcrumbLd = generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Privacy Policy", url: `${SITE_URL}/privacy` },
  ]);

  const structuredData = generateStructuredData({
    "@type": "Person",
    "@id": PERSON_ID,
    name: "Gerald Bahati",
    url: SITE_URL,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Privacy Inquiries",
      email: "contact@geraldbahati.dev",
    },
  });

  return (
    <>
      {/* Analytics - streams in, returns null */}
      <Suspense fallback={null}>
        <PageAnalytics />
      </Suspense>

      <JsonLdScript data={structuredData} />
      <JsonLdScript data={breadcrumbLd} />

      <Suspense fallback={<PrivacyContentSkeleton />}>
        <PrivacyContent />
      </Suspense>
    </>
  );
}
