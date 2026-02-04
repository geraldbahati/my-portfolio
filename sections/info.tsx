"use client";

import React, { memo } from "react";
import { StickyScrollReveal } from "@/components/ui/sticky-scroll-reveal";
import GridPattern from "@/components/ui/shadcn-io/grid-pattern";
import { motion } from "framer-motion";

// Static sections data - defined outside component to prevent recreation on each render
const sections = [
  {
    label: "FOUNDATION",
    title: "Frontend Engineering",
    description:
      "Crafting responsive, high-performance user interfaces with modern React ecosystems and state-of-the-art animations.",
    bullets: [
      "React 19 & Next.js 16 Architecture",
      "TypeScript & Advanced State Management",
      "Advanced Animation (Framer Motion/GSAP)",
      "Performance Optimization (Core Web Vitals)",
      "Component Library Design Systems",
    ],
    image: "/web-design.jpg",
  },
  {
    label: "PHASE 1",
    title: "Backend Development",
    description:
      "Building robust, scalable server-side solutions with microservices architecture and type-safe database queries.",
    bullets: [
      "Node.js, Spring Boot & Go Microservices",
      "Django & Python Backend Systems",
      "API Design (REST & GraphQL)",
      "Database Modeling (PostgreSQL, MongoDB, Convex)",
      "Type-Safe Queries with sqlc",
    ],
    image: "/backend.jpg",
  },
  {
    label: "PHASE 2",
    title: "Cloud & DevOps",
    description:
      "Deploying and managing resilient cloud infrastructure with automated pipelines for reliable and continuous delivery.",
    bullets: [
      "Cloud Infrastructure (AWS, Cloudflare)",
      "CI/CD Pipeline Automation",
      "Containerization (Docker)",
      "Payment Integration (M-Pesa, Stripe)",
      "System Monitoring & Logging",
    ],
    image: "/devops-engineer.webp",
  },
  {
    label: "PHASE 3",
    title: "AI & Real-Time Systems",
    description:
      "Building intelligent, responsive applications with AI integration and real-time data synchronization at scale.",
    bullets: [
      "WebSockets & Redis Pub/Sub Architecture",
      "LLM/AI Integration & Prompt Engineering",
      "Generative UI Components",
      "Event-Driven Microservices",
      "10,000+ Concurrent Connection Systems",
    ],
    image: "/ai.jpg",
  },
];

const InfoSection = memo(function InfoSection() {
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
            <motion.p
              className="text-3xl md:text-4xl lg:text-[51.2px] leading-none tracking-tight indent-8 md:indent-80 lg:indent-96 grid-interaction-blocked"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <span>Product Engineering</span> is about shipping solutions that
              matter. I combine deep technical expertise with business acumen to
              deliver measurable outcomes—40% engagement growth, 90% time
              savings, and systems that scale.
            </motion.p>
          </div>
        </div>
      </div>
    </div>
  );
});

InfoSection.displayName = "InfoSection";

export default InfoSection;
