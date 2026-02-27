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

// ============================================================================
// Color interpolation helpers for raw DOM scroll handler
// ============================================================================

// oklch color values from globals.css
const COLOR_GRAY_400 = "oklch(0.702 0 0)";
const COLOR_TEXT_PRIMARY = "oklch(0 0 0)";
const COLOR_GRAY_700 = "oklch(0.3725 0.0168 264.5)";

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
      bulletRefs.current.forEach((li, i) => {
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
    <div ref={sectionRef} className="min-h-screen flex items-center py-16">
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
              className="mt-3 h-[1px] bg-accent-orange-muted"
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
          className="text-6xl lg:text-7xl font-bold mb-12 tracking-tight grid-interaction-blocked"
          style={{ lineHeight: "0.9", color: COLOR_GRAY_400 }}
        >
          {section.title}
        </h2>

        {section.description && (
          <p
            ref={descriptionRef}
            className="text-base mb-12 max-w-lg leading-relaxed grid-interaction-blocked"
            style={{ color: COLOR_GRAY_400 }}
          >
            {section.description}
          </p>
        )}

        {section.bullets && (
          <ul className="space-y-4 grid-interaction-blocked">
            {section.bullets.map((bullet: string, bulletIndex: number) => (
              <li
                key={`bullet-${bulletIndex}`}
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
                  className="w-4 h-4 mt-1.5 mr-4 flex-shrink-0"
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

  // Mobile Layout - CSS-only animations via tailwindcss-intersect
  if (isMobile) {
    return (
      <div className={`relative ${containerClassName || ""}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {sections.map((section, index) => (
            <div
              key={`section-mobile-${section.title}`}
              className="min-h-screen flex flex-col justify-center py-16"
            >
              {/* Image Section for Mobile */}
              <div className="mb-12 opacity-0 intersect:motion-opacity-in intersect:motion-translate-y-in-[30px] intersect:motion-duration-[600ms] intersect-half">
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
              </div>

              {/* Content Section for Mobile */}
              <div className="w-full opacity-0 intersect:motion-opacity-in intersect:motion-translate-y-in-[50px] intersect:motion-duration-[600ms] intersect:motion-delay-[200ms] intersect-half">
                {section.label && (
                  <div className="mb-6 grid-interaction-blocked opacity-0 intersect:motion-opacity-in intersect:motion-translate-x-in-[-20px] intersect:motion-duration-[500ms] intersect-half">
                    <span className="inline-block text-sm font-medium uppercase tracking-[0.2em] text-accent-orange">
                      {section.label}
                    </span>
                    <div
                      className="mt-3 h-[1px] bg-accent-orange-muted intersect:motion-scale-x-in intersect:motion-duration-[500ms] intersect:motion-delay-[200ms]"
                      style={{
                        transformOrigin: "left",
                        transform: "scaleX(0)",
                        width: "120px",
                      }}
                    />
                  </div>
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
                      <li
                        key={`bullet-mobile-${bulletIndex}`}
                        className="flex items-start opacity-0 intersect:motion-opacity-in intersect:motion-translate-x-in-[-20px] intersect:motion-duration-[500ms] intersect-half"
                        style={{
                          // @ts-expect-error -- CSS custom property for staggered delay
                          "--motion-delay": `${300 + bulletIndex * 50}ms`,
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
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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
                key={`section-${section.title}`}
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

              {/* Sticky container — JS entrance animation (sticky + intersect CSS don't mix) */}
              <div
                ref={stickyContainerRef}
                className="w-full mx-auto"
                style={{
                  position: "sticky",
                  top: "calc(50vh - 300px)",
                  width: "600px",
                  height: "600px",
                  opacity: 0,
                  transform: "translateY(350px) translateZ(0)",
                  transition: "none",
                }}
              >
                {/* Image container */}
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                  {sections.map((section, index) => (
                    <ImagePanel
                      key={`image-${section.title}`}
                      section={section}
                      index={index}
                      contentClassName={contentClassName}
                      shouldLoad={index <= activeIndex + 2}
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
};
