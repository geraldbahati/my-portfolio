"use client";

import { memo } from "react";
import {
  motion,
  useTransform,
  MotionValue,
} from "framer-motion";
import { CutoutMaskImage } from "@/components/ui/cutout-image-mask";

// Word component for synchronized animation
interface WordProps {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  className?: string;
}

const Word = memo(
  ({ children, progress, range, className = "" }: WordProps) => {
    const opacity = useTransform(progress, range, [0, 1]);

    return (
      <span className={`relative ${className}`}>
        <span className="opacity-10">{children}</span>
        <motion.span className="absolute inset-0" style={{ opacity }}>
          {children}
        </motion.span>
      </span>
    );
  },
);

Word.displayName = "Word";

/**
 * Bio Section Component optimized for overlay usage
 *
 * This component is designed to work with the scroll-triggered overlay effect.
 *
 * Key design decisions:
 * - Uses h-screen (exactly 100vh) instead of min-h-screen to ensure consistent height
 * - This allows precise bottom-to-bottom alignment with viewport on scroll completion
 * - When scroll animation completes (y=0vh):
 *   - Section top aligns with viewport top
 *   - Section bottom aligns with viewport bottom
 * - overflow-y-auto allows internal scrolling if content exceeds viewport height
 * - Accepts scroll progress from parent to synchronize all internal animations
 */
interface BioOverlayProps {
  scrollProgress: MotionValue<number>;
}

export default function BioOverlay({ scrollProgress }: BioOverlayProps) {
  // Transform scroll progress to control content animations
  // Content animations trigger as bio slides into view (last 60% of scroll)
  const contentProgress = useTransform(scrollProgress, [0.4, 1], [0, 1]);

  // Transform values for the cutout image
  // Image scales and moves as bio section slides up
  const imageScale = useTransform(contentProgress, [0, 0.5], [0.6, 1]);
  const imageOpacity = useTransform(contentProgress, [0, 0.2], [0, 1]);
  const imageY = useTransform(contentProgress, [0, 0.5], [100, 0]);

  // CTA button visibility based on scroll progress
  const ctaOpacity = useTransform(contentProgress, [0.7, 1], [0, 1]);
  const ctaY = useTransform(contentProgress, [0.7, 1], [20, 0]);

  // Text content
  const tagline = "What I can do for you";
  const taglineWords = tagline.split(" ");

  const mainText =
    "As a web designer and digital expert, I combine creative, detail-loving design with strategic know-how in digital marketing to unlock your brand's full potential.";
  const mainWords = mainText.split(" ");

  // Calculate word reveal ranges
  const totalWords = taglineWords.length + mainWords.length + 1; // +1 for "(01)"

  return (
    <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-t-[2rem] sm:rounded-t-[3rem] lg:rounded-t-[4rem] overflow-y-auto">
      {/* Subtle background elements */}
      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{
          opacity: useTransform(scrollProgress, [0, 0.5, 1], [0.3, 1, 1]),
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
            }}
          >
            <CutoutMaskImage
              imageUrl="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop"
              clickToChangeImage={false}
              maxWidth={210}
              className="w-full max-w-[210px]"
              alt="Profile portrait"
            />
          </motion.div>

          {/* Right: Synchronized Text Content */}
          <div className="space-y-8">
            {/* Tagline and Number */}
            <div className="flex justify-between items-start">
              <div className="flex flex-wrap gap-2">
                {taglineWords.map((word, i) => {
                  const wordIndex = i;
                  const start = wordIndex / totalWords;
                  const end = (wordIndex + 1) / totalWords;

                  return (
                    <Word
                      key={`tag-${i}`}
                      progress={contentProgress}
                      range={[start, end]}
                      className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-gray-600"
                    >
                      {word}
                    </Word>
                  );
                })}
              </div>

              <Word
                progress={contentProgress}
                range={[
                  taglineWords.length / totalWords,
                  (taglineWords.length + 1) / totalWords,
                ]}
                className="text-xs sm:text-sm font-light text-gray-400"
              >
                (01)
              </Word>
            </div>

            {/* Main Text */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl leading-tight font-light text-gray-900">
              {mainWords.map((word, i) => {
                const wordIndex = taglineWords.length + 1 + i; // +1 for "(01)"
                const start = wordIndex / totalWords;
                const end = Math.min((wordIndex + 1) / totalWords, 1);

                return (
                  <Word
                    key={`main-${i}`}
                    progress={contentProgress}
                    range={[start, end]}
                    className="mr-[0.25em] inline-block"
                  >
                    {word}
                  </Word>
                );
              })}
            </h2>

            {/* CTA Button - appears after text */}
            <motion.div
              style={{
                opacity: ctaOpacity,
                y: ctaY,
              }}
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
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
