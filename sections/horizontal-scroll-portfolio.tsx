"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import ProjectCard, { ProjectCardProps } from "@/components/project-card";

// Sample project data - same as before
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

export default function ProjectsSectionPinned() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || !scrollContainerRef.current) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      const viewportHeight = window.innerHeight;

      // Check if header should be visible (when section starts coming into view)
      const isInView = rect.top <= viewportHeight * 0.8;
      setIsHeaderVisible(isInView);

      // Calculate scroll progress through the section
      const scrollableDistance = sectionHeight - viewportHeight;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollableDistance));

      setScrollProgress(progress);

      // Apply horizontal scroll based on vertical progress
      const container = scrollContainerRef.current;
      const maxHorizontalScroll = container.scrollWidth - container.clientWidth;
      container.scrollLeft = progress * maxHorizontalScroll;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial calculation

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate section height based on horizontal scroll content
  const calculateSectionHeight = () => {
    // Make section height proportional to horizontal content
    // This creates the "scroll distance" for the pinned effect
    return "calc(200vh + 100vw)"; // Adjust multiplier as needed
  };

  return (
    <>
      {/* Pinned Section - Both Header and Horizontal Scroll */}
      <section
        ref={sectionRef}
        data-section-id="ProjectsSectionPinned"
        className="relative"
        style={{ height: calculateSectionHeight() }}
      >
        {/* Sticky Container */}
        <div className="sticky top-0 h-screen overflow-hidden">
          {/* Header Section - Now Pinned */}
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
                    className="text-4xl lg:text-5xl font-medium leading-tight tracking-tight"
                    style={{ color: 'var(--page-text-auto, #000000)', fontSize: "2.25rem" }}
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
                  <p className="text-base leading-relaxed" style={{ color: 'var(--page-text-auto, #666666)', opacity: 0.8 }}>
                    Get to know me, my work style and my values through an
                    insight into my projects that stand for quality, structure
                    and sustainable solutions.
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Scrollable Container */}
          <div className="h-full flex items-start pb-20 pt-80 lg:pt-64">
            <div
              ref={scrollContainerRef}
              className="flex gap-6 overflow-hidden relative"
              style={{ scrollBehavior: "auto" }} // Disable smooth scroll for programmatic control
            >
              {/* Left spacer to center the first project initially */}
              <div className="w-[calc(50vw-45vw)] md:w-[calc(50vw-250px)] lg:w-[calc(50vw-333px)] flex-shrink-0"></div>

              <div className="flex gap-6 px-6">
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

                {/* End Message */}
                <div className="w-[90vw] md:w-[600px] lg:w-[800px] flex-shrink-0 flex items-center justify-center">
                  <div className="text-center">
                    <h3 className="text-3xl font-light mb-4" style={{ color: 'var(--page-text-auto, #666666)', opacity: 0.8 }}>
                      More Projects Coming Soon
                    </h3>
                    <p style={{ color: 'var(--page-text-auto, #999999)', opacity: 0.6 }}>
                      Continue scrolling to explore more content
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Hints */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
            <p className="text-sm mb-2" style={{ color: 'var(--page-text-auto, #666666)', opacity: 0.7 }}>
              {scrollProgress < 0.1
                ? "Scroll down to explore"
                : scrollProgress > 0.9
                  ? "End of projects"
                  : "Keep scrolling"}
            </p>
            <div className="animate-bounce">
              <svg
                className="w-6 h-6 mx-auto"
                style={{ color: 'var(--page-text-auto, #999999)', opacity: 0.6 }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </div>

          {/* Navigation Hints */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
            <p className="text-sm mb-2" style={{ color: 'var(--page-text-auto, #666666)', opacity: 0.7 }}>
              {scrollProgress < 0.1
                ? "Scroll down to explore"
                : scrollProgress > 0.9
                  ? "End of projects"
                  : "Keep scrolling"}
            </p>
            <div className="animate-bounce">
              <svg
                className="w-6 h-6 mx-auto"
                style={{ color: 'var(--page-text-auto, #999999)', opacity: 0.6 }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Continue with regular content */}
      {/* <section className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-6">
          <h2 className="text-4xl font-light text-gray-900 mb-4">
            Let&apos;s Work Together
          </h2>
          <p className="text-gray-600 text-lg">
            Ready to start your next project?
          </p>
        </div>
      </section> */}
    </>
  );
}
