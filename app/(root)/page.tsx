import type { Metadata } from "next";
import { cacheLife } from "next/cache";

// Component imports
import HeroBioOverlay from "@/sections/hero-bio-overlay";
import { SectionDivider } from "@/components/section-divider";
import InfoSection from "@/sections/info";
import CombinedProjectsFaqWrapper from "@/sections/combined-projects-faq-wrapper";
import ContactSection from "@/sections/contact";
import { PageAnalytics } from "@/components/PageAnalytics";

// SEO Metadata
export const metadata: Metadata = {
  title: "Home",
  description:
    "Experienced full stack developer specializing in modern web technologies, digital solutions, and creative design. Explore my portfolio of websites, applications, and client projects.",
  keywords: [
    "full stack developer",
    "web developer",
    "digital creative",
    "portfolio",
    "web design",
    "Next.js",
    "React",
    "TypeScript",
    "modern web technologies",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Gerald Bahati - Full Stack Developer & Digital Creative",
    description:
      "Experienced full stack developer specializing in modern web technologies, digital solutions, and creative design.",
    type: "website",
    locale: "en_US",
    url: "/",
    images: [
      {
        url: "https://geraldbahati.dev/original.jpeg",
        width: 1200,
        height: 630,
        alt: "Gerald Bahati - Full Stack Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gerald Bahati - Full Stack Developer & Digital Creative",
    description:
      "Experienced full stack developer specializing in modern web technologies, digital solutions, and creative design.",
    images: ["https://geraldbahati.dev/original.jpeg"],
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

export default async function Home() {
  "use cache";
  cacheLife("hours");

  return (
    <>
      <PageAnalytics trackPageView trackScroll trackTime />
      {/* Hero and Bio with scroll-triggered overlay effect */}
      <HeroBioOverlay />

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

      {/* InfoSection and other sections - normal scrolling */}
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

      <div id="CombinedProjectsFaqSection">
        <CombinedProjectsFaqWrapper />
      </div>

      <div className="bg-black">
        <div id="ContactSection">
          <ContactSection />
        </div>
      </div>

      {/* Debug Info - Remove in production */}
      {/*<BackgroundDebugInfo />*/}
    </>
  );
}
