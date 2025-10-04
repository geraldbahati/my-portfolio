import HeroBioOverlay from "@/sections/hero-bio-overlay";
import InfoSection from "@/sections/info";
import ProjectsSectionPinned from "@/sections/horizontal-scroll-portfolio";
import ExpertiseFaqSection from "@/sections/faq";
import ContactSection from "@/sections/contact";
import BackgroundColorSwitcherWrapper from "@/components/BackgroundColorSwitcherWrapper.client";
import type { Metadata } from "next";

// SEO Metadata
export const metadata: Metadata = {
  title: "Gerald Bahati - Full Stack Developer & Digital Creative",
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
  openGraph: {
    title: "Gerald Bahati - Full Stack Developer & Digital Creative",
    description:
      "Experienced full stack developer specializing in modern web technologies, digital solutions, and creative design.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gerald Bahati - Full Stack Developer & Digital Creative",
    description:
      "Experienced full stack developer specializing in modern web technologies, digital solutions, and creative design.",
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

export default function Home() {
  return (
    <>
      {/* Background Color Switcher */}
      <BackgroundColorSwitcherWrapper
        targets={[
          {
            id: "ProjectsSectionPinned",
            color: "#ffffff",
            textColor: "#000000",
            threshold: 0.2,
          },
          {
            id: "ExpertiseFaqSection",
            color: "#000000",
            textColor: "#ffffff",
            threshold: 0.4,
          },
          {
            id: "ContactSection",
            color: "#000000",
            textColor: "#ffffff",
            threshold: 0.1,
          },
        ]}
        defaultColor="#ffffff"
        animationDuration={0.6}
        animationEasing="easeInOut"
      />

      {/* Hero and Bio with scroll-triggered overlay effect */}
      <HeroBioOverlay />

      {/* InfoSection and other sections - normal scrolling */}
      <InfoSection />
      <div id="ProjectsSectionPinned">
        <ProjectsSectionPinned />
      </div>
      <div id="ExpertiseFaqSection">
        <ExpertiseFaqSection />
      </div>
      <div id="ContactSection">
        <ContactSection />
      </div>

      {/* Debug Info - Remove in production */}
      {/*<BackgroundDebugInfo />*/}
    </>
  );
}
