"use client";

import { useEffect, useRef, useState } from "react";
import { m, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { AdaptiveLink } from "@/components/AdaptiveLink";
import GridPattern from "@/components/ui/shadcn-io/grid-pattern";
import { TextScramble } from "@/components/ui/text-scramble";
import { trackContactCtaClicked } from "@/lib/analytics";

const SCRAMBLE_DURATION_MS = 900;

// Arrow animation with spring physics
const arrowVariants = {
  idle: { x: 0, y: 0 },
  hover: {
    x: 5,
    y: -5,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 15,
    },
  },
};

function handleCtaClick() {
  trackContactCtaClicked({
    surface: "contact_section",
    label: "Let's work together",
    destination: "/contact",
  });
}

interface ContactSectionProps {
  className?: string;
}

interface StableScramblePhraseProps {
  children: string;
  isActive: boolean;
  speed: number;
  trigger: boolean;
}

function StableScramblePhrase({
  children,
  isActive,
  speed,
  trigger,
}: StableScramblePhraseProps) {
  return (
    <span
      data-contact-phrase="true"
      className={`relative inline-block whitespace-nowrap border-b transition-colors duration-300 ${
        isActive ? "border-primary" : "border-transparent"
      }`}
    >
      <span aria-hidden="true" className="invisible">
        {children}
      </span>
      <TextScramble
        aria-hidden="true"
        trigger={trigger}
        duration={0.8}
        speed={speed}
        as="span"
        className="absolute inset-0 whitespace-nowrap text-center"
      >
        {children}
      </TextScramble>
    </span>
  );
}

const ContactSection = function ContactSection({
  className = "",
}: ContactSectionProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [shouldTriggerScramble, setShouldTriggerScramble] = useState(false);
  const [hasPreparedMedia, setHasPreparedMedia] = useState(false);
  const scrambleTimeoutRef = useRef<NodeJS.Timeout>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isActive = isHovered || isFocused;
  const shouldRevealMedia = isActive && !prefersReducedMotion;

  const stopScramble = () => {
    if (scrambleTimeoutRef.current) {
      clearTimeout(scrambleTimeoutRef.current);
      scrambleTimeoutRef.current = null;
    }
    setShouldTriggerScramble(false);
  };

  const startInteraction = () => {
    setHasPreparedMedia(true);
    if (prefersReducedMotion) return;

    if (scrambleTimeoutRef.current) {
      clearTimeout(scrambleTimeoutRef.current);
    }
    setShouldTriggerScramble(true);
    scrambleTimeoutRef.current = setTimeout(() => {
      setShouldTriggerScramble(false);
      scrambleTimeoutRef.current = null;
    }, SCRAMBLE_DURATION_MS);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    startInteraction();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (!isFocused) stopScramble();
  };

  const handleFocus = () => {
    setIsFocused(true);
    startInteraction();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!isHovered) stopScramble();
  };

  useEffect(() => {
    sectionRef.current?.setAttribute("data-contact-hydrated", "true");

    return () => {
      if (scrambleTimeoutRef.current) {
        clearTimeout(scrambleTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (shouldRevealMedia) {
      void video.play().catch(() => {
        // The static first frame remains visible if playback is unavailable.
      });
      return;
    }

    video.pause();
    video.currentTime = 0;
  }, [hasPreparedMedia, shouldRevealMedia]);

  return (
    <section
      ref={sectionRef}
      data-section-id="contact"
      className={`h-[60vh] short:h-[50vh] relative flex items-center justify-center bg-black px-4 py-8 sm:p-8 short:p-4 ${className}`}
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
      <div className="relative z-10 mx-auto w-full max-w-7xl text-center grid-interaction-blocked">
        <div
          data-contact-hover-target="true"
          className="relative mx-auto h-32 w-full max-w-7xl sm:h-36 md:h-32 lg:h-28 short:h-24"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <h2 className="absolute inset-0 flex items-center justify-center text-[clamp(1rem,5vw,4rem)] leading-tight font-light text-white tracking-wide drop-shadow-2xl">
            <AdaptiveLink
              href="/contact"
              className="group inline-block whitespace-nowrap text-center transition-opacity duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg"
              aria-label="Navigate to contact page to discuss your project"
              prefetchOnViewport
              prefetchRootMargin="150px"
              onFocus={handleFocus}
              onBlur={handleBlur}
              onClick={handleCtaClick}
            >
              <StableScramblePhrase
                isActive={isActive}
                speed={0.1}
                trigger={shouldTriggerScramble}
              >
                Let&apos;s discuss
              </StableScramblePhrase>{" "}
              <span
                aria-hidden="true"
                data-contact-media="true"
                className={`inline-grid place-items-center overflow-hidden rounded-xl align-middle bg-black/40 transition-[max-width,max-height,margin,opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                  shouldRevealMedia
                    ? "mx-[0.25em] max-h-7 max-w-12 scale-100 opacity-100 sm:max-h-10 sm:max-w-16 md:max-h-14 md:max-w-24 lg:max-h-20 lg:max-w-32 xl:max-h-24 xl:max-w-40 short:max-h-12 short:max-w-20"
                    : "mx-0 max-h-0 max-w-0 scale-90 opacity-0"
                }`}
              >
                {hasPreparedMedia && (
                  <video
                    ref={videoRef}
                    data-contact-video="true"
                    src="/cta-video.mp4"
                    className="aspect-[5/3] h-auto w-12 rounded-xl object-cover sm:w-16 md:w-24 lg:w-32 xl:w-40 short:w-20"
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                )}
              </span>
              <StableScramblePhrase
                isActive={isActive}
                speed={0.04}
                trigger={shouldTriggerScramble}
              >
                your project
              </StableScramblePhrase>
              <m.span
                variants={arrowVariants}
                initial="idle"
                animate={shouldRevealMedia ? "hover" : "idle"}
                className="inline-block ml-2 sm:ml-4"
              >
                <ArrowUpRight className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
              </m.span>
            </AdaptiveLink>
          </h2>
        </div>
      </div>
    </section>
  );
};

ContactSection.displayName = "ContactSection";

export default ContactSection;
