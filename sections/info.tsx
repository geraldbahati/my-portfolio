"use client";

import { StickyScrollReveal } from "@/components/ui/sticky-scroll-reveal";
import GridPattern from "@/components/ui/shadcn-io/grid-pattern";
import { motion } from "framer-motion";
import Image from "next/image";

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
        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
          {/* Blurred background */}
          <Image
            src="/web-design.jpg"
            alt="Web Design Background"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
            quality={75}
            priority
            className="object-cover blur-md scale-110"
          />
          {/* Foreground card */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="relative w-[70%] h-[70%] rounded-xl overflow-hidden shadow-2xl">
              <Image
                src="/web-design.jpg"
                alt="Web Design"
                fill
                sizes="(max-width: 768px) 70vw, (max-width: 1200px) 35vw, 28vw"
                quality={85}
                priority
                className="object-cover"
              />
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
        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
          {/* Blurred background */}
          <Image
            src="/branding.jpg"
            alt="Branding Background"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
            quality={75}
            loading="lazy"
            className="object-cover blur-md scale-110"
          />
          {/* Foreground card */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="relative w-[70%] h-[70%] rounded-xl overflow-hidden shadow-2xl">
              <Image
                src="/branding.jpg"
                alt="Branding"
                fill
                sizes="(max-width: 768px) 70vw, (max-width: 1200px) 35vw, 28vw"
                quality={85}
                loading="lazy"
                className="object-cover"
              />
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
        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
          {/* Blurred background */}
          <Image
            src="/advertising.jpg"
            alt="Advertising Background"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
            quality={75}
            loading="lazy"
            className="object-cover blur-md scale-110"
          />
          {/* Foreground card */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="relative w-[70%] h-[70%] rounded-xl overflow-hidden shadow-2xl">
              <Image
                src="/advertising.jpg"
                alt="Advertising"
                fill
                sizes="(max-width: 768px) 70vw, (max-width: 1200px) 35vw, 28vw"
                quality={85}
                loading="lazy"
                className="object-cover"
              />
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
        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
          {/* Blurred background */}
          <Image
            src="/visibility.webp"
            alt="Visibility Background"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
            quality={75}
            loading="lazy"
            className="object-cover blur-md scale-110"
          />
          {/* Foreground card */}
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="relative w-[70%] h-[70%] rounded-xl overflow-hidden shadow-2xl">
              <Image
                src="/visibility.webp"
                alt="Visibility"
                fill
                sizes="(max-width: 768px) 70vw, (max-width: 1200px) 35vw, 28vw"
                quality={85}
                loading="lazy"
                className="object-cover"
              />
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
              className="text-3xl md:text-4xl lg:text-[51.2px] leading-none tracking-tight indent-8 md:indent-80 lg:indent-96"
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
