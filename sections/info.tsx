"use client";

import React, { memo, useRef, useEffect } from "react";
import { StickyScrollReveal } from "@/components/ui/sticky-scroll-reveal";
import GridPattern from "@/components/ui/shadcn-io/grid-pattern";

// Static sections data - defined outside component to prevent recreation on each render
const sections = [
  {
    label: "FRONTEND",
    title: "Frontend Engineering",
    description:
      "I build fast, interactive interfaces using React 19 and Next.js 16 — optimized for Core Web Vitals and shipped with edge-first rendering.",
    bullets: [
      "React 19 & Next.js 16 with App Router",
      "TypeScript-first component architecture",
      "Scroll-driven animations (Framer Motion, GSAP)",
      "Core Web Vitals & performance tuning",
      "Design system implementation",
    ],
    image: "/web-design.jpg",
  },
  {
    label: "BACKEND",
    title: "Backend & APIs",
    description:
      "I design type-safe APIs and data layers that handle real traffic — from oRPC procedure routers to payment flows with M-Pesa and Stripe.",
    bullets: [
      "Node.js, Spring Boot, Go, Django",
      "Type-safe APIs (oRPC, REST, GraphQL)",
      "PostgreSQL, MongoDB, Convex, D1",
      "Payment integration (M-Pesa, Stripe)",
      "Rate limiting, validation & error handling",
    ],
    image: "/backend.jpg",
  },
  {
    label: "INFRASTRUCTURE",
    title: "Cloud & DevOps",
    description:
      "I deploy on Cloudflare and AWS with multi-layer caching, containerized services, and CI/CD pipelines that keep deploys fast and reliable.",
    bullets: [
      "Cloudflare Workers, KV, R2, Queues",
      "AWS infrastructure & S3",
      "Docker containerization",
      "CI/CD pipeline automation",
      "Monitoring, logging & alerting",
    ],
    image: "/devops-engineer.webp",
  },
  {
    label: "AI & REALTIME",
    title: "AI & Real-Time Systems",
    description:
      "I integrate LLMs into product features and build real-time systems with WebSockets — from recommendation engines to live collaboration tools.",
    bullets: [
      "LLM integration & prompt engineering",
      "Vector search & recommendation engines",
      "WebSocket & Redis Pub/Sub architecture",
      "Generative UI components",
      "Event-driven microservices",
    ],
    image: "/ai.jpg",
  },
];

const InfoSection = memo(function InfoSection() {
  const closingRef = useRef<HTMLParagraphElement>(null);

  // Animate closing paragraph on intersection (manual IO avoids hydration mismatch)
  useEffect(() => {
    const el = closingRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.style.transition =
              "opacity 600ms ease, transform 600ms ease";
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          } else {
            el.style.transition = "none";
            el.style.opacity = "0";
            el.style.transform = "translateY(50px)";
          }
        });
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative bg-white">
      {/* Grid Background Layer - Behind everything */}
      <div className="absolute inset-0 z-0">
        <GridPattern
          className="pointer-events-none"
          gridClassName="stroke-current/5"
          width={32}
          height={32}
          strokeDasharray="0"
          surroundingCells={4}
          surroundingRadius={1}
        />
      </div>

      {/* Content Layer - Fully interactive, no pointer-events manipulation */}
      <div className="relative z-10">
        <StickyScrollReveal
          sections={sections}
          containerClassName="bg-transparent"
        />

        {/* Closing paragraph */}
        <div className="w-full px-8 flex items-center justify-center min-h-[30vh]">
          <div className="max-w-7xl mx-auto">
            <p
              ref={closingRef}
              className="text-3xl md:text-4xl lg:text-[51.2px] short:text-3xl leading-none tracking-tight indent-8 md:indent-80 lg:indent-96 short:indent-40 grid-interaction-blocked"
              style={{ opacity: 0, transform: "translateY(50px)" }}
            >
              <span>Product Engineering</span> is about shipping solutions that
              matter. I focus on the intersection of performance, reliability,
              and user experience — building systems that are fast to use, fast
              to ship, and built to scale.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

InfoSection.displayName = "InfoSection";

export default InfoSection;
