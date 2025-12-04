"use client";

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { motion } from "framer-motion";
import ProjectCard, { ProjectCardProps } from "@/components/project-card";
import Image from "next/image";
import { Instagram, Linkedin, Github } from "lucide-react";
import { SectionDivider } from "@/components/section-divider";
import { FaqAccordion } from "@/components/faq-accordion";
import { FAQ_DATA } from "@/constants/faq-data";
import { Project } from "@/lib/data/projects";

interface CombinedProjectsFaqSectionProps {
  projects: Project[];
}

// Social Icons
const WhatsAppIcon = ({
  size = 20,
  className,
}: {
  size?: number;
  className?: string;
}) => (
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
);

const XIcon = ({
  size = 20,
  className,
}: {
  size?: number;
  className?: string;
}) => (
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
);

// Social Links Component
function SocialSidebar() {
  const socialLinks = [
    {
      icon: Instagram,
      href: "https://www.instagram.com/ace._gb/",
      label: "Instagram",
    },
    {
      icon: Linkedin,
      href: "https://www.linkedin.com/in/gerald-bahati-b1865a242/",
      label: "LinkedIn",
    },
    { icon: XIcon, href: "https://x.com/gerald_baha", label: "X" },
    {
      icon: WhatsAppIcon,
      href: "https://wa.me/254704713070",
      label: "WhatsApp",
    },
    { icon: Github, href: "https://github.com/geraldbahati", label: "GitHub" },
  ];

  return (
    <div className="hidden lg:flex flex-col gap-6">
      {socialLinks.map((social, index) => {
        const Icon = social.icon;
        return (
          <motion.a
            key={social.label}
            href={social.href}
            aria-label={social.label}
            className="text-gray-400 hover:text-white transition-colors duration-300"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Icon size={20} />
          </motion.a>
        );
      })}
    </div>
  );
}

// Main Combined Component
export default function CombinedProjectsFaqSection({
  projects,
}: CombinedProjectsFaqSectionProps) {
  const scrollTriggerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const faqContainerRef = useRef<HTMLDivElement>(null);
  const projectsAreaRef = useRef<HTMLDivElement>(null);
  const projectsContainerRef = useRef<HTMLDivElement>(null);
  const faqContentRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const scrollEndTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTimeRef = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const [heightReductionProgress, setHeightReductionProgress] = useState(0);
  const [minHeightVh, setMinHeightVh] = useState(30);

  // Measure the minimum height needed to show the bottom of projects
  useEffect(() => {
    const measureMinHeight = () => {
      if (!projectsContainerRef.current) return;

      const vh = window.innerHeight;
      const container = projectsContainerRef.current;

      // Get the container's position when sticky is at top
      const containerRect = container.getBoundingClientRect();

      // Find the projects area (the scrollable container with cards)
      const projectsArea = container.querySelector(
        "[data-projects-area]",
      ) as HTMLElement;
      if (!projectsArea) return;

      const projectsRect = projectsArea.getBoundingClientRect();

      // Calculate the bottom position of the projects relative to the sticky container top
      const projectsBottom = projectsRect.bottom - containerRect.top;

      // Convert to vh and add some padding (e.g., 5vh)
      const minHeight = Math.max(30, (projectsBottom / vh) * 100 + 5);

      setMinHeightVh(Math.min(minHeight, 100)); // Cap at 100vh
    };

    // Measure after layout is complete
    const timer = setTimeout(measureMinHeight, 500);
    window.addEventListener("resize", measureMinHeight);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", measureMinHeight);
    };
  }, []);

  // Memoize horizontal scroll phase constant
  const horizontalScrollPhase = useMemo(() => 0.5, []);

  // Optimized scroll handler with RAF throttling and final update
  const updateScrollPosition = useCallback(
    (forceFinal = false) => {
      if (!scrollTriggerRef.current || !scrollContainerRef.current) {
        return;
      }

      const now = performance.now();

      // Throttle to ~60fps, but allow forced final updates
      if (!forceFinal && now - lastUpdateTimeRef.current < 16) {
        rafIdRef.current = requestAnimationFrame(() =>
          updateScrollPosition(false),
        );
        return;
      }

      lastUpdateTimeRef.current = now;

      const triggerSection = scrollTriggerRef.current;
      const rect = triggerSection.getBoundingClientRect();
      const sectionHeight = triggerSection.offsetHeight;
      const viewportHeight = window.innerHeight;

      // Check if header should be visible
      const isInView = rect.top <= viewportHeight * 0.8;
      setIsHeaderVisible((prev) => (prev !== isInView ? isInView : prev));

      // Calculate total scrollable distance
      const scrollableDistance = sectionHeight - viewportHeight;
      const scrolled = -rect.top;
      const totalProgress = Math.max(
        0,
        Math.min(1, scrolled / scrollableDistance),
      );

      // Phase breakdown:
      // 0-50%: horizontal project scrolling
      // 50-100%: height reduction to push content up
      if (totalProgress <= horizontalScrollPhase) {
        // Horizontal scroll phase
        const horizontalProgress = totalProgress / horizontalScrollPhase;
        setScrollProgress(horizontalProgress);
        setHeightReductionProgress(0);

        // Apply horizontal scroll
        const container = scrollContainerRef.current;
        const maxHorizontalScroll =
          container.scrollWidth - container.clientWidth;
        const targetScrollLeft = horizontalProgress * maxHorizontalScroll;

        // Use smooth scrolling for better visual consistency
        if (Math.abs(container.scrollLeft - targetScrollLeft) > 1) {
          container.scrollLeft = targetScrollLeft;
        }
      } else {
        // Height reduction phase
        setScrollProgress(1);
        const reductionProgress =
          (totalProgress - horizontalScrollPhase) / (1 - horizontalScrollPhase);
        setHeightReductionProgress(Math.min(reductionProgress, 1));

        // Ensure horizontal scroll is at max during height reduction
        const container = scrollContainerRef.current;
        const maxHorizontalScroll =
          container.scrollWidth - container.clientWidth;
        if (container.scrollLeft < maxHorizontalScroll - 1) {
          container.scrollLeft = maxHorizontalScroll;
        }
      }
    },
    [horizontalScrollPhase],
  );

  useEffect(() => {
    const handleScroll = () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(() =>
        updateScrollPosition(false),
      );

      // Clear any existing scroll end timeout
      if (scrollEndTimeoutRef.current) {
        clearTimeout(scrollEndTimeoutRef.current);
      }

      // Set a timeout to ensure final position is set after scrolling stops
      scrollEndTimeoutRef.current = setTimeout(() => {
        updateScrollPosition(true); // Force final update
      }, 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (scrollEndTimeoutRef.current) {
        clearTimeout(scrollEndTimeoutRef.current);
      }
    };
  }, [updateScrollPosition]);

  // Calculate dynamic height - reduce from 100vh to minimum height where projects bottom is visible
  const currentHeight = useMemo(
    () => 100 - heightReductionProgress * (100 - minHeightVh),
    [heightReductionProgress, minHeightVh],
  );

  return (
    <>
      {/* Scroll trigger container - provides scrollable height */}
      <div
        ref={scrollTriggerRef}
        style={{ height: "300vh", position: "relative" }}
      >
        {/* Projects Section with Dynamic Height - sticky within scroll trigger */}
        <section
          data-section-id="CombinedProjectsFaqSection"
          className="sticky top-0 transition-colors duration-700"
          style={{
            height: `${currentHeight}vh`,
            backgroundColor:
              heightReductionProgress > 0 ? "#000000" : "#ffffff",
            willChange: "height, background-color",
          }}
        >
          {/* Projects Container */}
          <div
            ref={projectsContainerRef}
            className="relative h-full overflow-hidden"
          >
            <div className="absolute inset-0">
              {/* Header Section */}
              <motion.div
                className="absolute top-0 left-0 right-0 z-40 pt-16"
                initial={{ opacity: 0, y: 32 }}
                animate={
                  isHeaderVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }
                }
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="max-w-7xl mx-auto px-6 pb-12">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={
                        isHeaderVisible
                          ? { opacity: 1, y: 0 }
                          : { opacity: 0, y: 16 }
                      }
                      transition={{
                        duration: 0.5,
                        ease: "easeOut",
                        delay: 0.1,
                      }}
                    >
                      <h1
                        className="text-4xl lg:text-5xl font-medium leading-tight tracking-tight transition-colors duration-700"
                        style={{
                          color:
                            heightReductionProgress > 0 ? "#ffffff" : "#000000",
                          fontSize: "2.25rem",
                        }}
                      >
                        Website Creations and Client Projects
                      </h1>
                    </motion.div>
                    <motion.div
                      className="lg:pl-12"
                      initial={{ opacity: 0, y: 16 }}
                      animate={
                        isHeaderVisible
                          ? { opacity: 1, y: 0 }
                          : { opacity: 0, y: 16 }
                      }
                      transition={{
                        duration: 0.5,
                        ease: "easeOut",
                        delay: 0.2,
                      }}
                    >
                      <p
                        className="text-base leading-relaxed transition-colors duration-700"
                        style={{
                          color:
                            heightReductionProgress > 0 ? "#cccccc" : "#666666",
                          opacity: 0.8,
                        }}
                      >
                        Get to know me, my work style and my values through an
                        insight into my projects that stand for quality,
                        structure and sustainable solutions.
                      </p>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Scrollable Projects Container */}
              <div className="h-full flex items-start pb-20 pt-80 lg:pt-64">
                <div
                  ref={scrollContainerRef}
                  data-projects-area
                  className="flex gap-6 overflow-hidden relative"
                  style={{
                    scrollBehavior: "auto",
                    willChange: "scroll-position",
                  }}
                >
                  {/* Left spacer */}
                  <div className="w-[calc(50vw-45vw)] md:w-[calc(50vw-250px)] lg:w-[calc(50vw-333px)] flex-shrink-0"></div>

                  <div ref={projectsAreaRef} className="flex gap-6 px-6">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="w-[90vw] md:w-[500px] lg:w-[666px] flex-shrink-0"
                      >
                        <ProjectCard
                          id={project.id}
                          src={project.src}
                          type={project.type}
                          title={project.title}
                          alt={project.alt}
                          url={project.url}
                          badges={project.badges}
                          aspectRatio="16/9"
                          className="w-full transition-all duration-500"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Right spacer */}
                  <div className="w-[calc(50vw-45vw)] md:w-[calc(50vw-250px)] lg:w-[calc(50vw-333px)] flex-shrink-0"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* FAQ Section - Flows naturally below scroll trigger container */}
      <section ref={faqContainerRef} className="bg-black text-white">
        <div ref={faqContentRef} className="min-h-screen pb-32">
          {/* FAQ Section Header */}
          <div className="container mx-auto max-w-7xl px-6 lg:px-16 pt-20">
            <SectionDivider
              label="WHY YOU SHOULD WORK WITH ME"
              counter="(04)"
              duration={2}
              className="text-white"
              dividerColor="bg-primary/50"
            />
          </div>

          {/* FAQ Content */}
          <div className="container mx-auto max-w-7xl px-6 lg:px-16 py-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-32">
              {/* Left: Image with Social Sidebar */}
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
                    priority
                    quality={75}
                  />
                </div>
              </div>

              {/* Right: Text Content */}
              <div className="max-w-xl">
                <h2 className="text-3xl font-light mb-8 tracking-tight">
                  Trust in the expertise
                </h2>
                <p className="text-gray-400 text-base leading-relaxed font-light">
                  Honesty and transparency throughout the entire project are
                  essential for success. It&apos;s important to define goals and
                  options right from the start. This is the only way to develop
                  a functioning concept and a sustainable strategy.
                </p>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="max-w-4xl ml-auto">
              <FaqAccordion faqs={FAQ_DATA} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
