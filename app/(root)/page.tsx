import type { Metadata } from "next";

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
import { JsonLdScript } from "@/components/JsonLdScript";
import {
  PERSON_ID,
  PROFILE_PAGE_ID,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  SOCIAL_PROFILES,
  WEBSITE_ID,
} from "@/lib/seo";

// Below-fold: lazy-loaded client components for code-splitting
const InfoSection = dynamic(() => import("@/sections/info"), {
  loading: () => <div className="min-h-screen bg-white" />,
});
const ContactSection = dynamic(() => import("@/sections/contact"), {
  loading: () => <div className="h-[60vh] bg-gray-950" />,
});

// SEO Metadata
export const metadata: Metadata = {
  title: {
    absolute: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Gerald Bahati",
    "Gerald Bahati software engineer",
    "Gerald Bahati portfolio",
    "Nairobi software engineer",
    "Kenya software engineer",
    "product software engineer",
    "full-stack software engineer",
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
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "en_KE",
    url: "/",
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
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const homepageLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      name: SITE_NAME,
      alternateName: "Gerald Bahati Portfolio",
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      inLanguage: "en-KE",
      publisher: { "@id": PERSON_ID },
    },
    {
      "@type": "ProfilePage",
      "@id": PROFILE_PAGE_ID,
      url: SITE_URL,
      name: SITE_TITLE,
      description: SITE_DESCRIPTION,
      inLanguage: "en-KE",
      isPartOf: { "@id": WEBSITE_ID },
      mainEntity: { "@id": PERSON_ID },
    },
    {
      "@type": "Person",
      "@id": PERSON_ID,
      name: SITE_NAME,
      url: SITE_URL,
      image: {
        "@type": "ImageObject",
        url: `${SITE_URL}/hero-image.webp`,
      },
      jobTitle: "Full-Stack Software Engineer",
      description: SITE_DESCRIPTION,
      email: "contact@geraldbahati.dev",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Nairobi",
        addressCountry: "KE",
      },
      knowsAbout: [
        "Full-stack software engineering",
        "React",
        "Next.js",
        "TypeScript",
        "Go",
        "Java",
        "E-commerce platforms",
        "Real-time systems",
      ],
      sameAs: SOCIAL_PROFILES,
      mainEntityOfPage: { "@id": PROFILE_PAGE_ID },
    },
  ],
};

/** Static homepage shell; below-fold sections retain their own fallbacks. */
export default function Home() {
  return (
    <main id="main-content">
      <JsonLdScript data={homepageLd} />

      <PageAnalytics />

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
      <div className="bg-gray-950">
        <div id="ContactSection">
          <ContactSection />
        </div>
      </div>
    </main>
  );
}
