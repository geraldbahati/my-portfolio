"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  memo,
} from "react";
import ProjectCard from "@/components/project-card";
import Image from "next/image";
import { Instagram, Linkedin, Github } from "lucide-react";
import { SectionDivider } from "@/components/section-divider";
import { FaqAccordion } from "@/components/faq-accordion";
import { FAQ_DATA } from "@/constants/faq-data";
import { Project } from "@/lib/data/projects";

interface CombinedProjectsFaqSectionProps {
  projects: Project[];
}

/**
 * Client-only IntersectionObserver hook. Returns true once the element
 * enters the viewport. No SSR attributes = no hydration mismatch.
 */
function useIntersectOnce(ref: React.RefObject<HTMLElement | null>) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return visible;
}

// Social Icons - memoized
const WhatsAppIcon = memo(
  ({ size = 20, className }: { size?: number; className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="currentColor"
      className={`bi bi-whatsapp ${className || ""}`}
      viewBox="0 0 16 16"
    >
      <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
    </svg>
  ),
);
WhatsAppIcon.displayName = "WhatsAppIcon";

const XIcon = memo(
  ({ size = 20, className }: { size?: number; className?: string }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      fill="currentColor"
      className={`bi bi-twitter-x ${className || ""}`}
      viewBox="0 0 16 16"
    >
      <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
    </svg>
  ),
);
XIcon.displayName = "XIcon";

// Social Sidebar - uses useIntersectOnce + CSS transitions (no SSR attribute mismatch)
const SocialSidebar = memo(function SocialSidebar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const visible = useIntersectOnce(containerRef);

  const socialLinks = useMemo(
    () => [
      {
        icon: Instagram,
        href: "https://www.instagram.com/ace._gb/",
        label: "Instagram",
      },
      {
        icon: Linkedin,
        href: "https://www.linkedin.com/in/geraldbahati/",
        label: "LinkedIn",
      },
      { icon: XIcon, href: "https://x.com/gerald_baha", label: "X" },
      {
        icon: WhatsAppIcon,
        href: "https://wa.me/254704713070",
        label: "WhatsApp",
      },
      {
        icon: Github,
        href: "https://github.com/geraldbahati",
        label: "GitHub",
      },
    ],
    [],
  );

  return (
    <div ref={containerRef} className="hidden lg:flex flex-col gap-6">
      {socialLinks.map((social, index) => {
        const Icon = social.icon;
        return (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
            className="text-gray-400 hover:text-text-inverted cursor-pointer transition-all duration-500 ease-out hover:scale-110 active:scale-95"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(-20px)",
              transitionDelay: `${index * 100}ms`,
            }}
          >
            <Icon size={20} />
          </a>
        );
      })}
    </div>
  );
});

/**
 * CombinedProjectsFaqSection
 *
 * Architecture:
 * - Projects section: sticky container with horizontal scroll
 * - FAQ section: normal document flow, uses dynamic marginTop based on where projects end
 * - FAQ slides up from translateY(spaceBelow vh) to translateY(0)
 * - The marginTop pulls FAQ up only to the space below projects (not overlapping)
 *
 * Animation strategy:
 * - Header entrance: useIntersectOnce hook + CSS transitions (no hydration mismatch)
 * - Social icons: useIntersectOnce hook + inline transition styles
 * - Horizontal scrollLeft: JS rAF (no CSS equivalent)
 * - FAQ translateY + background color: JS direct DOM manipulation (coupled to scrollLeft progress)
 */
const CombinedProjectsFaqSection = memo(function CombinedProjectsFaqSection({
  projects,
}: CombinedProjectsFaqSectionProps) {
  const scrollTriggerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const stickyContainerRef = useRef<HTMLDivElement>(null);
  const projectsAreaRef = useRef<HTMLDivElement>(null);
  const faqSectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);

  // Header entrance animation via IntersectionObserver (client-only, no SSR attributes)
  const headerVisible = useIntersectOnce(headerRef);

  // Dynamic: how much space is below projects in the sticky container (as vh)
  const [spaceBelow, setSpaceBelow] = useState(30);

  // Cached DOM measurements - updated on mount/resize, not every frame
  const cachedMeasurementsRef = useRef({
    sectionHeight: 0,
    viewportHeight: 0,
    scrollableDistance: 0,
  });

  // Track last FAQ-showing state to avoid redundant className toggles
  const lastFaqShowingRef = useRef(false);

  // Measure the space below projects (responsive)
  useEffect(() => {
    const measure = () => {
      if (!projectsAreaRef.current || !stickyContainerRef.current) return;

      const vh = window.innerHeight;
      const stickyRect = stickyContainerRef.current.getBoundingClientRect();
      const projectsRect = projectsAreaRef.current.getBoundingClientRect();

      // How far from top of sticky container to bottom of projects
      const projectsBottom = projectsRect.bottom - stickyRect.top;

      // Space below projects = viewport height - projectsBottom
      const belowSpace = vh - projectsBottom;

      // Convert to vh percentage
      const belowVh = Math.max(10, (belowSpace / vh) * 100);

      setSpaceBelow(belowVh);

      // Cache section measurements
      if (scrollTriggerRef.current) {
        const sectionHeight = scrollTriggerRef.current.offsetHeight;
        const viewportHeight = window.innerHeight;
        cachedMeasurementsRef.current = {
          sectionHeight,
          viewportHeight,
          scrollableDistance: sectionHeight - viewportHeight,
        };
      }
    };

    const timer = setTimeout(measure, 500);
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measure);
    };
  }, [projects]);

  // Scroll handler: horizontal scrollLeft + FAQ translateY + background color
  // All done via direct DOM manipulation (no React state = no re-renders during scroll)
  const updateScrollPosition = useCallback(() => {
    if (
      !scrollTriggerRef.current ||
      !scrollContainerRef.current ||
      !faqSectionRef.current
    )
      return;

    const { scrollableDistance } = cachedMeasurementsRef.current;

    // Only read rect.top - single layout trigger
    const rect = scrollTriggerRef.current.getBoundingClientRect();
    const scrolled = -rect.top;
    const totalProgress = Math.max(
      0,
      Math.min(1, scrolled / scrollableDistance),
    );

    const horizontalScrollPhase = 0.6;

    if (totalProgress <= horizontalScrollPhase) {
      // Phase 1: Horizontal scroll
      const horizontalProgress = totalProgress / horizontalScrollPhase;

      const container = scrollContainerRef.current;
      const maxHorizontalScroll = container.scrollWidth - container.clientWidth;
      const targetScrollLeft = horizontalProgress * maxHorizontalScroll;

      if (Math.abs(container.scrollLeft - targetScrollLeft) > 1) {
        container.scrollLeft = targetScrollLeft;
      }

      // FAQ stays below viewport (pushed down by spaceBelow vh)
      faqSectionRef.current.style.transform = `translateY(${spaceBelow}vh)`;

      // Toggle background color via class (only when state changes)
      if (lastFaqShowingRef.current) {
        lastFaqShowingRef.current = false;
        scrollTriggerRef.current.classList.remove("bg-surface-dark");
        scrollTriggerRef.current.classList.add("bg-surface-light");
        stickyContainerRef.current!.classList.remove("bg-surface-dark");
        stickyContainerRef.current!.classList.add("bg-surface-light");
        // Toggle text colors
        const title = scrollTriggerRef.current.querySelector("[data-projects-title]");
        const desc = scrollTriggerRef.current.querySelector("[data-projects-desc]");
        if (title) {
          title.classList.remove("text-text-inverted");
          title.classList.add("text-text-primary");
        }
        if (desc) {
          desc.classList.remove("text-text-muted");
          desc.classList.add("text-text-secondary");
        }
      }
    } else {
      // Phase 2: FAQ slides up
      const slideProgress =
        (totalProgress - horizontalScrollPhase) / (1 - horizontalScrollPhase);
      const clampedSlide = Math.min(slideProgress, 1);

      // Ensure horizontal scroll is at max
      const container = scrollContainerRef.current;
      const maxHorizontalScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft < maxHorizontalScroll - 1) {
        container.scrollLeft = maxHorizontalScroll;
      }

      // FAQ slides from translateY(spaceBelow vh) to translateY(0)
      const translateY = (1 - clampedSlide) * spaceBelow;
      faqSectionRef.current.style.transform = `translateY(${translateY}vh)`;

      // Toggle background color via class (only when state changes)
      if (!lastFaqShowingRef.current) {
        lastFaqShowingRef.current = true;
        scrollTriggerRef.current.classList.remove("bg-surface-light");
        scrollTriggerRef.current.classList.add("bg-surface-dark");
        stickyContainerRef.current!.classList.remove("bg-surface-light");
        stickyContainerRef.current!.classList.add("bg-surface-dark");
        // Toggle text colors
        const title = scrollTriggerRef.current.querySelector("[data-projects-title]");
        const desc = scrollTriggerRef.current.querySelector("[data-projects-desc]");
        if (title) {
          title.classList.remove("text-text-primary");
          title.classList.add("text-text-inverted");
        }
        if (desc) {
          desc.classList.remove("text-text-secondary");
          desc.classList.add("text-text-muted");
        }
      }
    }
  }, [spaceBelow]);

  useEffect(() => {
    const handleScroll = () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(updateScrollPosition);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [updateScrollPosition]);

  return (
    <>
      {/* PROJECTS SECTION */}
      <div
        ref={scrollTriggerRef}
        className="relative transition-colors duration-500 bg-surface-light"
        style={{
          height: "200vh",
        }}
      >
        <div
          ref={stickyContainerRef}
          className="sticky top-0 h-screen overflow-hidden transition-colors duration-500 bg-surface-light"
        >
          {/* Header - entrance via useIntersectOnce + CSS transitions */}
          <div
            ref={headerRef}
            className="absolute top-0 left-0 right-0 z-40 pt-16 short:pt-6 transition-all duration-500 ease-out"
            style={{
              opacity: headerVisible ? 1 : 0,
              transform: headerVisible ? "translateY(0)" : "translateY(32px)",
            }}
          >
            <div className="max-w-7xl mx-auto px-6 pb-12 short:pb-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 short:gap-4 items-center">
                <div
                  ref={titleRef}
                  className="transition-all duration-500 ease-out"
                  style={{
                    opacity: headerVisible ? 1 : 0,
                    transform: headerVisible ? "translateY(0)" : "translateY(16px)",
                    transitionDelay: "100ms",
                  }}
                >
                  <h1
                    data-projects-title
                    className="text-4xl lg:text-5xl short:text-3xl font-medium leading-tight tracking-tight transition-colors duration-500 text-text-primary"
                    style={{
                      fontSize: "2.25rem",
                    }}
                  >
                    Website Creations and Client Projects
                  </h1>
                </div>
                <div
                  ref={descRef}
                  className="lg:pl-12 transition-all duration-500 ease-out"
                  style={{
                    opacity: headerVisible ? 1 : 0,
                    transform: headerVisible ? "translateY(0)" : "translateY(16px)",
                    transitionDelay: "200ms",
                  }}
                >
                  <p
                    data-projects-desc
                    className="text-base leading-relaxed transition-colors duration-500 text-text-secondary"
                  >
                    Get to know me, my work style and my values through an
                    insight into my projects that stand for quality, structure
                    and sustainable solutions.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Horizontal scroll projects */}
          <div className="h-full flex items-start pb-20 short:pb-4 pt-80 lg:pt-64 short:pt-28">
            <div
              ref={scrollContainerRef}
              data-projects-area
              className="flex gap-6 overflow-hidden relative"
              style={{ scrollBehavior: "auto" }}
            >
              <div className="w-[calc(50vw-45vw)] md:w-[calc(50vw-250px)] lg:w-[calc(50vw-333px)] flex-shrink-0" />

              <div ref={projectsAreaRef} className="flex gap-6 px-6">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="w-[90vw] md:w-[500px] lg:w-[666px] short:w-[500px] flex-shrink-0"
                  >
                    <ProjectCard
                      id={project.id}
                      src={project.src}
                      type={project.type}
                      title={project.title}
                      alt={project.alt}
                      url={project.url}
                      badges={project.badges}
                      aspectRatio="4/3"
                      poster={project.poster}
                      className="w-full transition-all duration-500"
                    />
                  </div>
                ))}
              </div>

              <div className="w-[calc(50vw-45vw)] md:w-[calc(50vw-250px)] lg:w-[calc(50vw-333px)] flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>

      {/* FAQ SECTION - In normal document flow */}
      {/* marginTop only pulls it up by the space below projects, not overlapping */}
      <section
        ref={faqSectionRef}
        className="bg-black text-white relative z-10"
        style={{
          marginTop: `-${spaceBelow}vh`,
          transform: `translateY(${spaceBelow}vh)`,
        }}
      >
        <div className="pb-32 short:pb-16">
          <div className="container mx-auto max-w-7xl px-6 lg:px-16 pt-20 short:pt-10">
            <SectionDivider
              label="WHY YOU SHOULD WORK WITH ME"
              counter="(04)"
              duration={2}
              className="text-white"
              dividerColor="bg-primary/50"
            />
          </div>

          <div className="container mx-auto max-w-7xl px-6 lg:px-16 py-20 short:py-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 short:gap-12 items-center mb-32 short:mb-16">
              <div className="flex items-end gap-6">
                <SocialSidebar />
                <div className="relative w-full max-w-[540px] overflow-hidden rounded-lg">
                  <Image
                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=540&h=350&fit=crop&crop=faces&auto=format&q=75"
                    alt="Professional consultation meeting"
                    width={540}
                    height={350}
                    className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-300"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 540px"
                    loading="lazy"
                    quality={75}
                  />
                </div>
              </div>

              <div className="max-w-xl">
                <h2 className="text-3xl short:text-2xl font-light mb-8 short:mb-4 tracking-tight">
                  Trust in the expertise
                </h2>
                <p className="text-gray-400 text-base leading-relaxed font-light">
                  Honesty and transparency throughout the entire project are
                  essential for success. It&apos;s important to define goals and
                  options right from the start.
                </p>
              </div>
            </div>

            <div className="max-w-4xl ml-auto">
              <FaqAccordion faqs={FAQ_DATA} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
});

export default CombinedProjectsFaqSection;
