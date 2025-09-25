import HeroSection from "@/sections/hero";
import BioSection from "@/sections/bio";
import InfoSection from "@/sections/info";
import ProjectsSectionPinned from "@/sections/horizontal-scroll-portfolio";
import ExpertiseFaqSection from "@/sections/faq";
import ContactSection from "@/sections/contact";

export default function Home() {
  return (
    <>
      <div className="relative min-h-screen bg-black text-white">
        <HeroSection />
        <BioSection />
      </div>
      {/* InfoSection outside the black container */}
      <InfoSection />
      <ProjectsSectionPinned />
      <ExpertiseFaqSection />
      <ContactSection />
    </>
  );
}
