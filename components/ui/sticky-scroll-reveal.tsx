"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  memo,
} from "react";
import Image from "next/image";
import { m } from "motion/react";

// Animation variants for mobile layout (whileInView replaces tailwindcss-intersect)
const mobileRevealUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};
const mobileRevealUpLarge = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
};
const mobileRevealLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};
const mobileScaleX = { hidden: { scaleX: 0 }, visible: { scaleX: 1 } };

// ============================================================================
// Image Preloading Hook - Preloads upcoming images before they're needed
// ============================================================================

function useImagePreloader(
  images: (string | undefined)[],
  currentIndex: number,
  preloadAhead = 2,
  enabled = true,
) {
  const preloadedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) return;

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
  }, [currentIndex, enabled, images, preloadAhead]);
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

// ============================================================================
// Color interpolation helpers for raw DOM scroll handler
// ============================================================================

// oklch color values from globals.css
const COLOR_GRAY_400 = "oklch(0.702 0 0)";

// Parsed oklch components for interpolation
const GRAY_400 = { l: 0.702, c: 0, h: 0 };
const TEXT_PRIMARY = { l: 0, c: 0, h: 0 };
const GRAY_700 = { l: 0.3725, c: 0.0168, h: 264.5 };

function lerpOklch(
  a: { l: number; c: number; h: number },
  b: { l: number; c: number; h: number },
  t: number,
): string {
  const l = a.l + (b.l - a.l) * t;
  const c = a.c + (b.c - a.c) * t;
  const h = a.h + (b.h - a.h) * t;
  return `oklch(${l} ${c} ${h})`;
}

/** Multi-stop interpolation: maps progress through keyframes [0, 0.1, 0.9, 1] */
function interpolateColor(
  progress: number,
  dimColor: { l: number; c: number; h: number },
  activeColor: { l: number; c: number; h: number },
): string {
  if (progress <= 0.1) {
    // dim → active
    const t = progress / 0.1;
    return lerpOklch(dimColor, activeColor, t);
  } else if (progress <= 0.9) {
    // fully active
    return lerpOklch(activeColor, activeColor, 1);
  } else {
    // active → dim
    const t = (progress - 0.9) / 0.1;
    return lerpOklch(activeColor, dimColor, t);
  }
}

/** Multi-stop opacity: [0, 0.1, 0.9, 1] → [0.3, 1, 1, 0.3] */
function interpolateOpacity(progress: number): number {
  if (progress <= 0.1) {
    return 0.3 + (1 - 0.3) * (progress / 0.1);
  } else if (progress <= 0.9) {
    return 1;
  } else {
    return 1 - (1 - 0.3) * ((progress - 0.9) / 0.1);
  }
}

// ============================================================================
// TextSection — Desktop: raw DOM scroll mutations (zero React re-renders)
// ============================================================================

interface TextSectionProps {
  section: StickySection;
  sectionRef: React.RefObject<HTMLDivElement | null>;
}

const TextSection = memo(({ section, sectionRef }: TextSectionProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const labelWrapperRef = useRef<HTMLDivElement>(null);
  const labelUnderlineRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const bulletRefs = useRef<Map<number, HTMLLIElement>>(new Map());
  const bulletSvgRefs = useRef<Map<number, SVGSVGElement>>(new Map());
  const bulletSpanRefs = useRef<Map<number, HTMLSpanElement>>(new Map());

  useEffect(() => {
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    const handleScroll = () => {
      const rect = sectionEl.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // Same offset as original: ["start center", "end center"]
      const start = rect.top + rect.height;
      const end = rect.top;
      const center = viewportHeight / 2;

      // progress 0→1 as section scrolls through viewport center
      const rawProgress = (center - end) / (start - end);
      const progress = Math.min(1, Math.max(0, rawProgress));

      // Opacity: [0, 0.1, 0.9, 1] → [0.3, 1, 1, 0.3]
      const opacity = interpolateOpacity(progress);

      // Label underline: scaleX 0→1
      if (labelUnderlineRef.current) {
        labelUnderlineRef.current.style.transform = `scaleX(${progress})`;
      }

      // Label wrapper opacity
      if (labelWrapperRef.current) {
        labelWrapperRef.current.style.opacity = String(opacity);
      }

      // Title color
      if (titleRef.current) {
        titleRef.current.style.color = interpolateColor(
          progress,
          GRAY_400,
          TEXT_PRIMARY,
        );
      }

      // Description color
      if (descriptionRef.current) {
        descriptionRef.current.style.color = interpolateColor(
          progress,
          GRAY_400,
          GRAY_700,
        );
      }

      // Bullet items: opacity + icon color + text color
      bulletRefs.current.forEach((li) => {
        li.style.opacity = String(opacity);
      });
      bulletSvgRefs.current.forEach((svg) => {
        svg.style.color = interpolateColor(progress, GRAY_400, TEXT_PRIMARY);
      });
      bulletSpanRefs.current.forEach((span) => {
        span.style.color = interpolateColor(progress, GRAY_400, GRAY_700);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [sectionRef]);

  return (
    <div
      ref={sectionRef}
      className="min-h-screen flex items-center py-16 short:py-8"
    >
      <div ref={wrapperRef} className="w-full">
        {section.label && (
          <div
            ref={labelWrapperRef}
            className="mb-8 grid-interaction-blocked"
            style={{ opacity: 0.3 }}
          >
            <span className="inline-block text-sm font-medium uppercase tracking-[0.2em] text-accent-orange">
              {section.label}
            </span>
            <div
              ref={labelUnderlineRef}
              className="mt-3 h-px bg-accent-orange-muted"
              style={{
                transform: "scaleX(0)",
                transformOrigin: "left",
                width: "100%",
              }}
            />
          </div>
        )}

        <h2
          ref={titleRef}
          className="text-6xl lg:text-7xl short:text-5xl font-bold mb-12 short:mb-8 tracking-tight grid-interaction-blocked"
          style={{ lineHeight: "0.9", color: COLOR_GRAY_400 }}
        >
          {section.title}
        </h2>

        {section.description && (
          <p
            ref={descriptionRef}
            className="text-base mb-12 short:mb-8 max-w-lg leading-relaxed grid-interaction-blocked"
            style={{ color: COLOR_GRAY_400 }}
          >
            {section.description}
          </p>
        )}

        {section.bullets && (
          <ul className="space-y-4 grid-interaction-blocked">
            {section.bullets.map((bullet: string, bulletIndex: number) => (
              <li
                key={`bullet-${section.title}-${bullet}`}
                ref={(el) => {
                  if (el) bulletRefs.current.set(bulletIndex, el);
                  else bulletRefs.current.delete(bulletIndex);
                }}
                className="flex items-start"
                style={{ opacity: 0.3 }}
              >
                <svg
                  ref={(el) => {
                    if (el) bulletSvgRefs.current.set(bulletIndex, el);
                    else bulletSvgRefs.current.delete(bulletIndex);
                  }}
                  className="w-4 h-4 mt-1.5 mr-4 shrink-0"
                  style={{ color: COLOR_GRAY_400 }}
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
                </svg>
                <span
                  ref={(el) => {
                    if (el) bulletSpanRefs.current.set(bulletIndex, el);
                    else bulletSpanRefs.current.delete(bulletIndex);
                  }}
                  className="text-base"
                  style={{ color: COLOR_GRAY_400 }}
                >
                  {bullet}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
});

TextSection.displayName = "TextSection";

// ============================================================================
// ImagePanel — unchanged
// ============================================================================

interface ImagePanelProps {
  section: StickySection;
  index: number;
  contentClassName?: string;
  registerRef: (index: number, el: HTMLDivElement | null) => void;
}

const ImagePanel = memo(
  ({ section, index, contentClassName, registerRef }: ImagePanelProps) => {
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
            {/* Single image serves as both background (via CSS blur overlay) and sharp center */}
            <Image
              src={section.image}
              alt={`${section.title} background`}
              fill
              className="object-cover"
              loading="lazy"
              quality={80}
              sizes="(max-width: 1024px) 500px, 600px"
            />
            {/* Blur + dim overlay using backdrop-filter (no second image request) */}
            <div
              className="absolute inset-0"
              style={{
                zIndex: 1,
                backdropFilter: "blur(10px) brightness(0.95)",
                WebkitBackdropFilter: "blur(10px) brightness(0.95)",
              }}
            />

            {/* Centered sharp image — reuses cached image from above */}
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
                  loading="lazy"
                  quality={90}
                  sizes="(max-width: 1024px) 320px, 450px"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center">
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

type StickySection = {
  label?: string;
  title: string;
  description?: string;
  bullets?: string[];
  content?: React.ReactNode;
  image?: string;
};

interface StickyScrollRevealProps {
  sections: StickySection[];
  contentClassName?: string;
  containerClassName?: string;
}

function MobileSectionCard({
  section,
  contentClassName,
}: {
  section: StickySection;
  contentClassName?: string;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-center py-16">
      <m.div
        className="mb-12"
        variants={mobileRevealUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
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
              <Image
                src={section.image}
                alt={`${section.title} background`}
                fill
                className="object-cover"
                loading="lazy"
                quality={80}
                sizes="(max-width: 640px) 90vw, 500px"
              />
              <div
                className="absolute inset-0"
                style={{
                  zIndex: 1,
                  backdropFilter: "blur(10px) brightness(0.95)",
                  WebkitBackdropFilter: "blur(10px) brightness(0.95)",
                }}
              />

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
                    loading="lazy"
                    quality={90}
                    sizes="(max-width: 640px) 70vw, 320px"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-text-tertiary text-lg font-medium text-center px-4">
                {section.title}
              </span>
            </div>
          )}
        </div>
      </m.div>

      <m.div
        className="w-full"
        variants={mobileRevealUpLarge}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {section.label && (
          <m.div
            className="mb-6 grid-interaction-blocked"
            variants={mobileRevealLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-sm font-medium uppercase tracking-[0.2em] text-accent-orange">
              {section.label}
            </span>
            <m.div
              className="mt-3 h-px bg-accent-orange-muted"
              style={{
                transformOrigin: "left",
                width: "120px",
              }}
              variants={mobileScaleX}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </m.div>
        )}

        <h2
          className="text-4xl sm:text-5xl font-bold mb-8 tracking-tight text-text-primary grid-interaction-blocked"
          style={{ lineHeight: "1" }}
        >
          {section.title}
        </h2>

        {section.description && (
          <p className="text-base mb-8 max-w-lg leading-relaxed text-gray-700 grid-interaction-blocked">
            {section.description}
          </p>
        )}

        {section.bullets && (
          <ul className="space-y-3 grid-interaction-blocked">
            {section.bullets.map((bullet, bulletIndex) => (
              <m.li
                key={`bullet-mobile-${section.title}-${bullet}`}
                className="flex items-start"
                variants={mobileRevealLeft}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                transition={{
                  duration: 0.5,
                  delay: 0.3 + bulletIndex * 0.05,
                }}
              >
                <svg
                  className="w-4 h-4 mt-1.5 mr-3 shrink-0 text-text-primary"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
                </svg>
                <span className="text-base text-gray-700">{bullet}</span>
              </m.li>
            ))}
          </ul>
        )}
      </m.div>
    </div>
  );
}

function StickyScrollRevealMobileLayout({
  containerRef,
  containerClassName,
  contentClassName,
  sections,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  containerClassName?: string;
  contentClassName?: string;
  sections: StickySection[];
}) {
  return (
    <div ref={containerRef} className={`relative ${containerClassName || ""}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {sections.map((section) => (
          <MobileSectionCard
            key={`section-mobile-${section.title}`}
            section={section}
            contentClassName={contentClassName}
          />
        ))}
      </div>
    </div>
  );
}

function StickyScrollRevealDesktopLayout({
  containerRef,
  containerClassName,
  contentClassName,
  registerImagePanelRef,
  sections,
  sectionRefs,
  stickyContainerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  containerClassName?: string;
  contentClassName?: string;
  registerImagePanelRef: (index: number, el: HTMLDivElement | null) => void;
  sections: StickySection[];
  sectionRefs: React.RefObject<HTMLDivElement | null>[];
  stickyContainerRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={containerRef} className={`relative ${containerClassName || ""}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative lg:flex lg:gap-16">
          <div className="lg:w-1/2">
            {sections.map((section, index) => (
              <TextSection
                key={`section-${section.title}`}
                section={section}
                sectionRef={sectionRefs[index]}
              />
            ))}
          </div>

          <div className="hidden lg:block lg:w-1/2">
            <div
              className="relative"
              style={{
                height: `${(sections.length - 0.25) * 100}vh`,
              }}
            >
              <div className="h-[calc(50vh-300px)] short:h-[calc(50vh-210px)]" />

              <div
                ref={stickyContainerRef}
                className="w-full mx-auto sticky h-[600px] short:w-[420px] short:h-[420px] top-[calc(50vh-300px)] short:top-[calc(50vh-210px)]"
                style={{
                  opacity: 0,
                  transform: "translateY(350px) translateZ(0)",
                  transition: "none",
                }}
              >
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                  {sections.map((section, index) => (
                    <ImagePanel
                      key={`image-${section.title}`}
                      section={section}
                      index={index}
                      contentClassName={contentClassName}
                      registerRef={registerImagePanelRef}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const StickyScrollReveal = ({
  sections,
  contentClassName,
  containerClassName,
}: StickyScrollRevealProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [shouldStartPreloading, setShouldStartPreloading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Ref registry for image panels - for direct DOM updates
  const imagePanelRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  // Ref for desktop sticky container entrance animation
  const stickyContainerRef = useRef<HTMLDivElement>(null);

  // Create refs for each section
  const sectionRefs = useMemo(
    () => sections.map(() => React.createRef<HTMLDivElement>()),
    [sections],
  );

  // Extract image URLs for preloading
  const imageUrls = useMemo(() => sections.map((s) => s.image), [sections]);

  // Track active section for preloading
  const activeIndex = useActiveSectionIndex(sectionRefs);

  // Delay preloading until the section approaches the viewport.
  useImagePreloader(imageUrls, activeIndex, 2, shouldStartPreloading);

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

        const sectionCenter = rect.top + rect.height / 2;
        const start = viewportHeight;
        const end = viewportHeight / 2;

        const progress = Math.min(
          1,
          Math.max(0, (start - sectionCenter) / (start - end)),
        );

        const clipValue = `inset(${(1 - progress) * 100}% 0 0 0)`;
        panelEl.style.clipPath = clipValue;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [sectionRefs, isMobile]);

  // Detect mobile/desktop
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldStartPreloading(true);
          observer.disconnect();
        }
      },
      { rootMargin: "75% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Sticky container entrance animation (once, via IntersectionObserver + CSS transition)
  useEffect(() => {
    const el = stickyContainerRef.current;
    if (!el || isMobile) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Apply transition then animate to visible state
            el.style.transition =
              "opacity 1.4s cubic-bezier(0.25, 0.1, 0.25, 1), transform 1.4s cubic-bezier(0.25, 0.1, 0.25, 1)";
            el.style.opacity = "1";
            el.style.transform = "translateY(0) translateZ(0)";
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isMobile]);

  // Mobile Layout - motion/react whileInView animations
  if (isMobile) {
    return (
      <StickyScrollRevealMobileLayout
        containerRef={containerRef}
        containerClassName={containerClassName}
        contentClassName={contentClassName}
        sections={sections}
      />
    );
  }

  return (
    <StickyScrollRevealDesktopLayout
      containerRef={containerRef}
      containerClassName={containerClassName}
      contentClassName={contentClassName}
      registerImagePanelRef={registerImagePanelRef}
      sections={sections}
      sectionRefs={sectionRefs}
      stickyContainerRef={stickyContainerRef}
    />
  );
};
