import { PrivacyPolicy } from "@/components/PrivacyPolicy";
import { getPrivacyContent } from "@/lib/content";
import { generateStructuredData } from "@/lib/seo";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Privacy Policy | Gerald Bahati",
  description:
    "Learn how we collect, use, and protect your personal information. Our privacy policy outlines our commitment to your data security.",
  keywords: [
    "privacy policy",
    "data protection",
    "GDPR",
    "personal information",
    "data security",
  ],
  robots: "index, follow",
  alternates: {
    canonical: "https://yoursite.com/privacy",
    languages: {
      en: "https://yoursite.com/privacy",
      de: "https://yoursite.com/de/datenschutz",
    },
  },
  openGraph: {
    title: "Privacy Policy | Gerald Bahati",
    description:
      "Our commitment to protecting your personal information and data privacy.",
    url: "https://yoursite.com/privacy",
    siteName: "Your Company Name",
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

export default async function PrivacyPolicyPage() {
  const content = await getPrivacyContent();

  const structuredData = generateStructuredData({
    type: "Organization",
    name: "Your Company Name",
    url: "https://yoursite.com",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Privacy Inquiries",
      email: "privacy@yoursite.com",
    },
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Suspense fallback={<PrivacyPolicySkeleton />}>
        <PrivacyPolicy content={content} />
      </Suspense>
    </>
  );
}

function PrivacyPolicySkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl animate-pulse"></div>
                <div>
                  <div className="h-12 bg-white/20 rounded-lg w-80 mb-2 animate-pulse"></div>
                  <div className="h-6 bg-white/10 rounded w-96 animate-pulse"></div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <div className="w-4 h-4 bg-white/20 rounded animate-pulse"></div>
                <div className="h-4 bg-white/20 rounded w-48 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 sm:p-12 animate-pulse">
          <div className="space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
            </div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
