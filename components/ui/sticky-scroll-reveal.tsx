"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  memo,
} from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import Image from "next/image";

// ============================================================================
// Image Preloading Hook - Preloads upcoming images before they're needed
// ============================================================================

function useImagePreloader(
  images: (string | undefined)[],
  currentIndex: number,
  preloadAhead = 2,
) {
  const preloadedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Preload current and next N images
    const indicesToPreload = Array.from(
      { length: preloadAhead + 1 },
      (_, i) => currentIndex + i,
    ).filter((i) => i < images.length);

    indicesToPreload.forEach((index) => {
      const src = images[index];
      if (src && !preloadedRef.current.has(src)) {
        const img = new window.Image();
        img.src = src;
        preloadedRef.current.add(src);
      }
    });
  }, [currentIndex, images, preloadAhead]);
}

// Hook to track which section is currently active based on scroll position
function useActiveSectionIndex(
  sectionRefs: React.RefObject<HTMLDivElement | null>[],
): number {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sectionRefs.forEach((ref, index) => {
      if (!ref.current) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
              setActiveIndex(index);
            }
          });
        },
        { threshold: [0.3, 0.5, 0.7], rootMargin: "-20% 0px -20% 0px" },
      );

      observer.observe(ref.current);
      observers.push(observer);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, [sectionRefs]);

  return activeIndex;
}

interface TextSectionProps {
  section: {
    label?: string;
    title: string;
    description?: string;
    bullets?: string[];
  };
  index: number;
  sectionRef: React.RefObject<HTMLDivElement | null>;
}

const TextSection = memo(({ section, index, sectionRef }: TextSectionProps) => {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "end center"],
  });

  // Extract all useTransform calls to component body (stable references)
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.1, 0.9, 1],
    [0.3, 1, 1, 0.3],
  );
  const labelWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const titleColor = useTransform(
    scrollYProgress,
    [0, 0.1, 0.9, 1],
    [
      "var(--gray-400)",
      "var(--text-primary)",
      "var(--text-primary)",
      "var(--gray-400)",
    ],
  );
  const descriptionColor = useTransform(
    scrollYProgress,
    [0, 0.1, 0.9, 1],
    [
      "var(--gray-400)",
      "var(--gray-700)",
      "var(--gray-700)",
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
              style={{ width: labelWidth }}
            />
          </motion.div>
        )}

        <motion.h2
          className="text-6xl lg:text-7xl font-bold mb-12 tracking-tight transition-colors duration-500 grid-interaction-blocked"
          style={{ lineHeight: "0.9", color: titleColor }}
        >
          {section.title}
        </motion.h2>

        {section.description && (
          <motion.p
            className="text-base mb-12 max-w-lg leading-relaxed transition-colors duration-500 grid-interaction-blocked"
            style={{ color: descriptionColor }}
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
                  style={{ color: titleColor }}
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
                </motion.svg>
                <motion.span
                  className="text-base transition-colors duration-300"
                  style={{ color: descriptionColor }}
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
});

TextSection.displayName = "TextSection";

interface ImagePanelProps {
  section: {
    title: string;
    content?: React.ReactNode;
    image?: string;
  };
  index: number;
  contentClassName?: string;
  shouldLoad: boolean;
  registerRef: (index: number, el: HTMLDivElement | null) => void;
}

const ImagePanel = memo(
  ({
    section,
    index,
    contentClassName,
    shouldLoad,
    registerRef,
  }: ImagePanelProps) => {
    return (
      <div
        ref={(el) => registerRef(index, el)}
        className={`absolute inset-0 w-full h-full ${contentClassName || ""}`}
        style={{
          clipPath: index === 0 ? "inset(0 0 0 0)" : "inset(100% 0 0 0)",
          zIndex: index + 1,
          transform: "translateZ(0)",
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
                loading={shouldLoad ? "eager" : "lazy"}
                quality={50}
                sizes="(max-width: 1024px) 500px, 600px"
              />
            </div>

            {/* Centered sharp image */}
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
                  priority={index === 0}
                  loading={shouldLoad ? "eager" : "lazy"}
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
      </div>
    );
  },
);

ImagePanel.displayName = "ImagePanel";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

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

  // Ref registry for image panels - for direct DOM updates
  const imagePanelRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Create refs for each section
  const sectionRefs = useMemo(
    () => sections.map(() => React.createRef<HTMLDivElement>()),
    [sections.length],
  );

  // Extract image URLs for preloading
  const imageUrls = useMemo(() => sections.map((s) => s.image), [sections]);

  // Track active section for preloading
  const activeIndex = useActiveSectionIndex(sectionRefs);

  // Preload upcoming images (current + next 2)
  useImagePreloader(imageUrls, activeIndex, 2);

  // Register/unregister image panel refs
  const registerImagePanelRef = useCallback(
    (index: number, el: HTMLDivElement | null) => {
      if (el) {
        imagePanelRefs.current.set(index, el);
      } else {
        imagePanelRefs.current.delete(index);
      }
    },
    [],
  );

  // ============================================================================
  // SINGLE SCROLL SUBSCRIPTION for all image panel clipPaths
  // Replaces N separate useScroll hooks with one consolidated handler
  // ============================================================================
  useEffect(() => {
    if (isMobile) return;

    const handleScroll = () => {
      sectionRefs.forEach((sectionRef, index) => {
        if (!sectionRef.current || index === 0) return;

        const panelEl = imagePanelRefs.current.get(index);
        if (!panelEl) return;

        const rect = sectionRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Calculate progress: 0 when section bottom is at viewport bottom,
        // 1 when section top is at viewport center
        const sectionCenter = rect.top + rect.height / 2;
        const start = viewportHeight; // When section bottom enters viewport
        const end = viewportHeight / 2; // When section top reaches center

        const progress = Math.min(
          1,
          Math.max(0, (start - sectionCenter) / (start - end)),
        );

        // Calculate clipPath based on progress
        const clipValue = `inset(${(1 - progress) * 100}% 0 0 0)`;
        panelEl.style.clipPath = clipValue;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => window.removeEventListener("scroll", handleScroll);
  }, [sectionRefs, isMobile]);

  // Detect mobile/desktop
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Mobile Layout - Image above content (simplified, no scroll animations)
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
                      contentClassName={contentClassName}
                      shouldLoad={index <= activeIndex + 2}
                      registerRef={registerImagePanelRef}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
