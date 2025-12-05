"use client";

import { memo, useMemo } from "react";
import { motion, MotionValue, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import Analytics from "@/lib/analytics";

// Lazy load the CutoutMaskImage component for better performance
const CutoutMaskImage = dynamic(
  () =>
    import("@/components/ui/cutout-image-mask").then((mod) => ({
      default: mod.CutoutMaskImage,
    })),
  { ssr: true },
);

// Optimized Character component with simplified transforms
interface CharacterProps {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  className?: string;
}

const Character = memo(
  ({ children, progress, range, className = "" }: CharacterProps) => {
    // Simplified opacity transform with reduced complexity
    const opacity = useTransform(progress, range, [0, 1]);

    // Handle spaces properly to maintain spacing
    if (children === " ") {
      return (
        <span className="inline-block" style={{ width: "0.25em" }}>
          {" "}
        </span>
      );
    }

    return (
      <span className={`relative inline-block ${className}`}>
        <span className="opacity-20">{children}</span>
        <motion.span
          className="absolute inset-0"
          style={{
            opacity,
            willChange: "opacity",
          }}
        >
          {children}
        </motion.span>
      </span>
    );
  },
  // Custom comparison to prevent unnecessary re-renders
  (prev, next) => {
    return prev.children === next.children && prev.progress === next.progress;
  },
);

Character.displayName = "Character";

interface BioOverlayProps {
  scrollProgress: MotionValue<number>;
}

export default function BioOverlay({ scrollProgress }: BioOverlayProps) {
  // Transform scroll progress to control content animations
  // Content animations trigger as bio slides into view (last 60% of scroll)
  // useTransform is already optimized internally by Framer Motion
  const contentProgress = useTransform(scrollProgress, [0.4, 1], [0, 1]);

  // Transform values for the cutout image
  // Image scales and moves as bio section slides up
  const imageScale = useTransform(contentProgress, [0, 1], [0.6, 1]);
  const imageOpacity = useTransform(contentProgress, [0, 0.2], [0, 1]);
  const imageY = useTransform(contentProgress, [0, 1], [100, 0]);

  // CTA button visibility based on scroll progress
  const ctaOpacity = useTransform(contentProgress, [0.7, 1], [0, 1]);
  const ctaY = useTransform(contentProgress, [0.7, 1], [20, 0]);

  // Text content - Memoized to prevent re-splitting on every render
  const tagline = "What I can do for you";
  const taglineChars = useMemo(() => tagline.split(""), []);

  const mainText =
    "As a web designer and digital expert, I combine creative, detail-loving design with strategic know-how in digital marketing to unlock your brand's full potential.";
  const mainChars = useMemo(() => mainText.split(""), []);

  const numberText = "(01)";
  const numberChars = useMemo(() => numberText.split(""), []);

  // Calculate character reveal ranges - Memoized with simplified calculation
  const totalChars = useMemo(
    () => taglineChars.length + numberChars.length + mainChars.length,
    [taglineChars.length, numberChars.length, mainChars.length],
  );

  return (
    <section
      className="relative h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-t-xl sm:rounded-t-[1rem] lg:rounded-t-[2rem] overflow-y-auto"
      style={{
        contain: "layout style paint",
        willChange: "transform",
      }}
    >
      {/* Subtle background elements */}
      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{
          opacity: useTransform(scrollProgress, [0, 0.5, 1], [0.3, 1, 1]),
          willChange: "opacity",
        }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-100/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-100/20 to-transparent rounded-full blur-3xl" />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[210px_1fr] gap-12 lg:gap-24 items-center">
          {/* Left: Animated Cutout Mask Image */}
          <motion.div
            className="flex justify-center lg:justify-start"
            style={{
              scale: imageScale,
              opacity: imageOpacity,
              y: imageY,
              willChange: "transform, opacity",
              transform: "translateZ(0)", // Force GPU layer
            }}
          >
            <CutoutMaskImage
              imageUrl="/original.jpeg"
              clickToChangeImage={false}
              maxWidth={282}
              className="w-full max-w-[282px]"
              alt="Profile portrait"
              priority={true}
              quality={75}
              sizes="(max-width: 640px) 282px, 282px"
            />
          </motion.div>

          {/* Right: Synchronized Text Content */}
          <div className="space-y-8">
            {/* Tagline and Number */}
            <div className="flex justify-between items-start">
              <div className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-gray-600">
                {tagline.split(" ").map((word, wordIdx) => {
                  // Calculate the starting character index for this word within the full tagline
                  const prevWordsLength = tagline
                    .split(" ")
                    .slice(0, wordIdx)
                    .join(" ").length;
                  const wordStartCharIndex =
                    prevWordsLength + (wordIdx > 0 ? 1 : 0); // +1 for space if not the first word

                  return (
                    <span
                      key={`tag-word-${wordIdx}`}
                      className="inline-block whitespace-nowrap"
                    >
                      {word.split("").map((char, charIdx) => {
                        const charIndex = wordStartCharIndex + charIdx;
                        const start = charIndex / totalChars;
                        const end = (charIndex + 3) / totalChars;

                        return (
                          <Character
                            key={`tag-${wordIdx}-${charIdx}`}
                            progress={contentProgress}
                            range={[start, end]}
                          >
                            {char}
                          </Character>
                        );
                      })}
                      {wordIdx < tagline.split(" ").length - 1 && (
                        <span
                          className="inline-block"
                          style={{ width: "0.25em" }}
                        >
                          {" "}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>

              <div className="text-xs sm:text-sm font-light text-gray-400 whitespace-nowrap">
                {numberChars.map((char, i) => {
                  const charIndex = taglineChars.length + i;
                  const start = charIndex / totalChars;
                  const end = (charIndex + 3) / totalChars;

                  return (
                    <Character
                      key={`num-${i}`}
                      progress={contentProgress}
                      range={[start, end]}
                    >
                      {char}
                    </Character>
                  );
                })}
              </div>
            </div>

            {/* Main Text */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl leading-tight font-light text-gray-900">
              {mainText.split(" ").map((word, wordIdx) => {
                // Calculate the starting character index for this word within the full mainText
                const prevMainTextLength = mainText
                  .split(" ")
                  .slice(0, wordIdx)
                  .join(" ").length;
                const mainTextWordStartCharIndex =
                  prevMainTextLength + (wordIdx > 0 ? 1 : 0); // +1 for space if not the first word

                const charOffset = taglineChars.length + numberChars.length;

                return (
                  <span
                    key={`main-word-${wordIdx}`}
                    className="inline-block whitespace-nowrap"
                  >
                    {word.split("").map((char, charIdx) => {
                      const charIndex =
                        charOffset + mainTextWordStartCharIndex + charIdx;
                      const start = charIndex / totalChars;
                      const end = (charIndex + 3) / totalChars;

                      return (
                        <Character
                          key={`main-${wordIdx}-${charIdx}`}
                          progress={contentProgress}
                          range={[start, end]}
                        >
                          {char}
                        </Character>
                      );
                    })}
                    {wordIdx < mainText.split(" ").length - 1 && (
                      <span
                        className="inline-block"
                        style={{ width: "0.25em" }}
                      >
                        {" "}
                      </span>
                    )}
                  </span>
                );
              })}
            </h2>

            {/* CTA Button - appears after text */}
            <motion.div
              style={{
                opacity: ctaOpacity,
                y: ctaY,
                willChange: "transform, opacity",
                transform: "translateZ(0)",
              }}
            >
              <Link
                href="/contact"
                onClick={() =>
                  Analytics.trackButtonClick(
                    "Arrange a consultation",
                    "Bio Overlay CTA",
                  )
                }
              >
                <motion.button
                  className="group inline-flex items-center gap-3 text-sm font-medium tracking-wider uppercase text-gray-900 transition-colors hover:text-gray-600"
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative">
                    Arrange a consultation
                    <span className="absolute bottom-0 left-0 w-full h-px bg-gray-900 origin-left transition-transform duration-300 scale-x-100 group-hover:scale-x-0" />
                  </span>
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
