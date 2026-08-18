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
import { FAQ_ENTRIES } from "@/constants/faq-data";
import { homeMetadata, homepageGraph } from "@/lib/seo";

// Below-fold: lazy-loaded client components for code-splitting
const InfoSection = dynamic(() => import("@/sections/info"), {
  loading: () => <div className="min-h-screen bg-white" />,
});
const ContactSection = dynamic(() => import("@/sections/contact"), {
  loading: () => <div className="h-[60vh] bg-gray-950" />,
});

export const metadata: Metadata = homeMetadata;

const homepageLd = homepageGraph(FAQ_ENTRIES);

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
