"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

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
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafIdRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef(0);

  // Detect mobile/desktop
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Optimized scroll handler with RAF throttling
  const updateScrollPosition = useCallback(() => {
    const now = performance.now();

    // Throttle to ~60fps
    if (now - lastUpdateTimeRef.current < 16) {
      rafIdRef.current = requestAnimationFrame(updateScrollPosition);
      return;
    }

    lastUpdateTimeRef.current = now;
    const windowHeight = window.innerHeight;

    // Find which section we're in and the progress through it
    let foundActiveSection = false;

    for (let index = 0; index < sectionRefs.current.length; index++) {
      const ref = sectionRefs.current[index];
      if (!ref) continue;

      const rect = ref.getBoundingClientRect();
      const sectionTop = rect.top;
      const sectionHeight = rect.height;

      // Check if this section is the active one
      if (
        sectionTop <= windowHeight * 0.5 &&
        sectionTop > -sectionHeight + windowHeight * 0.5
      ) {
        // Calculate progress through this specific section (0 to 1)
        const progress = 1 - sectionTop / (windowHeight * 0.5);
        const clampedProgress = Math.max(0, Math.min(1, progress));

        // Only update state if changed (reduces re-renders)
        setActiveSection(prev => prev !== index ? index : prev);
        setScrollProgress(clampedProgress);
        foundActiveSection = true;
        break; // Early exit once we found active section
      }
    }

    if (!foundActiveSection) {
      rafIdRef.current = requestAnimationFrame(updateScrollPosition);
    }
  }, []);

  // Track which section is in view and scroll progress
  useEffect(() => {
    const handleScroll = () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(updateScrollPosition);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [updateScrollPosition]);

  // Memoize clip path calculation for performance
  const calculateClipPath = useCallback((index: number) => {
    const isActive = activeSection === index;
    const isPrevious = activeSection === index + 1;

    if (index === 0) {
      if (isActive || (activeSection === 1 && scrollProgress < 1)) {
        if (activeSection === 1 && scrollProgress < 1) {
          return `inset(0 0 ${scrollProgress * 100}% 0)`;
        }
        return "inset(0 0 0 0)";
      }
      return "inset(0 0 100% 0)";
    }

    if (isActive) {
      return `inset(${100 - scrollProgress * 100}% 0 0 0)`;
    }
    if (isPrevious && scrollProgress < 1) {
      return `inset(0 0 ${scrollProgress * 100}% 0)`;
    }
    if (index < activeSection) {
      return "inset(0 0 0 0)";
    }
    return "inset(0 0 100% 0)";
  }, [activeSection, scrollProgress]);

  // Mobile Layout - Image above content
  if (isMobile) {
    return (
      <div className={`relative ${containerClassName || ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {sections.map((section, index) => (
            <div
              key={`section-mobile-${index}`}
              ref={(el) => {
                sectionRefs.current[index] = el;
              }}
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
                    <Image
                      src={section.image}
                      alt={section.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <span className="text-gray-600 text-lg font-medium text-center px-4">
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
                    <span className="inline-block text-sm font-medium uppercase tracking-[0.2em] text-orange-500">
                      {section.label}
                    </span>
                    <motion.div
                      className="mt-3 h-[1px] bg-orange-500/30"
                      initial={{ width: 0 }}
                      whileInView={{ width: 120 }}
                      viewport={{ once: false }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    />
                  </motion.div>
                )}

                <motion.h2
                  className="text-4xl sm:text-5xl font-bold mb-8 tracking-tight text-black grid-interaction-blocked"
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
                          className="w-4 h-4 mt-1.5 mr-3 flex-shrink-0 text-black"
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

  // Desktop Layout - Original sticky scroll design
  return (
    <div className={`relative ${containerClassName || ""}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative lg:flex lg:gap-16">
          {/* Left content - scrolls naturally */}
          <div className="lg:w-1/2">
            {sections.map((section, index) => (
              <div
                key={`section-${index}`}
                ref={(el) => {
                  sectionRefs.current[index] = el;
                }}
                className="min-h-screen flex items-center py-16"
              >
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
                      initial={{ opacity: 0, x: -20 }}
                      animate={{
                        opacity: activeSection === index ? 1 : 0.3,
                        x: activeSection === index ? 0 : -20,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <span className="inline-block text-sm font-medium uppercase tracking-[0.2em] text-orange-500">
                        {section.label}
                      </span>
                      <motion.div
                        className="mt-3 h-[1px] bg-orange-500/30"
                        initial={{ width: 0 }}
                        animate={{ width: activeSection === index ? 120 : 0 }}
                        transition={{ duration: 0.5 }}
                      />
                    </motion.div>
                  )}

                  <motion.h2
                    className={`text-6xl lg:text-7xl font-bold mb-12 tracking-tight transition-colors duration-500 grid-interaction-blocked ${
                      activeSection === index ? "text-black" : "text-gray-400"
                    }`}
                    style={{ lineHeight: "0.9" }}
                  >
                    {section.title}
                  </motion.h2>

                  {section.description && (
                    <motion.p
                      className={`text-base mb-12 max-w-lg leading-relaxed transition-colors duration-500 grid-interaction-blocked ${
                        activeSection === index
                          ? "text-gray-700"
                          : "text-gray-400"
                      }`}
                    >
                      {section.description}
                    </motion.p>
                  )}

                  {section.bullets && (
                    <ul className="space-y-4 grid-interaction-blocked">
                      {section.bullets.map((bullet, bulletIndex) => (
                        <motion.li
                          key={`bullet-${bulletIndex}`}
                          className="flex items-start"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{
                            opacity: activeSection === index ? 1 : 0.4,
                            x: activeSection === index ? 0 : -10,
                          }}
                          transition={{
                            duration: 0.5,
                            delay: bulletIndex * 0.05,
                          }}
                        >
                          <svg
                            className={`w-4 h-4 mt-1.5 mr-4 flex-shrink-0 transition-all duration-300 ${
                              activeSection === index
                                ? "text-black"
                                : "text-gray-400"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 16 16"
                          >
                            <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
                          </svg>
                          <span
                            className={`text-base transition-colors duration-300 ${
                              activeSection === index
                                ? "text-gray-700"
                                : "text-gray-400"
                            }`}
                          >
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

          {/* Right sticky images with horizontal slide transition */}
          <div className="hidden lg:block lg:w-1/2">
            {/* Height wrapper that creates the scroll track - reduced height so images scroll away with last section */}
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
                {/* Image container with clip path for slide effect */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                  {sections.map((section, index) => {
                    const isActive = activeSection === index;
                    const isPrevious = activeSection === index + 1;

                    return (
                      <div
                        key={`image-${index}`}
                        className={`absolute inset-0 w-full h-full ${contentClassName || ""}`}
                        style={{
                          clipPath: calculateClipPath(index),
                          zIndex:
                            index === 0 && (isActive || isPrevious)
                              ? 25
                              : isActive
                                ? 20
                                : isPrevious
                                  ? 10
                                  : index < activeSection
                                    ? 5
                                    : 1,
                          willChange: "clip-path",
                          transform: "translateZ(0)",
                        }}
                      >
                        {section.content ? (
                          section.content
                        ) : section.image ? (
                          <div className="w-full h-full">
                            <Image
                              src={section.image}
                              alt={section.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <span className="text-gray-600 text-xl font-medium">
                              {section.title}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Progress indicator */}
                  <div className="absolute bottom-4 left-4 right-4 h-1 bg-black/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 transition-all duration-100"
                      style={{
                        width: `${((activeSection + scrollProgress) / sections.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
