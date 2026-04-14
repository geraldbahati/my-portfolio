import type { Metadata } from "next";
import { cacheLife } from "next/cache";

// Server components (zero JS cost)
import HeroContent from "@/sections/hero-content";
import BioContent from "@/sections/bio-content";

// Thin client shell (small JS - vanilla scroll, no motion/react)
import HeroBioOverlayShell from "@/sections/hero-bio-overlay-shell";

import dynamic from "next/dynamic";

// Component imports
import { SectionDivider } from "@/components/section-divider";
import CombinedProjectsFaqWrapper from "@/sections/combined-projects-faq-wrapper";
import { PageAnalytics } from "@/components/PageAnalytics";

// Below-fold: lazy-loaded client components for code-splitting
const InfoSection = dynamic(() => import("@/sections/info"), {
  loading: () => <div className="min-h-screen bg-white" />,
});
const ContactSection = dynamic(() => import("@/sections/contact"), {
  loading: () => <div className="h-[60vh] bg-black" />,
});

// SEO Metadata
export const metadata: Metadata = {
  title: {
    absolute: "Gerald Bahati - Product Software Engineer | 2+ Years Experience",
  },
  description:
    "Product Software Engineer with 2+ years shipping production e-commerce and fintech experiences. Specializing in React, Next.js, Spring Boot, Go, and real-time systems with measurable business impact.",
  keywords: [
    "product software engineer",
    "software engineer",
    "portfolio",
    "Next.js",
    "React",
    "TypeScript",
    "Spring Boot",
    "Go",
    "e-commerce",
    "fintech",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Gerald Bahati - Product Software Engineer | 2+ Years Experience",
    description:
      "Product Software Engineer with 2+ years shipping production e-commerce and fintech experiences. Specializing in React, Next.js, Spring Boot, Go, and real-time systems with measurable business impact.",
    type: "website",
    locale: "en_KE",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gerald Bahati - Product Software Engineer | 2+ Years Experience",
    description:
      "Product Software Engineer with 2+ years shipping production e-commerce and fintech experiences. Specializing in React, Next.js, Spring Boot, Go, and real-time systems.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const BASE_URL = "https://geraldbahati.dev";

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Gerald Bahati Portfolio",
  url: BASE_URL,
};

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Gerald Bahati",
  url: BASE_URL,
  jobTitle: "Product Software Engineer",
  email: "contact@geraldbahati.dev",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Nairobi",
    addressCountry: "KE",
  },
  sameAs: [
    "https://www.linkedin.com/in/geraldbahati/",
    "https://github.com/geraldbahati",
    "https://x.com/gerald_baha",
  ],
};

export default async function Home() {
  "use cache";
  cacheLife("hours");

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(websiteLd)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(personLd)}
      </script>

      <PageAnalytics trackPageView trackScroll trackTime />

      {/* Hero and Bio with scroll-triggered overlay effect */}
      <HeroBioOverlayShell
        heroSlot={<HeroContent />}
        bioSlot={<BioContent />}
      />

      {/* Section Divider */}
      <section className="relative bg-white py-16 sm:py-20 lg:py-24">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionDivider
            label="SERVICES IN DETAIL"
            counter="(02)"
            duration={2}
          />
        </div>
      </section>

      {/* Info Section */}
      <InfoSection />

      {/* Section Divider */}
      <section className="relative bg-white py-16">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionDivider
            label="FEATURED PROJECTS"
            counter="(03)"
            duration={2}
          />
        </div>
      </section>

      {/* Combined Projects and FAQ Section */}
      <div id="CombinedProjectsFaqSection">
        <CombinedProjectsFaqWrapper />
      </div>

      {/* Contact Section */}
      <div className="bg-black">
        <div id="ContactSection">
          <ContactSection />
        </div>
      </div>
    </>
  );
}
