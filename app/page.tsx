import HeroSection from "@/sections/hero";
import BioSection from "@/sections/bio";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <HeroSection />
      <BioSection />
    </div>
  );
}
