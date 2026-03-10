"use client";

import { memo, useMemo, useRef, useEffect, useCallback } from "react";
import {
  m,
  MotionValue,
  useTransform,
  useMotionValueEvent,
} from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Analytics from "@/lib/analytics";

const CutoutMaskImage = dynamic(
  () =>
    import("@/components/ui/cutout-image-mask").then((mod) => ({
      default: mod.CutoutMaskImage,
    })),
  { ssr: true },
);

interface CharacterData {
  char: string;
  charIndex: number;
  key: string;
}

interface WordData {
  word: string;
  chars: CharacterData[];
  wordIdx: number;
  isLast: boolean;
}

const StaticCharacter = memo(
  ({
    char,
    charKey,
    registerRef,
  }: {
    char: string;
    charKey: string;
    registerRef: (key: string, el: HTMLSpanElement | null) => void;
  }) => {
    if (char === " ") {
      return (
        <span className="inline-block" style={{ width: "0.25em" }}>
          {" "}
        </span>
      );
    }

    return (
      <span
        ref={(el) => registerRef(charKey, el)}
        className="inline-block"
        style={{ opacity: 0.2 }}
      >
        {char}
      </span>
    );
  },
  (prev, next) => prev.char === next.char && prev.charKey === next.charKey,
);

StaticCharacter.displayName = "StaticCharacter";

interface BioOverlayProps {
  scrollProgress: MotionValue<number>;
  cssScrollSupported?: boolean;
}

export default function BioOverlay({ scrollProgress, cssScrollSupported }: BioOverlayProps) {
  const charRefsMap = useRef<Map<string, HTMLSpanElement>>(new Map());

  // JS fallback transforms - only used when CSS scroll not supported
  const contentProgress = useTransform(scrollProgress, [0.4, 1], [0, 1]);
  const textProgress = useTransform(scrollProgress, [0.55, 1], [0, 1]);

  const imageScale = useTransform(contentProgress, [0, 1], [0.6, 1]);
  const imageOpacity = useTransform(contentProgress, [0, 0.2], [0, 1]);
  const imageY = useTransform(contentProgress, [0, 1], [100, 0]);
  const ctaOpacity = useTransform(textProgress, [0.7, 1], [0, 1]);
  const ctaY = useTransform(textProgress, [0.7, 1], [20, 0]);
  const bgOpacity = useTransform(scrollProgress, [0, 0.5, 1], [0.3, 1, 1]);

  const tagline = "Shipping Production Impact";
  const mainText =
    "Full-stack engineer building edge-first web applications. From multi-layer caching strategies to AI-powered recommendation engines, I architect systems that are fast, scalable, and impactful";
  const numberText = "(01)";

  const { taglineData, numberData, mainTextData, totalChars, charIndexMap } =
    useMemo(() => {
      const taglineChars = tagline.split("");
      const numberChars = numberText.split("");
      const mainChars = mainText.split("");
      const total = taglineChars.length + numberChars.length + mainChars.length;

      const charIndexMap = new Map<string, number>();

      // Compute word char offsets without mutable variables (React Compiler compatible)
      const taglineWords = tagline.split(" ");
      const taglineWordOffsets = taglineWords.map((_, i) =>
        taglineWords.slice(0, i).reduce((acc, w) => acc + w.length + 1, 0),
      );
      const taglineData: WordData[] = taglineWords.map((word, wordIdx) => {
        const wordOffset = taglineWordOffsets[wordIdx];
        const chars = word.split("").map((char, charIdx) => {
          const idx = wordOffset + charIdx;
          const key = `tag-${idx}`;
          charIndexMap.set(key, idx);
          return { char, charIndex: idx, key };
        });
        return {
          word,
          chars,
          wordIdx,
          isLast: wordIdx === taglineWords.length - 1,
        };
      });

      const numberOffset = taglineChars.length;
      const numberData: CharacterData[] = numberChars.map((char, i) => {
        const idx = numberOffset + i;
        const key = `num-${idx}`;
        charIndexMap.set(key, idx);
        return { char, charIndex: idx, key };
      });

      const mainTextWords = mainText.split(" ");
      const charOffset = taglineChars.length + numberChars.length;
      const mainWordOffsets = mainTextWords.map((_, i) =>
        mainTextWords.slice(0, i).reduce((acc, w) => acc + w.length + 1, 0),
      );
      const mainTextData: WordData[] = mainTextWords.map((word, wordIdx) => {
        const wordOffset = charOffset + mainWordOffsets[wordIdx];
        const chars = word.split("").map((char, charIdx) => {
          const idx = wordOffset + charIdx;
          const key = `main-${idx}`;
          charIndexMap.set(key, idx);
          return { char, charIndex: idx, key };
        });
        return {
          word,
          chars,
          wordIdx,
          isLast: wordIdx === mainTextWords.length - 1,
        };
      });

      return {
        taglineData,
        numberData,
        mainTextData,
        totalChars: total,
        charIndexMap,
      };
    }, []);

  const registerRef = useCallback((key: string, el: HTMLSpanElement | null) => {
    if (el) {
      charRefsMap.current.set(key, el);
    } else {
      charRefsMap.current.delete(key);
    }
  }, []);

  // Per-character text reveal - stays in JS (cannot be done in CSS)
  // Optimized with rAF batching to avoid layout thrashing
  useMotionValueEvent(textProgress, "change", (progress) => {
    requestAnimationFrame(() => {
      charRefsMap.current.forEach((el, key) => {
        const charIndex = charIndexMap.get(key);
        if (charIndex === undefined) return;

        const charStart = charIndex / totalChars;
        const charWidth = 3 / totalChars;
        const t = Math.min(1, Math.max(0, (progress - charStart) / charWidth));
        // Animate from 0.2 (dim) to 1 (fully visible)
        el.style.opacity = String(0.2 + 0.8 * t);
      });
    });
  });

  useEffect(() => {
    charRefsMap.current.forEach((el) => {
      el.style.opacity = "0.2";
    });
  }, []);

  // Shared image content
  const imageContent = (
    <CutoutMaskImage
      imageUrl="/original.jpeg"
      clickToChangeImage={false}
      maxWidth={282}
      className="w-full max-w-[282px]"
      alt="Profile portrait"
      priority={true}
      quality={75}
      sizes="(max-width: 640px) 282px, (max-width: 1024px) 400px, 500px"
    />
  );

  // Shared CTA button content
  const ctaContent = (
    <Link
      href="/projects"
      prefetch={true}
      onClick={() =>
        Analytics.trackButtonClick(
          "View Selected Work",
          "Bio Overlay CTA",
        )
      }
    >
      <m.button
        className="group inline-flex items-center gap-3 text-sm font-medium tracking-wider uppercase text-gray-900 transition-colors hover:text-gray-600"
        whileHover={{ x: 5 }}
        whileTap={{ scale: 0.98 }}
      >
        <span className="relative">
          View Selected Work
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
      </m.button>
    </Link>
  );

  return (
    <section
      className="relative h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-t-xl sm:rounded-t-[1rem] lg:rounded-t-[2rem] overflow-y-auto"
      style={{
        contain: "layout style paint",
      }}
    >
      {/* Subtle background elements */}
      {cssScrollSupported ? (
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none scroll-bio-bg"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-100/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-100/20 to-transparent rounded-full blur-3xl" />
        </div>
      ) : (
        <m.div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{
            opacity: bgOpacity,
          }}
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-100/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-100/20 to-transparent rounded-full blur-3xl" />
        </m.div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[210px_1fr] gap-12 lg:gap-24 short:gap-12 items-center">
          {/* Left: Animated Cutout Mask Image */}
          {cssScrollSupported ? (
            <div
              className="flex justify-center lg:justify-start scroll-bio-image"
            >
              {imageContent}
            </div>
          ) : (
            <m.div
              className="flex justify-center lg:justify-start"
              style={{
                scale: imageScale,
                opacity: imageOpacity,
                y: imageY,
                transform: "translateZ(0)",
              }}
            >
              {imageContent}
            </m.div>
          )}

          {/* Right: Synchronized Text Content */}
          <div className="space-y-8 short:space-y-4">
            {/* Tagline and Number */}
            <div className="flex justify-between items-start">
              <div className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase text-gray-600">
                {taglineData.map(({ chars, wordIdx, isLast }) => (
                  <span
                    key={`tag-word-${wordIdx}`}
                    className="inline-block whitespace-nowrap"
                  >
                    {chars.map(({ char, key }) => (
                      <StaticCharacter
                        key={key}
                        char={char}
                        charKey={key}
                        registerRef={registerRef}
                      />
                    ))}
                    {!isLast && (
                      <span
                        className="inline-block"
                        style={{ width: "0.25em" }}
                      >
                        {" "}
                      </span>
                    )}
                  </span>
                ))}
              </div>

              <div className="text-xs sm:text-sm font-light text-gray-400 whitespace-nowrap">
                {numberData.map(({ char, key }) => (
                  <StaticCharacter
                    key={key}
                    char={char}
                    charKey={key}
                    registerRef={registerRef}
                  />
                ))}
              </div>
            </div>

            {/* Main Text */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl short:text-3xl leading-tight font-light text-gray-900">
              {mainTextData.map(({ chars, wordIdx, isLast }) => (
                <span
                  key={`main-word-${wordIdx}`}
                  className="inline-block whitespace-nowrap"
                >
                  {chars.map(({ char, key }) => (
                    <StaticCharacter
                      key={key}
                      char={char}
                      charKey={key}
                      registerRef={registerRef}
                    />
                  ))}
                  {!isLast && (
                    <span className="inline-block" style={{ width: "0.25em" }}>
                      {" "}
                    </span>
                  )}
                </span>
              ))}
            </h2>

            {/* CTA Button - appears after text */}
            {cssScrollSupported ? (
              <div className="scroll-bio-cta">
                {ctaContent}
              </div>
            ) : (
              <m.div
                style={{
                  opacity: ctaOpacity,
                  y: ctaY,
                  transform: "translateZ(0)",
                }}
              >
                {ctaContent}
              </m.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
