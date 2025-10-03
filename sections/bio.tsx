"use client";

import { memo, useRef } from "react";
import { motion, MotionValue, useInView, useScroll, useTransform } from "framer-motion";
import { CutoutMaskImage } from "@/components/ui/cutout-image-mask";

// Character component for synchronized animation
interface CharProps {
  children: string;
  progress: MotionValue<number>;
  range: [number, number];
  className?: string;
}

const Char = memo(
  ({ children, progress, range, className = "" }: CharProps) => {
    // Create a highlight window that peaks in the middle of the range
    const [start, end] = range;
    const mid = (start + end) / 2;
    const windowSize = (end - start) * 2; // Width of highlight window

    // Opacity peaks when scroll progress is at the character's position
    const opacity = useTransform(
      progress,
      [mid - windowSize, mid, mid + windowSize],
      [0, 1, 0]
    );

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

Char.displayName = "Char";

// Main Bio Section Component
export default function BioSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Track section visibility
  const isInView = useInView(sectionRef, { once: false, margin: "-20%" });

  // Scroll progress for the entire section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Scroll progress specifically for content animations
  const { scrollYProgress: contentProgress } = useScroll({
    target: contentRef,
    offset: ["start 0.9", "end 0.3"],
  });

  // Transform values for the cutout image (using full section scroll)
  const imageScale = useTransform(scrollYProgress, [0, 1], [0.6, 1]);
  const imageOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const imageY = useTransform(scrollYProgress, [0, 1], [100, 0]);

  // Text content
  const tagline = "What I can do for you";
  const taglineChars = tagline.split("");

  const mainText =
    "As a web designer and digital expert, I combine creative, detail-loving design with strategic know-how in digital marketing to unlock your brand's full potential.";
  const mainChars = mainText.split("");

  const numberText = "(01)";
  const numberChars = numberText.split("");

  // Calculate character reveal ranges
  const totalChars =
    taglineChars.length + numberChars.length + mainChars.length;

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen items-center justify-center flex bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-t-[2rem] sm:rounded-t-[3rem] lg:rounded-t-[4rem]"
    >
      {/* Subtle background elements */}
      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{
          opacity: useTransform(scrollYProgress, [0, 0.5, 1], [0.3, 1, 0.3]),
        }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-100/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-100/20 to-transparent rounded-full blur-3xl" />
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          ref={contentRef}
          className="grid lg:grid-cols-[210px_1fr] gap-12 lg:gap-24 items-center"
        >
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
              <div className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-gray-600">
                {taglineChars.map((char, i) => {
                  const charIndex = i;
                  const start = charIndex / totalChars;
                  const end = (charIndex + 1) / totalChars;

                  return (
                    <Char
                      key={`tag-${i}`}
                      progress={contentProgress}
                      range={[start, end]}
                      className=""
                    >
                      {char}
                    </Char>
                  );
                })}
              </div>

              <div className="text-xs sm:text-sm font-light text-gray-400">
                {numberChars.map((char, i) => {
                  const charIndex = taglineChars.length + i;
                  const start = charIndex / totalChars;
                  const end = (charIndex + 1) / totalChars;

                  return (
                    <Char
                      key={`num-${i}`}
                      progress={contentProgress}
                      range={[start, end]}
                      className=""
                    >
                      {char}
                    </Char>
                  );
                })}
              </div>
            </div>

            {/* Main Text */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl leading-tight font-light text-gray-900">
              {mainChars.map((char, i) => {
                const charIndex = taglineChars.length + numberChars.length + i;
                const start = charIndex / totalChars;
                const end = Math.min((charIndex + 1) / totalChars, 1);

                return (
                  <Char
                    key={`main-${i}`}
                    progress={contentProgress}
                    range={[start, end]}
                    className=""
                  >
                    {char}
                  </Char>
                );
              })}
            </h2>

            {/* CTA Button - appears after text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8, duration: 0.6 }}
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
