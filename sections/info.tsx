"use client";

import React, { memo } from "react";
import { StickyScrollReveal } from "@/components/ui/sticky-scroll-reveal";
import GridPattern from "@/components/ui/shadcn-io/grid-pattern";
import { motion } from "framer-motion";

// Static sections data - defined outside component to prevent recreation on each render
const sections = [
  {
    label: "FOUNDATION",
    title: "Web Design",
    description:
      "Guaranteed uniqueness – I create the optimal foundation for your digital presence with an eye for detail and aesthetics.",
    bullets: [
      "Web design and development",
      "Design implementation (e.g., Figma)",
      "Creation of interactive designs for development",
      "E-commerce platforms and online stores",
      "Website redesign and relaunch",
      "UI and UX optimization",
    ],
    image: "/web-design.jpg",
  },
  {
    label: "PHASE 1",
    title: "Branding",
    description:
      "Whether redesigning a systematic brand message or developing a fresh digital presence – your brand is in the best hands with me.",
    bullets: [
      "Corporate (Re)Design",
      "Brand strategy and positioning",
      "Brand messaging and communication",
    ],
    image: "/branding.jpg",
  },
  {
    label: "PHASE 2",
    title: "Advertising",
    description:
      "Quick results through conversion-optimized digital campaigns – tailored to your goals and precisely targeted to the right platforms.",
    bullets: [
      "E-commerce, lead generation, recruiting, etc.",
      "Landing page and creative development",
      "GDPR-compliant and data-driven tracking",
      "Ad creation and optimization",
    ],
    image: "/advertising.jpg",
  },
  {
    label: "PHASE 3",
    title: "Visibility",
    description:
      "Long-term and sustainable visibility through search engine optimization and content management.",
    bullets: [
      "Search engine optimization (SEO)",
      "Content strategy and copywriting",
      "Digital placements and affiliates",
    ],
    image: "/visibility.webp",
  },
];

const InfoSection = memo(function InfoSection() {
  return (
    <div className="relative bg-white">
      {/* Grid Background Layer - Behind everything */}
      <div className="absolute inset-0 z-0">
        <GridPattern
          className="pointer-events-none"
          gridClassName="stroke-current/5"
          width={32}
          height={32}
          strokeDasharray="0"
          surroundingCells={4}
          surroundingRadius={1}
        />
      </div>

      {/* Content Layer - Fully interactive, no pointer-events manipulation */}
      <div className="relative z-10">
        <StickyScrollReveal
          sections={sections}
          containerClassName="bg-transparent"
        />

        {/* Closing paragraph */}
        <div className="w-full px-8 flex items-center justify-center min-h-[30vh]">
          <div className="max-w-7xl mx-auto">
            <motion.p
              className="text-3xl md:text-4xl lg:text-[51.2px] leading-none tracking-tight indent-8 md:indent-80 lg:indent-96 grid-interaction-blocked"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <span>Web design, marketing, and SEO</span> are like puzzle pieces
              – individually strong, but only truly powerful when perfectly
              combined. With my experience, I merge these elements into a
              creative and profitable unit that shapes your digital success.
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
});

InfoSection.displayName = "InfoSection";

export default InfoSection;
