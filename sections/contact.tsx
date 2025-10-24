"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import GridPattern from "@/components/ui/shadcn-io/grid-pattern";
import { TextScramble } from "@/components/ui/text-scramble";

interface ContactSectionProps {
  className?: string;
}

export default function ContactSection({
  className = "",
}: ContactSectionProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [shouldTriggerScramble, setShouldTriggerScramble] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const scrambleTimeoutRef = useRef<NodeJS.Timeout>(null);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);

    if (!hasTriggered) {
      setHasTriggered(true);
      setShouldTriggerScramble(true);

      scrambleTimeoutRef.current = setTimeout(() => {
        setShouldTriggerScramble(false);
      }, 800);
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

  const handleScrambleComplete = useCallback(() => {
    setShouldTriggerScramble(false);
  }, []);

  useEffect(() => {
    return () => {
      if (scrambleTimeoutRef.current) {
        clearTimeout(scrambleTimeoutRef.current);
      }
    };
  }, []);

  return (
    <section
      data-section-id="ContactSection"
      className={`h-[60vh] relative flex items-center justify-center p-8 ${className}`}
      aria-label="Contact call-to-action section"
    >
      <div className="absolute inset-0 w-full h-full z-0">
        <GridPattern
          width={32}
          height={32}
          gridClassName="stroke-gray-400/20"
          surroundingCells={4}
          surroundingRadius={1}
        />
      </div>
      <div className="relative z-10 text-center max-w-7xl mx-auto grid-interaction-blocked">
        <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-7xl font-light text-white tracking-wide drop-shadow-2xl">
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 sm:gap-4 transition-opacity duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg"
            aria-label="Navigate to contact page to discuss your project"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <motion.span
              className={`inline-block relative border-b transition-colors duration-300 ${
                isHovered ? "border-primary" : "border-transparent"
              }`}
            >
              <TextScramble
                trigger={shouldTriggerScramble}
                duration={0.8}
                speed={0.04}
                onScrambleComplete={handleScrambleComplete}
                as="span"
              >
                Let&apos;s discuss
              </TextScramble>
            </motion.span>
            <motion.span
              className="inline-block relative rounded-xl"
              initial={{ scale: 0, width: 0, opacity: 0 }}
              animate={{
                scale: isHovered ? 1 : 0,
                width: isHovered ? "auto" : 0,
                opacity: isHovered ? 1 : 0,
              }}
              transition={{
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              style={{ overflow: "hidden" }}
            >
              <Image
                src="/cta-gif.gif"
                alt=""
                width={64}
                height={64}
                className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 xl:w-40 xl:h-40 object-contain rounded-xl"
                priority={false}
                unoptimized
              />
            </motion.span>
            <motion.span
              className={`inline-block relative border-b transition-colors duration-300 ${
                isHovered ? "border-primary" : "border-transparent"
              }`}
            >
              <TextScramble
                trigger={shouldTriggerScramble}
                duration={0.8}
                speed={0.04}
                onScrambleComplete={handleScrambleComplete}
                as="span"
              >
                your project
              </TextScramble>
            </motion.span>
            <motion.span
              animate={{
                x: isHovered ? 4 : 0,
                y: isHovered ? -4 : 0,
              }}
              transition={{ duration: 0.3 }}
              className="inline-block ml-2 sm:ml-4"
            >
              <ArrowUpRight className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
            </motion.span>
          </Link>
        </h2>
      </div>
    </section>
  );
}
