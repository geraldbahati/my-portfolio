"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import Image from "next/image";

// Optimized Text Section Component
const TextSection = ({
  section,
  index,
  sectionRef,
}: {
  section: any;
  index: number;
  sectionRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "end center"],
  });

  const opacity = useTransform(
    scrollYProgress,
    [0, 0.1, 0.9, 1],
    [0.3, 1, 1, 0.3],
  );
  const color = useTransform(
    scrollYProgress,
    [0, 0.1, 0.9, 1],
    [
      "var(--gray-400)",
      "var(--text-primary)",
      "var(--text-primary)",
      "var(--gray-400)",
    ],
  );

  return (
    <div ref={sectionRef} className="min-h-screen flex items-center py-16">
      <motion.div
        className="w-full"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        {section.label && (
          <motion.div
            className="mb-8 grid-interaction-blocked"
            style={{ opacity }}
          >
            <span className="inline-block text-sm font-medium uppercase tracking-[0.2em] text-accent-orange">
              {section.label}
            </span>
            <motion.div
              className="mt-3 h-[1px] bg-accent-orange-muted"
              style={{
                width: useTransform(scrollYProgress, [0, 1], ["0%", "100%"]),
              }}
            />
          </motion.div>
        )}

        <motion.h2
          className="text-6xl lg:text-7xl font-bold mb-12 tracking-tight transition-colors duration-500 grid-interaction-blocked"
          style={{ lineHeight: "0.9", color }}
        >
          {section.title}
        </motion.h2>

        {section.description && (
          <motion.p
            className="text-base mb-12 max-w-lg leading-relaxed transition-colors duration-500 grid-interaction-blocked"
            style={{
              color: useTransform(
                scrollYProgress,
                [0, 0.1, 0.9, 1],
                [
                  "var(--gray-400)",
                  "var(--gray-700)",
                  "var(--gray-700)",
                  "var(--gray-400)",
                ],
              ),
            }}
          >
            {section.description}
          </motion.p>
        )}

        {section.bullets && (
          <ul className="space-y-4 grid-interaction-blocked">
            {section.bullets.map((bullet: string, bulletIndex: number) => (
              <motion.li
                key={`bullet-${bulletIndex}`}
                className="flex items-start"
                style={{ opacity }}
              >
                <motion.svg
                  className="w-4 h-4 mt-1.5 mr-4 flex-shrink-0 transition-all duration-300"
                  style={{ color }}
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
                </motion.svg>
                <motion.span
                  className="text-base transition-colors duration-300"
                  style={{
                    color: useTransform(
                      scrollYProgress,
                      [0, 0.1, 0.9, 1],
                      [
                        "var(--gray-400)",
                        "var(--gray-700)",
                        "var(--gray-700)",
                        "var(--gray-400)",
                      ],
                    ),
                  }}
                >
                  {bullet}
                </motion.span>
              </motion.li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  );
};

// Optimized Image Panel Component
const ImagePanel = ({
  section,
  index,
  sectionRef,
  contentClassName,
}: {
  section: any;
  index: number;
  sectionRef: React.RefObject<HTMLDivElement | null>;
  contentClassName?: string;
}) => {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "start center"],
  });

  // Reveal from top to bottom as we scroll through the section
  // inset(top right bottom left)
  // 100% top inset = hidden
  // 0% top inset = visible
  const clipPath = useTransform(
    scrollYProgress,
    [0, 1],
    ["inset(100% 0 0 0)", "inset(0% 0 0 0)"],
  );

  return (
    <motion.div
      className={`absolute inset-0 w-full h-full ${contentClassName || ""}`}
      style={{
        clipPath: index === 0 ? "inset(0 0 0 0)" : clipPath, // First image always visible underneath
        zIndex: index + 1,
        willChange: "clip-path",
        transform: "translateZ(0)",
      }}
    >
      {section.content ? (
        section.content
      ) : section.image ? (
        <div className="relative w-full h-full overflow-hidden">
          {/* Background blurred image */}
          <div className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
            <Image
              src={section.image}
              alt={`${section.title} background`}
              fill
              className="object-cover"
              style={{
                filter: "blur(10px) brightness(0.95)",
                transform: "scale(1.1)",
              }}
              priority={index === 0}
              quality={50}
              sizes="(max-width: 1024px) 500px, 600px"
            />
          </div>

          {/* Centered sharp image - bigger size */}
          <div
            className="absolute inset-0 flex items-center justify-center p-8"
            style={{ zIndex: 2 }}
          >
            <div className="relative w-full max-w-[450px] aspect-square rounded-lg overflow-hidden shadow-2xl bg-white">
              <Image
                src={section.image}
                alt={section.title}
                fill
                className="object-cover"
                style={{
                  filter: "none",
                }}
                priority={index === 0}
                quality={95}
                sizes="(max-width: 1024px) 320px, 450px"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <span className="text-text-tertiary text-xl font-medium">
            {section.title}
          </span>
        </div>
      )}
    </motion.div>
  );
};

export const StickyScrollReveal = ({
  sections,
  contentClassName,
  containerClassName,
}: {
  sections: {
    label?: string;
    title: string;
    description?: string;
    bullets?: string[];
    content?: React.ReactNode;
    image?: string;
  }[];
  contentClassName?: string;
  containerClassName?: string;
}) => {
  const [isMobile, setIsMobile] = useState(false);

  // Create refs for each section
  // We use useMemo to ensure refs are stable across renders
  const sectionRefs = useMemo(
    () => sections.map(() => React.createRef<HTMLDivElement>()),
    [sections.length],
  );

  // Detect mobile/desktop
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Mobile Layout - Image above content
  if (isMobile) {
    return (
      <div className={`relative ${containerClassName || ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {sections.map((section, index) => (
            <div
              key={`section-mobile-${index}`}
              className="min-h-screen flex flex-col justify-center py-16"
            >
              {/* Image Section for Mobile */}
              <motion.div
                className="mb-12"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6 }}
              >
                <div
                  className={`relative w-full rounded-2xl overflow-hidden shadow-xl ${contentClassName || ""}`}
                  style={{
                    aspectRatio: "1/1",
                    maxWidth: "500px",
                    margin: "0 auto",
                  }}
                >
                  {section.content ? (
                    section.content
                  ) : section.image ? (
                    <div className="relative w-full h-full overflow-hidden">
                      {/* Background blurred image */}
                      <div
                        className="absolute inset-0 w-full h-full"
                        style={{ zIndex: 1 }}
                      >
                        <Image
                          src={section.image}
                          alt={`${section.title} background`}
                          fill
                          className="object-cover"
                          style={{
                            filter: "blur(10px) brightness(0.95)",
                            transform: "scale(1.1)",
                          }}
                          priority={index === 0}
                          quality={50}
                          sizes="(max-width: 640px) 90vw, 500px"
                        />
                      </div>

                      {/* Centered sharp image - bigger size */}
                      <div
                        className="absolute inset-0 flex items-center justify-center p-8"
                        style={{ zIndex: 2 }}
                      >
                        <div className="relative w-full max-w-[320px] aspect-square rounded-lg overflow-hidden shadow-2xl bg-white">
                          <Image
                            src={section.image}
                            alt={section.title}
                            fill
                            className="object-cover"
                            style={{
                              filter: "none",
                            }}
                            priority={index === 0}
                            quality={95}
                            sizes="(max-width: 640px) 70vw, 320px"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-text-tertiary text-lg font-medium text-center px-4">
                        {section.title}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Content Section for Mobile */}
              <motion.div
                className="w-full"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {section.label && (
                  <motion.div
                    className="mb-6 grid-interaction-blocked"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false }}
                    transition={{ duration: 0.5 }}
                  >
                    <span className="inline-block text-sm font-medium uppercase tracking-[0.2em] text-accent-orange">
                      {section.label}
                    </span>
                    <motion.div
                      className="mt-3 h-[1px] bg-accent-orange-muted"
                      initial={{ width: 0 }}
                      whileInView={{ width: 120 }}
                      viewport={{ once: false }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    />
                  </motion.div>
                )}

                <motion.h2
                  className="text-4xl sm:text-5xl font-bold mb-8 tracking-tight text-text-primary grid-interaction-blocked"
                  style={{ lineHeight: "1" }}
                >
                  {section.title}
                </motion.h2>

                {section.description && (
                  <motion.p className="text-base mb-8 max-w-lg leading-relaxed text-gray-700 grid-interaction-blocked">
                    {section.description}
                  </motion.p>
                )}

                {section.bullets && (
                  <ul className="space-y-3 grid-interaction-blocked">
                    {section.bullets.map((bullet, bulletIndex) => (
                      <motion.li
                        key={`bullet-mobile-${bulletIndex}`}
                        className="flex items-start"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: false }}
                        transition={{
                          duration: 0.5,
                          delay: 0.3 + bulletIndex * 0.05,
                        }}
                      >
                        <svg
                          className="w-4 h-4 mt-1.5 mr-3 flex-shrink-0 text-text-primary"
                          fill="currentColor"
                          viewBox="0 0 16 16"
                        >
                          <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
                        </svg>
                        <span className="text-base text-gray-700">
                          {bullet}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                )}
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Desktop Layout - Optimized sticky scroll design
  return (
    <div className={`relative ${containerClassName || ""}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative lg:flex lg:gap-16">
          {/* Left content - scrolls naturally */}
          <div className="lg:w-1/2">
            {sections.map((section, index) => (
              <TextSection
                key={`section-${index}`}
                section={section}
                index={index}
                sectionRef={sectionRefs[index]}
              />
            ))}
          </div>

          {/* Right sticky images with horizontal slide transition */}
          <div className="hidden lg:block lg:w-1/2">
            {/* Height wrapper that creates the scroll track */}
            <div
              className="relative"
              style={{
                height: `${(sections.length - 0.25) * 100}vh`,
              }}
            >
              {/* Spacer to push sticky element down so it starts centered with first content */}
              <div style={{ height: "calc(50vh - 300px)" }} />

              {/* Sticky container */}
              <motion.div
                className="w-full mx-auto"
                style={{
                  position: "sticky",
                  top: "calc(50vh - 300px)",
                  width: "600px",
                  height: "600px",
                  willChange: "transform",
                  transform: "translateZ(0)",
                }}
                initial={{ opacity: 0, y: 350 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {/* Image container */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                  {sections.map((section, index) => (
                    <ImagePanel
                      key={`image-${index}`}
                      section={section}
                      index={index}
                      sectionRef={sectionRefs[index]}
                      contentClassName={contentClassName}
                    />
                  ))}

                  {/* Progress indicator - Simplified for performance */}
                  {/* We could implement this with useScroll on the container if needed,
                      but for now we'll omit the complex global progress bar to save performance
                      or implement it simply if requested.
                      Since we removed global state, we can't easily show global progress
                      without a global useScroll, which is fine to omit for pure performance. */}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
