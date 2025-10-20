"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  motionValue,
  MotionValue,
  useTransform,
} from "framer-motion";
import dynamic from "next/dynamic";
import Image from "next/image";

// Lazy load heavy components
const GridPattern = dynamic(
  () => import("@/components/ui/shadcn-io/grid-pattern"),
  { ssr: false },
);
const TextScramble = dynamic(
  () =>
    import("@/components/ui/text-scramble").then((mod) => ({
      default: mod.TextScramble,
    })),
  { ssr: false },
);

// Animation timing constants
const ANIMATION_DELAYS = {
  INITIAL: 0,
  TITLE: 300,
  DESCRIPTION: 600,
  CTA: 1200, // CTA appears last
  NAME_SCRAMBLE_STOP: 1500, // Stop scrambling when all content appears
} as const;

const ANIMATION_DURATIONS = {
  FADE_IN: 800,
  NAME_SCRAMBLE: 500, // Each scramble cycle
  NAME_SCRAMBLE_SPEED: 0.05,
  HOVER_SCRAMBLE: 500, // Duration for hover scramble
  HOVER_SCRAMBLE_SPEED: 0.04,
  NAME_BLUR_CLEAR: 1200,
} as const;

// Memoized CTA component with optimized hover handling
const TextScrambleHoverTrigger = memo(() => {
  const [isHovered, setIsHovered] = useState(false);
  const [shouldTrigger, setShouldTrigger] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const scrambleTimeoutRef = useRef<NodeJS.Timeout>(null);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);

    // Only trigger if we haven't already triggered for this hover session
    if (!hasTriggered) {
      setHasTriggered(true);
      setShouldTrigger(true);

      // Force stop after 500ms regardless of hover state
      scrambleTimeoutRef.current = setTimeout(() => {
        setShouldTrigger(false);
      }, ANIMATION_DURATIONS.HOVER_SCRAMBLE);
    }
  }, [hasTriggered]);

  const handleMouseLeave = useCallback(() => {
    if (scrambleTimeoutRef.current) {
      clearTimeout(scrambleTimeoutRef.current);
    }
    setIsHovered(false);
    setShouldTrigger(false);
    setHasTriggered(false); // Reset for next hover
  }, []);

  const handleScrambleComplete = useCallback(() => {
    setShouldTrigger(false);
  }, []);

  useEffect(() => {
    return () => {
      if (scrambleTimeoutRef.current) {
        clearTimeout(scrambleTimeoutRef.current);
      }
    };
  }, []);

  return (
    <motion.div
      className={`flex-shrink-0 cursor-pointer relative inline-block border-b transition-colors duration-300 ${
        isHovered ? "border-primary" : "border-muted-foreground/50"
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      aria-label="Request a project"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <TextScramble
        className="pointer-events-auto text-white font-light text-sm sm:text-base uppercase tracking-[0.2em]"
        trigger={shouldTrigger}
        duration={ANIMATION_DURATIONS.HOVER_SCRAMBLE}
        speed={ANIMATION_DURATIONS.HOVER_SCRAMBLE_SPEED}
        onScrambleComplete={handleScrambleComplete}
        as="span"
      >
        Request a project
      </TextScramble>
    </motion.div>
  );
});

TextScrambleHoverTrigger.displayName = "TextScrambleHoverTrigger";

// Animation variants for better organization
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    filter: "blur(10px)",
  },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: ANIMATION_DURATIONS.FADE_IN / 1000,
      delay: delay / 1000,
      ease: [0.22, 1, 0.36, 1] as const,
      filter: {
        duration: (ANIMATION_DURATIONS.FADE_IN / 1000) * 1.2,
      },
    },
  }),
};

const nameVariants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    filter: "blur(4px)",
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

interface HeroSectionProps {
  scrollProgress?: MotionValue<number>;
}

export default function HeroSection({ scrollProgress }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);
  const [nameScrambling, setNameScrambling] = useState(false);
  const [scrambleCount, setScrambleCount] = useState(0);
  const scrambleIntervalRef = useRef<NodeJS.Timeout>(null);
  const stopScrambleTimeoutRef = useRef<NodeJS.Timeout>(null);

  // Scale image down as user scrolls (from 1 to 0.85)
  // Create a default motion value if scrollProgress is not provided
  const defaultProgress = useRef(motionValue(0));
  const activeProgress = scrollProgress ?? defaultProgress.current;
  const imageScale = useTransform(activeProgress, [0, 1], [1, 0.85]);

  useEffect(() => {
    setMounted(true);

    // Start continuous scrambling immediately
    setNameScrambling(true);

    // Set up interval to retrigger scramble
    scrambleIntervalRef.current = setInterval(() => {
      setScrambleCount((prev) => prev + 1);
    }, ANIMATION_DURATIONS.NAME_SCRAMBLE + 100); // Small gap between scrambles

    // Stop scrambling when all content appears (after CTA animation starts)
    stopScrambleTimeoutRef.current = setTimeout(() => {
      setNameScrambling(false);
      if (scrambleIntervalRef.current) {
        clearInterval(scrambleIntervalRef.current);
      }
    }, ANIMATION_DELAYS.CTA + 200); // Stop shortly after CTA starts animating

    return () => {
      if (scrambleIntervalRef.current) {
        clearInterval(scrambleIntervalRef.current);
      }
      if (stopScrambleTimeoutRef.current) {
        clearTimeout(stopScrambleTimeoutRef.current);
      }
    };
  }, []);

  return (
    <section
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: "#0a0a0a" }}
      role="banner"
    >
      {/* Profile Background Image */}
      <div className="absolute inset-0 z-0 flex items-start justify-center">
        <motion.div
          className="relative w-full h-full sm:w-[1920px] sm:h-[1080px] will-change-transform"
          style={{ scale: imageScale }}
        >
          <Image
            src="/habibi.png"
            alt=""
            fill
            priority
            className="object-cover sm:object-contain mix-blend-screen"
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 100vw, 1920px"
            quality={85}
          />
        </motion.div>
      </div>

      {/* Edge Fade Overlay - Gentle vignette effect */}
      <div
        className="absolute inset-0 z-[5]"
        style={{
          background:
            "linear-gradient(to right, #0a0a0a 0%, transparent 20%, transparent 80%, #0a0a0a 100%)",
        }}
      />
      <div
        className="absolute inset-0 z-[5]"
        style={{
          background:
            "linear-gradient(to bottom, #0a0a0a 0%, transparent 20%, transparent 80%, #0a0a0a 100%)",
        }}
      />

      {/* Grid Pattern Background - Memoized for performance */}
      {mounted && (
        <GridPattern
          className="absolute inset-0 z-10"
          gridClassName="stroke-current/5"
          width={32}
          height={32}
          surroundingCells={4}
          surroundingRadius={1}
        />
      )}

      {/* Hero Content */}
      <div className="relative z-10 min-h-screen flex items-end justify-end px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12 lg:pb-16 pointer-events-none">
        <div className="w-full max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {mounted && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
              >
                {/* Name - Continuously scrambles while other content appears */}
                <motion.div
                  className="mb-8 sm:mb-12 lg:mb-16"
                  variants={nameVariants}
                  initial="initial"
                  animate="animate"
                >
                  <motion.div
                    className="will-change-[filter]"
                    animate={{
                      filter: nameScrambling ? "blur(1px)" : "blur(0px)",
                    }}
                    transition={{
                      duration: 0.3,
                      ease: "easeInOut",
                    }}
                  >
                    <TextScramble
                      key={nameScrambling ? scrambleCount : "stopped"} // Force re-render only when scrambling
                      className="text-xs sm:text-sm lg:text-base font-light text-primary tracking-[0.2em] sm:tracking-[0.3em] uppercase"
                      trigger={nameScrambling}
                      duration={ANIMATION_DURATIONS.NAME_SCRAMBLE}
                      speed={ANIMATION_DURATIONS.NAME_SCRAMBLE_SPEED}
                      as="p"
                    >
                      Gerald Bahati
                    </TextScramble>
                  </motion.div>
                </motion.div>

                {/* Main Title */}
                <motion.div
                  className="mb-8 sm:mb-10 lg:mb-12"
                  custom={ANIMATION_DELAYS.TITLE}
                  variants={itemVariants}
                >
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-thin leading-[0.9] sm:leading-none tracking-tight grid-interaction-blocked pointer-events-auto text-white">
                    <motion.span
                      className="inline-block font-medium"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.8,
                        delay: 0.3,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      Web design
                    </motion.span>
                    <motion.span
                      className="text-muted-foreground mx-2 sm:mx-3"
                      aria-hidden="true"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: 0.5,
                        delay: 0.6,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      /
                    </motion.span>
                    <motion.span
                      className="inline-block text-transparent
                      [text-stroke:1px_rgba(255,255,255,1)] [-webkit-text-stroke:1px_rgba(255,255,255,1)]
                      sm:[text-stroke:0.5px_rgba(255,255,255,1)] sm:[-webkit-text-stroke:0.5px_rgba(255,255,255,1)]"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.8,
                        delay: 0.8,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      Digital Marketing
                    </motion.span>
                  </h1>
                </motion.div>

                {/* Description and CTA */}
                <motion.div
                  className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 sm:gap-8"
                  custom={ANIMATION_DELAYS.DESCRIPTION}
                  variants={itemVariants}
                >
                  {/* Description */}
                  <motion.div
                    className="flex-1 lg:max-w-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.8,
                      delay: 1,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <p className="text-sm sm:text-base lg:text-lg text-muted-foreground font-light leading-relaxed tracking-wide grid-interaction-blocked pointer-events-auto">
                      Design meets Performance – creative web design and digital
                      marketing delivered precisely.
                    </p>
                  </motion.div>

                  {/* CTA Text */}
                  <motion.div
                    className="flex-shrink-0"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.6,
                      delay: 1.2,
                      ease: [0.22, 1, 0.36, 1],
                      type: "spring",
                      stiffness: 200,
                      damping: 20,
                    }}
                  >
                    <TextScrambleHoverTrigger />
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
