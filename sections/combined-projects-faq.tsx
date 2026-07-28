"use client";

import { useEffect, useRef, useState } from "react";
import { ProjectCard } from "@/components/project-card";
import Image from "next/image";
import { Instagram, Linkedin, Github } from "lucide-react";
import { SectionDivider } from "@/components/section-divider";
import { FaqAccordion } from "@/components/faq-accordion";
import { FAQ_DATA } from "@/constants/faq-data";
import { Project } from "@/lib/data/projects";
import { useMediaQuery } from "@/hooks/use-media-query";

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

const whatsappIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="currentColor"
    className="bi bi-whatsapp"
    viewBox="0 0 16 16"
    aria-hidden="true"
  >
    <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
  </svg>
);

const xIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    fill="currentColor"
    className="bi bi-twitter-x"
    viewBox="0 0 16 16"
    aria-hidden="true"
  >
    <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z" />
  </svg>
);

const SOCIAL_LINKS = [
  {
    icon: <Instagram aria-hidden="true" size={20} />,
    href: "https://www.instagram.com/ace._gb/",
    label: "Instagram",
  },
  {
    icon: <Linkedin aria-hidden="true" size={20} />,
    href: "https://www.linkedin.com/in/geraldbahati/",
    label: "LinkedIn",
  },
  { icon: xIcon, href: "https://x.com/gerald_baha", label: "X" },
  {
    icon: whatsappIcon,
    href: "https://wa.me/254704713070",
    label: "WhatsApp",
  },
  {
    icon: <Github aria-hidden="true" size={20} />,
    href: "https://github.com/geraldbahati",
    label: "GitHub",
  },
];

// Social Sidebar - uses useIntersectOnce + CSS transitions (no SSR attribute mismatch)
const SocialSidebar = function SocialSidebar({
  reducedMotion,
}: {
  reducedMotion: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const visible = useIntersectOnce(containerRef);
  const shouldShow = visible || reducedMotion;

  return (
    <div ref={containerRef} className="hidden lg:flex flex-col gap-6">
      {SOCIAL_LINKS.map((social, index) => {
        return (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={social.label}
            className="text-gray-400 hover:text-text-inverted cursor-pointer transition-[color,background-color,border-color,opacity,transform,box-shadow,filter] duration-500 ease-out hover:scale-110 active:scale-95"
            style={{
              opacity: shouldShow ? 1 : 0,
              transform: shouldShow
                ? "translateX(0)"
                : "translateX(-20px)",
              transitionDelay: reducedMotion ? "0ms" : `${index * 100}ms`,
              transitionDuration: reducedMotion ? "0ms" : undefined,
            }}
          >
            {social.icon}
          </a>
        );
      })}
    </div>
  );
};

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
 * - Horizontal gallery: compositor-only translate3d, scrubbed with JS rAF
 * - FAQ translateY + background color: direct DOM manipulation, coupled to gallery progress
 * - Measurements are cached outside the scroll loop and refreshed with ResizeObserver
 */
const CombinedProjectsFaqSection = function CombinedProjectsFaqSection({
  ...props
}: CombinedProjectsFaqSectionProps) {
  return useCombinedProjectsFaqSection(props);
};

function useCombinedProjectsFaqSection({
  projects,
}: CombinedProjectsFaqSectionProps) {
  const scrollTriggerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const stickyContainerRef = useRef<HTMLDivElement>(null);
  const projectsAreaRef = useRef<HTMLDivElement>(null);
  const faqSectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);

  // Header entrance animation via IntersectionObserver (client-only, no SSR attributes)
  const headerVisible = useIntersectOnce(headerRef);
  const [isPlaybackActive, setIsPlaybackActive] = useState(true);
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)",
  );
  const shouldShowHeader = headerVisible || prefersReducedMotion;

  useEffect(() => {
    const trigger = scrollTriggerRef.current;
    const sticky = stickyContainerRef.current;
    const viewport = scrollContainerRef.current;
    const track = scrollTrackRef.current;
    const projectsArea = projectsAreaRef.current;
    const faq = faqSectionRef.current;
    const title = titleRef.current?.querySelector("[data-projects-title]");
    const desc = descRef.current?.querySelector("[data-projects-desc]");

    if (
      !trigger ||
      !sticky ||
      !viewport ||
      !track ||
      !projectsArea ||
      !faq
    ) {
      return;
    }

    const triggerElement = trigger;
    const stickyElement = sticky;
    const viewportElement = viewport;
    const trackElement = track;
    const projectsAreaElement = projectsArea;
    const faqElement = faq;

    const horizontalPhaseEnd = 0.6;
    const progressEpsilon = 0.0005;
    const scrubTimeConstantMs = 85;
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    let frameId = 0;
    let resizeFrameId = 0;
    let currentProgress = 0;
    let targetProgress = 0;
    let lastFrameTime = 0;
    let hasInitialProgress = false;
    let lastFaqShowing = false;
    let lastPlaybackActive = true;
    let isTrackPromoted = false;
    let isMounted = true;

    let measurements = {
      sectionTop: 0,
      scrollableDistance: 1,
      horizontalTravel: 0,
      faqOffset: window.innerHeight * 0.3,
    };

    function setFaqSurface(isShowing: boolean) {
      if (lastFaqShowing === isShowing) return;
      lastFaqShowing = isShowing;

      triggerElement.classList.toggle("bg-surface-dark", isShowing);
      triggerElement.classList.toggle("bg-surface-light", !isShowing);
      stickyElement.classList.toggle("bg-surface-dark", isShowing);
      stickyElement.classList.toggle("bg-surface-light", !isShowing);

      title?.classList.toggle("text-text-inverted", isShowing);
      title?.classList.toggle("text-text-primary", !isShowing);
      desc?.classList.toggle("text-text-muted", isShowing);
      desc?.classList.toggle("text-text-secondary", !isShowing);
    }

    function readTargetProgress() {
      const scrolled = window.scrollY - measurements.sectionTop;
      return Math.max(
        0,
        Math.min(1, scrolled / measurements.scrollableDistance),
      );
    }

    function setTrackPromotion(shouldPromote: boolean) {
      if (isTrackPromoted === shouldPromote) return;
      isTrackPromoted = shouldPromote;
      trackElement.style.willChange = shouldPromote ? "transform" : "";
    }

    function renderFrame(timestamp: number) {
      frameId = 0;
      targetProgress = readTargetProgress();

      if (!hasInitialProgress || reducedMotionQuery.matches) {
        currentProgress = targetProgress;
        hasInitialProgress = true;
      } else {
        const elapsed = Math.min(
          64,
          Math.max(0, timestamp - (lastFrameTime || timestamp)),
        );
        const blend = 1 - Math.exp(-elapsed / scrubTimeConstantMs);
        currentProgress += (targetProgress - currentProgress) * blend;
      }
      lastFrameTime = timestamp;

      const horizontalProgress = Math.min(
        1,
        currentProgress / horizontalPhaseEnd,
      );
      const faqProgress = Math.max(
        0,
        Math.min(
          1,
          (currentProgress - horizontalPhaseEnd) / (1 - horizontalPhaseEnd),
        ),
      );

      const trackX = -horizontalProgress * measurements.horizontalTravel;
      const faqY = (1 - faqProgress) * measurements.faqOffset;
      const shouldPromoteTrack =
        !reducedMotionQuery.matches &&
        currentProgress > progressEpsilon &&
        currentProgress < 1 - progressEpsilon;

      setTrackPromotion(shouldPromoteTrack);
      trackElement.style.transform = `translate3d(${trackX.toFixed(2)}px, 0, 0)`;
      faqElement.style.transform = `translate3d(0, ${faqY.toFixed(2)}px, 0)`;

      const isFaqShowing = currentProgress > horizontalPhaseEnd;
      setFaqSurface(isFaqShowing);

      const nextPlaybackActive = !isFaqShowing;
      if (lastPlaybackActive !== nextPlaybackActive) {
        lastPlaybackActive = nextPlaybackActive;
        setIsPlaybackActive(nextPlaybackActive);
      }

      triggerElement.dataset.animationPhase = isFaqShowing
        ? "faq"
        : "projects";
      triggerElement.dataset.animationProgress = currentProgress.toFixed(3);

      if (
        !reducedMotionQuery.matches &&
        Math.abs(targetProgress - currentProgress) > progressEpsilon
      ) {
        frameId = requestAnimationFrame(renderFrame);
      }
    }

    function scheduleRender() {
      if (frameId === 0) {
        frameId = requestAnimationFrame(renderFrame);
      }
    }

    function measure() {
      resizeFrameId = 0;

      // Batch every layout read before applying any style updates.
      const viewportHeight = window.innerHeight;
      const triggerRect = triggerElement.getBoundingClientRect();
      const stickyRect = stickyElement.getBoundingClientRect();
      const projectsRect = projectsAreaElement.getBoundingClientRect();
      const trackWidth = trackElement.scrollWidth;
      const viewportWidth = viewportElement.clientWidth;
      const sectionHeight = triggerElement.offsetHeight;

      const projectsBottom = projectsRect.bottom - stickyRect.top;
      const faqOffset = Math.max(
        viewportHeight * 0.1,
        viewportHeight - projectsBottom,
      );

      measurements = {
        sectionTop: window.scrollY + triggerRect.top,
        scrollableDistance: Math.max(1, sectionHeight - viewportHeight),
        horizontalTravel: Math.max(0, trackWidth - viewportWidth),
        faqOffset,
      };

      faqElement.style.setProperty(
        "--faq-offset",
        `${faqOffset.toFixed(2)}px`,
      );
      scheduleRender();
    }

    function scheduleMeasure() {
      if (resizeFrameId !== 0) {
        cancelAnimationFrame(resizeFrameId);
      }
      resizeFrameId = requestAnimationFrame(measure);
    }

    const resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(viewportElement);
    resizeObserver.observe(trackElement);
    resizeObserver.observe(projectsAreaElement);

    window.addEventListener("scroll", scheduleRender, { passive: true });
    window.addEventListener("resize", scheduleMeasure, { passive: true });
    reducedMotionQuery.addEventListener("change", scheduleRender);

    void document.fonts?.ready.then(() => {
      if (isMounted) scheduleMeasure();
    });

    measure();

    return () => {
      isMounted = false;
      resizeObserver.disconnect();
      window.removeEventListener("scroll", scheduleRender);
      window.removeEventListener("resize", scheduleMeasure);
      reducedMotionQuery.removeEventListener("change", scheduleRender);
      if (frameId !== 0) cancelAnimationFrame(frameId);
      if (resizeFrameId !== 0) cancelAnimationFrame(resizeFrameId);
      trackElement.style.willChange = "";
    };
  }, [projects]);

  return (
    <>
      {/* PROJECTS SECTION */}
      <div
        ref={scrollTriggerRef}
        data-projects-scroll-root
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
            className="absolute top-0 left-0 right-0 z-40 pt-16 short:pt-20 transition-[color,background-color,border-color,opacity,transform,box-shadow,filter] duration-500 ease-out"
            style={{
              opacity: shouldShowHeader ? 1 : 0,
              transform: shouldShowHeader
                ? "translateY(0)"
                : "translateY(32px)",
              transitionDuration: prefersReducedMotion ? "0ms" : undefined,
            }}
          >
            <div className="max-w-7xl mx-auto px-6 pb-12 short:pb-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 short:gap-4 items-center">
                <div
                  ref={titleRef}
                  className="transition-[color,background-color,border-color,opacity,transform,box-shadow,filter] duration-500 ease-out"
                  style={{
                    opacity: shouldShowHeader ? 1 : 0,
                    transform: shouldShowHeader
                      ? "translateY(0)"
                      : "translateY(16px)",
                    transitionDelay: prefersReducedMotion ? "0ms" : "100ms",
                    transitionDuration: prefersReducedMotion
                      ? "0ms"
                      : undefined,
                  }}
                >
                  <h1
                    data-projects-title
                    className="text-4xl lg:text-5xl short:text-2xl font-medium leading-tight tracking-tight transition-colors duration-500 text-text-primary"
                  >
                    Website Creations and Client Projects
                  </h1>
                </div>
                <div
                  ref={descRef}
                  className="lg:pl-12 transition-[color,background-color,border-color,opacity,transform,box-shadow,filter] duration-500 ease-out"
                  style={{
                    opacity: shouldShowHeader ? 1 : 0,
                    transform: shouldShowHeader
                      ? "translateY(0)"
                      : "translateY(16px)",
                    transitionDelay: prefersReducedMotion ? "0ms" : "200ms",
                    transitionDuration: prefersReducedMotion
                      ? "0ms"
                      : undefined,
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
          <div className="h-full flex items-start pb-20 short:pb-4 pt-80 lg:pt-64 short:pt-40">
            <div
              ref={scrollContainerRef}
              data-projects-viewport
              className="relative w-full min-w-0 overflow-hidden"
            >
              <div
                ref={scrollTrackRef}
                data-projects-area
                data-projects-track
                className="relative flex w-max gap-6"
              >
                <div className="w-[calc(50vw-45vw)] md:w-[calc(50vw-250px)] lg:w-[calc(50vw-333px)] laptop:w-[calc(50vw-270px)] short:w-[calc(50vw-250px)] flex-shrink-0" />

                <div ref={projectsAreaRef} className="flex gap-6 px-6">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="w-[90vw] md:w-[500px] lg:w-[666px] laptop:w-[540px] short:w-[500px] flex-shrink-0"
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
                        playbackEnabled={isPlaybackActive}
                        freezeFrameOnPause
                        surface="home_grid"
                        className="w-full transition-[color,background-color,border-color,opacity,transform,box-shadow,filter] duration-500"
                      />
                    </div>
                  ))}
                </div>

                <div className="w-[calc(50vw-45vw)] md:w-[calc(50vw-250px)] lg:w-[calc(50vw-333px)] laptop:w-[calc(50vw-270px)] short:w-[calc(50vw-250px)] flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ SECTION - In normal document flow */}
      {/* marginTop only pulls it up by the space below projects, not overlapping */}
      <section
        ref={faqSectionRef}
        data-section-id="faq"
        className="bg-black text-white relative z-10"
        style={{
          "--faq-offset": "30vh",
          marginTop: "calc(-1 * var(--faq-offset))",
          transform: "translate3d(0, var(--faq-offset), 0)",
        } as React.CSSProperties}
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
                <SocialSidebar reducedMotion={prefersReducedMotion} />
                <div className="relative w-full max-w-[540px] short:max-w-[420px] overflow-hidden rounded-lg">
                  <Image
                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=540&h=350&fit=crop&crop=faces&auto=format&q=75"
                    alt="Professional consultation meeting"
                    width={540}
                    height={350}
                    className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-[color,background-color,border-color,opacity,transform,box-shadow,filter] duration-300"
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
}

export default CombinedProjectsFaqSection;
