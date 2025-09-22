"use client";

import { StickyScrollReveal } from "@/components/ui/sticky-scroll-reveal";
import GridPattern from "@/components/ui/shadcn-io/grid-pattern";
import { motion } from "framer-motion";

export default function InfoSection() {
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
      content: (
        <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 flex items-center justify-center">
          <div className="bg-slate-950 rounded-xl p-6 w-full max-w-md shadow-inner">
            <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl tracking-wide">
                RUFF BAUGESELLSCHAFT
              </span>
            </div>
          </div>
        </div>
      ),
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
      content: (
        <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-gray-100 to-gray-200 p-8 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 shadow-xl">
            <div className="text-4xl font-bold mb-6 text-gray-900">
              Designko.
            </div>
            <div className="flex gap-4 mb-6">
              <div className="w-16 h-16 bg-gray-900 rounded-lg shadow-md"></div>
              <div className="w-16 h-16 bg-gray-600 rounded-lg shadow-md"></div>
              <div className="w-16 h-16 bg-blue-500 rounded-lg shadow-md"></div>
            </div>
            <div className="text-xl text-gray-700">
              <div className="font-bold">AaBbCc</div>
              <div className="text-gray-500">0123456</div>
            </div>
          </div>
        </div>
      ),
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
      content: (
        <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-12 flex items-center justify-center">
          <div className="flex gap-8">
            <div className="bg-green-500 rounded-xl px-8 py-6 text-white transform -rotate-3 shadow-2xl">
              <div className="font-bold text-2xl">iExplore</div>
            </div>
            <div className="bg-black rounded-xl px-8 py-6 text-white transform rotate-3 shadow-2xl">
              <div className="font-bold text-2xl">All Inquiries</div>
            </div>
          </div>
        </div>
      ),
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
      content: (
        <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-900 to-blue-900 p-8 flex items-center justify-center">
          <div className="bg-blue-600 rounded-xl p-10 text-white w-full max-w-md shadow-2xl">
            <div className="text-center">
              <div className="text-3xl font-bold mb-6 tracking-wide">
                WE&apos;RE LOOKING FOR YOU
              </div>
              <div className="w-32 h-32 bg-white/20 rounded-full mx-auto flex items-center justify-center backdrop-blur-sm">
                <svg
                  className="w-16 h-16 text-white/80"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="relative bg-white">
      {/* Grid Background Layer - Behind everything */}
      <div className="absolute inset-0 z-0">
        <GridPattern
          className="pointer-events-none"
          gridClassName="stroke-current/10"
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
              className="text-3xl md:text-4xl lg:text-5xl leading-none tracking-tight indent-8 md:indent-80 lg:indent-96"
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
}
