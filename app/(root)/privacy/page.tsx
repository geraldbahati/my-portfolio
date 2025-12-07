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

// Generate headers for caching
export async function generateStaticParams() {
  return [];
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
      <PageAnalytics trackPageView trackScroll trackTime />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            Loading...
          </div>
        }
      >
        <PrivacyContent />
      </Suspense>
    </>
  );
}
