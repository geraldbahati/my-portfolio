"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { TextScramble } from "@/components/ui/text-scramble";
import GridPattern from "@/components/ui/shadcn-io/grid-pattern";
import { ArrowLeft } from "lucide-react";

export default function NotFoundContent() {
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [shouldTriggerScramble, setShouldTriggerScramble] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const scrambleTimeoutRef = useRef<NodeJS.Timeout>(null);

  // Message scramble state - runs once on mount
  const [messageScramble, setMessageScramble] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Stop message scramble after animation completes
    const timer = setTimeout(() => {
      setMessageScramble(false);
    }, 1200); // duration (1s) + small buffer
    return () => clearTimeout(timer);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    if (!hasTriggered) {
      setHasTriggered(true);
      setShouldTriggerScramble(true);
      scrambleTimeoutRef.current = setTimeout(() => {
        setShouldTriggerScramble(false);
      }, 600);
    }
  }, [hasTriggered]);

  const handleMouseLeave = useCallback(() => {
    if (scrambleTimeoutRef.current) {
      clearTimeout(scrambleTimeoutRef.current);
    }
    setIsHovered(false);
    setShouldTriggerScramble(false);
    setHasTriggered(false);
  }, []);

  useEffect(() => {
    return () => {
      if (scrambleTimeoutRef.current) {
        clearTimeout(scrambleTimeoutRef.current);
      }
    };
  }, []);

  return (
    <main className="min-h-screen bg-hero-bg flex items-center justify-center px-6 relative overflow-hidden">
      {/* Grid Pattern Background */}
      {mounted && (
        <GridPattern
          className="absolute inset-0 z-0"
          gridClassName="stroke-current/10"
          width={32}
          height={32}
          surroundingCells={4}
          surroundingRadius={1}
        />
      )}

      {/* Gradient Overlays */}
      <div
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, var(--hero-bg) 70%)",
        }}
      />

      <div className="text-center max-w-3xl relative z-10">
        {/* Large 404 with animation */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h1
            className="text-[8rem] sm:text-[12rem] lg:text-[16rem] font-thin text-white leading-none tracking-tight select-none"
            style={{ lineHeight: "0.85" }}
          >
            <span className="inline-block">4</span>
            <motion.span
              className="inline-block text-primary"
              animate={{
                scale: [1, 1.05, 1],
                opacity: [1, 0.8, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              0
            </motion.span>
            <span className="inline-block">4</span>
          </h1>
        </motion.div>

        {/* Message with TextScramble */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="mt-8 mb-12"
        >
          <TextScramble
            className="text-muted-foreground text-lg sm:text-xl font-light tracking-wide"
            duration={1}
            speed={0.03}
            trigger={messageScramble}
            onScrambleComplete={() => setMessageScramble(false)}
            as="p"
          >
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </TextScramble>
        </motion.div>

        {/* CTA with hover effect */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-3 group"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <motion.span
              animate={{ x: isHovered ? -4 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ArrowLeft
                className={`w-4 h-4 transition-colors duration-300 ${
                  isHovered ? "text-primary" : "text-muted-foreground"
                }`}
              />
            </motion.span>
            <span
              className={`border-b pb-1 font-light text-sm uppercase tracking-[0.2em] transition-colors duration-300 ${
                isHovered
                  ? "border-primary text-white"
                  : "border-muted-foreground/50 text-white"
              }`}
            >
              <TextScramble
                trigger={shouldTriggerScramble}
                duration={0.6}
                speed={0.04}
                as="span"
              >
                Back to Home
              </TextScramble>
            </span>
          </Link>
        </motion.div>

        {/* Decorative line */}
        <motion.div
          className="mt-16 flex items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          <div className="h-[1px] w-16 bg-muted-foreground/30" />
          <span className="text-xs text-muted-foreground/50 uppercase tracking-[0.3em]">
            Lost in space
          </span>
          <div className="h-[1px] w-16 bg-muted-foreground/30" />
        </motion.div>
      </div>
    </main>
  );
}
