"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import GridPattern from "@/components/ui/shadcn-io/grid-pattern";
import { TextScramble } from "@/components/ui/text-scramble";

// Smooth easing curve
const smoothEase = [0.22, 1, 0.36, 1];

// Arrow animation with spring physics
const arrowVariants = {
  idle: { x: 0, y: 0 },
  hover: {
    x: 5,
    y: -5,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15,
    },
  },
};

interface ContactSectionProps {
  className?: string;
}

const ContactSection = memo(function ContactSection({
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
          gridClassName="stroke-muted-foreground/20"
          surroundingCells={4}
          surroundingRadius={1}
        />
      </div>
      <div className="relative z-10 text-center max-w-7xl mx-auto grid-interaction-blocked">
        <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-7xl font-light text-white tracking-wide drop-shadow-2xl">
          <Link
            href="/contact"
            className="group inline transition-opacity duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg"
            aria-label="Navigate to contact page to discuss your project"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <motion.span
              className={`inline border-b transition-colors duration-300 ${
                isHovered ? "border-primary" : "border-transparent"
              }`}
            >
              <TextScramble
                trigger={shouldTriggerScramble}
                duration={0.8}
                speed={0.1}
                onScrambleComplete={handleScrambleComplete}
                as="span"
              >
                Let&apos;s discuss
              </TextScramble>
            </motion.span>{" "}
            {/* Image always in DOM - animate properties instead of mount/unmount */}
            <motion.span
              className="inline-block relative rounded-xl overflow-hidden align-middle"
              initial={false}
              animate={{
                scale: isHovered ? 1 : 0,
                opacity: isHovered ? 1 : 0,
                width: isHovered ? "auto" : 0,
                marginLeft: isHovered ? "0.25em" : 0,
                marginRight: isHovered ? "0.25em" : 0,
              }}
              transition={{
                duration: 0.8,
                ease: smoothEase,
              }}
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
              className={`inline border-b transition-colors duration-300 ${
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
              variants={arrowVariants}
              initial="idle"
              animate={isHovered ? "hover" : "idle"}
              className="inline-block ml-2 sm:ml-4"
            >
              <ArrowUpRight className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
            </motion.span>
          </Link>
        </h2>
      </div>
    </section>
  );
});

ContactSection.displayName = "ContactSection";

export default ContactSection;
