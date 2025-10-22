"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import ProjectCard, { ProjectCardProps } from "@/components/project-card";
import Image from "next/image";
import { Facebook, Globe, Instagram, Linkedin, Twitter } from "lucide-react";
import { SectionDivider } from "@/components/section-divider";
import { FaqAccordion } from "@/components/faq-accordion";
import { FAQ_DATA } from "@/constants/faq-data";

// Sample project data
const projectsData: Omit<ProjectCardProps, "onVisible">[] = [
  {
    id: "ruff-baugesellschaft",
    src: "https://videos.pexels.com/video-files/3784309/3784309-uhd_2560_1440_30fps.mp4",
    type: "video",
    title: "RUFF BAUGESELLSCHAFT",
    alt: "Construction company website project",
    badges: [
      { text: "ABOUT US", position: "bottom-left" },
      { text: "1+ Years", position: "bottom-right" },
    ],
    aspectRatio: "3/2",
  },
  {
    id: "ev-rent",
    src: "https://videos.pexels.com/video-files/3571264/3571264-uhd_2560_1440_30fps.mp4",
    type: "video",
    title: "EV RENT",
    alt: "Electric vehicle rental platform",
    badges: [
      { text: "Traffic: +95.00%", position: "bottom-left" },
      { text: "Cost-per-Lead: -80.00%", position: "bottom-right" },
    ],
    aspectRatio: "3/2",
  },
  {
    id: "webfluss",
    src: "https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4",
    type: "video",
    title: "Webfluss",
    alt: "Webflow agency project",
    badges: [{ text: "Coming Soon", position: "bottom-left" }],
    aspectRatio: "3/2",
  },
  {
    id: "tech-startup",
    src: "https://videos.pexels.com/video-files/3130284/3130284-uhd_2560_1440_30fps.mp4",
    type: "video",
    title: "TECH STARTUP PLATFORM",
    alt: "Modern tech startup website",
    badges: [
      { text: "SaaS Platform", position: "bottom-left" },
      { text: "New", position: "bottom-right" },
    ],
    aspectRatio: "3/2",
  },
  {
    id: "ecommerce-store",
    src: "https://videos.pexels.com/video-files/3195394/3195394-uhd_2560_1440_25fps.mp4",
    type: "video",
    title: "E-COMMERCE STORE",
    alt: "Modern e-commerce platform",
    badges: [
      { text: "Sales: +150%", position: "bottom-left" },
      { text: "6 Months", position: "bottom-right" },
    ],
    aspectRatio: "3/2",
  },
  {
    id: "creative-agency",
    src: "https://videos.pexels.com/video-files/5011647/5011647-uhd_2560_1440_30fps.mp4",
    type: "video",
    title: "CREATIVE AGENCY",
    alt: "Design agency portfolio website",
    badges: [
      { text: "Design Studio", position: "bottom-left" },
      { text: "Featured", position: "bottom-right" },
    ],
    aspectRatio: "3/2",
  },
  {
    id: "mobile-app",
    src: "https://videos.pexels.com/video-files/3196036/3196036-uhd_2560_1440_30fps.mp4",
    type: "video",
    title: "RESTAURANT APP",
    alt: "Food delivery mobile application",
    badges: [
      { text: "Mobile App", position: "bottom-left" },
      { text: "React Native", position: "bottom-right" },
    ],
    aspectRatio: "3/2",
  },
];

// Social Links Component
function SocialSidebar() {
  const socialLinks = [
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Twitter, href: "#", label: "X (Twitter)" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Globe, href: "#", label: "Behance" },
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
export default function CombinedProjectsFaqSection() {
  const scrollTriggerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const faqContainerRef = useRef<HTMLDivElement>(null);
  const projectsAreaRef = useRef<HTMLDivElement>(null);
  const projectsContainerRef = useRef<HTMLDivElement>(null);
  const faqContentRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);
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
      const projectsArea = container.querySelector('[data-projects-area]') as HTMLElement;
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
    window.addEventListener('resize', measureMinHeight);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', measureMinHeight);
    };
  }, []);

  // Memoize horizontal scroll phase constant
  const horizontalScrollPhase = useMemo(() => 0.5, []);

  // Optimized scroll handler with RAF throttling
  const updateScrollPosition = useCallback(() => {
    const now = performance.now();

    // Throttle to ~60fps
    if (now - lastUpdateTimeRef.current < 16) {
      rafIdRef.current = requestAnimationFrame(updateScrollPosition);
      return;
    }

    lastUpdateTimeRef.current = now;

    if (!scrollTriggerRef.current || !scrollContainerRef.current) {
      return;
    }

    const triggerSection = scrollTriggerRef.current;
    const rect = triggerSection.getBoundingClientRect();
    const sectionHeight = triggerSection.offsetHeight;
    const viewportHeight = window.innerHeight;

    // Check if header should be visible
    const isInView = rect.top <= viewportHeight * 0.8;
    setIsHeaderVisible(prev => prev !== isInView ? isInView : prev);

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
      container.scrollLeft = horizontalProgress * maxHorizontalScroll;
    } else {
      // Height reduction phase
      setScrollProgress(1);
      const reductionProgress =
        (totalProgress - horizontalScrollPhase) / (1 - horizontalScrollPhase);
      setHeightReductionProgress(Math.min(reductionProgress, 1));
    }
  }, [horizontalScrollPhase]);

  useEffect(() => {
    const handleScroll = () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(updateScrollPosition);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [updateScrollPosition]);

  // Calculate dynamic height - reduce from 100vh to minimum height where projects bottom is visible
  const currentHeight = useMemo(
    () => 100 - (heightReductionProgress * (100 - minHeightVh)),
    [heightReductionProgress, minHeightVh]
  );

  return (
    <>
      {/* Scroll trigger container - provides scrollable height */}
      <div ref={scrollTriggerRef} style={{ height: "300vh", position: "relative" }}>
        {/* Projects Section with Dynamic Height - sticky within scroll trigger */}
        <section
          data-section-id="CombinedProjectsFaqSection"
          className="sticky top-0 transition-colors duration-700"
          style={{
            height: `${currentHeight}vh`,
            backgroundColor: heightReductionProgress > 0 ? "#000000" : "#ffffff",
            willChange: "height, background-color",
            transform: "translateZ(0)",
          }}
        >
          {/* Projects Container */}
          <div ref={projectsContainerRef} className="relative h-full overflow-hidden">
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
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                  >
                    <h1
                      className="text-4xl lg:text-5xl font-medium leading-tight tracking-tight transition-colors duration-700"
                      style={{
                        color: heightReductionProgress > 0 ? "#ffffff" : "#000000",
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
                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                  >
                    <p
                      className="text-base leading-relaxed transition-colors duration-700"
                      style={{
                        color: heightReductionProgress > 0 ? "#cccccc" : "#666666",
                        opacity: 0.8,
                      }}
                    >
                      Get to know me, my work style and my values through an
                      insight into my projects that stand for quality, structure
                      and sustainable solutions.
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
                  transform: "translateZ(0)",
                }}
              >
                {/* Left spacer */}
                <div className="w-[calc(50vw-45vw)] md:w-[calc(50vw-250px)] lg:w-[calc(50vw-333px)] flex-shrink-0"></div>

                <div ref={projectsAreaRef} className="flex gap-6 px-6">
                  {projectsData.map((project) => (
                    <div
                      key={project.id}
                      className="w-[90vw] md:w-[500px] lg:w-[666px] flex-shrink-0"
                    >
                      <ProjectCard
                        {...project}
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
                  essential for success. It&apos;s important to define goals
                  and options right from the start. This is the only way to
                  develop a functioning concept and a sustainable strategy.
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
