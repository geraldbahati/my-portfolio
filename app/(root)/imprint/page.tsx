import { Metadata } from "next";
import { Suspense } from "react";
// Client Component for interaction separation
import { ContactWrapper } from "@/components/imprint/contact-wrapper";
import { ContactSkeleton } from "@/components/imprint/contact-skeleton";
import imprintData from "@/constants/imprint.json";
import { generateBreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Imprint - Legal Notice & Business Information",
  description:
    "Legal notice and imprint information for Gerald Bahati's portfolio. Find business contact details, responsible parties, and regulatory compliance information as required by law.",
  keywords: [
    "imprint",
    "legal notice",
    "Gerald Bahati",
    "business information",
    "contact details",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: "/imprint",
  },
  openGraph: {
    title: "Imprint - Legal Notice & Business Information | Gerald Bahati",
    description:
      "Legal notice and imprint information for Gerald Bahati's portfolio. Find business contact details, responsible parties, and regulatory compliance information.",
    type: "website",
    url: "/imprint",
    locale: "en_KE",
  },
  twitter: {
    title: "Imprint - Legal Notice & Business Information | Gerald Bahati",
    description:
      "Legal notice and imprint information for Gerald Bahati's portfolio. Find business contact details, responsible parties, and regulatory compliance information.",
    card: "summary_large_image",
  },
};

const BASE_URL = "https://geraldbahati.dev";

export default function ImprintPage() {
  const breadcrumbLd = generateBreadcrumbSchema([
    { name: "Home", url: BASE_URL },
    { name: "Imprint", url: `${BASE_URL}/imprint` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <main className="min-h-screen pt-32 pb-20 px-6 lg:px-12 bg-background">
      <div className="max-w-3xl mx-auto">
        {/* Header - Static content */}
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-sans font-bold text-gray-900 dark:text-white mb-6">
            Imprint
          </h1>
          <div className="w-20 h-1 bg-primary rounded-full" />
        </header>

        <section className="space-y-12 font-sans text-gray-600 dark:text-zinc-400">
          {/* Legal Notice - Static */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
              Legal Notice
            </h2>
            <p>
              Information in accordance with the Data Protection Act, 2019
              (Kenya) and other relevant regulations.
            </p>
            <div className="p-6 bg-gray-50 dark:bg-zinc-900/30 rounded-2xl border border-gray-100 dark:border-zinc-800">
              <p className="text-lg font-medium text-gray-900 dark:text-zinc-100 mb-2">
                {imprintData.name}
              </p>
              <p>{imprintData.address.street}</p>
              <p>{imprintData.address.city}</p>
              <p>{imprintData.address.country}</p>
            </div>
          </div>

          {/* Contact - With Suspense for client component */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
              Contact Information
            </h2>
            <p className="border-l-2 border-primary/50 pl-4 py-1 italic">
              Please use the contact form or the information below to get in
              touch.
            </p>
            {/* Client Component wrapped in Suspense */}
            <Suspense fallback={<ContactSkeleton />}>
              <ContactWrapper />
            </Suspense>
          </div>

          {/* Responsible for Content - Static */}
          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-zinc-100">
                Responsible for Content
              </h3>
              <p>
                Person responsible for the content of this website:
                <br />
                {imprintData.responsibleForContent.name}
                <br />
                {imprintData.responsibleForContent.street}
                <br />
                {imprintData.responsibleForContent.city}
              </p>
            </div>
          </div>

          {/* Dispute Resolution - Static */}
          <div className="space-y-4 pt-8 border-t border-gray-100 dark:border-zinc-800">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
              Dispute Resolution
            </h2>
            <p>
              We are not willing or obliged to participate in dispute resolution
              proceedings before a consumer arbitration board.
            </p>
          </div>
        </section>
      </div>
    </main>
    </>
  );
}
