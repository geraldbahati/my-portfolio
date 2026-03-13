"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import { TextScramble } from "@/components/ui/text-scramble";

export type SectionDividerProps = {
  label: string;
  counter: string;
  duration?: number;
  className?: string;
  onAnimationComplete?: () => void;
  once?: boolean;
  dividerColor?: string;
};

/**
 * SectionDivider - Optimized with React.memo to prevent unnecessary re-renders.
 *
 * Animation flow:
 * 1. When in view: line animates from 0% to 100% width
 * 2. During line animation: text is blurred and scrambling
 * 3. When line finishes: text stops scrambling and blur clears gracefully
 */
export const SectionDivider = memo(function SectionDivider({
  label,
  counter,
  duration = 2,
  className = "",
  onAnimationComplete,
  once = true,
  dividerColor = "bg-foreground",
}: SectionDividerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);

  // IntersectionObserver replaces motion/react useInView
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) observer.unobserve(el);
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  const isAnimating = isInView && !animationDone;
  const shouldTriggerScramble = isAnimating;
  const blurAmount = isAnimating ? 4 : 0;

  useEffect(() => {
    if (!isInView || animationDone) return;
    const timer = setTimeout(() => {
      setAnimationDone(true);
    }, duration * 1000);
    return () => clearTimeout(timer);
  }, [isInView, animationDone, duration]);

  const handleScrambleComplete = useCallback(() => {
    setAnimationDone(true);
    onAnimationComplete?.();
  }, [onAnimationComplete]);

  return (
    <div ref={ref} className={`w-full ${className}`}>
      {/* Text Container */}
      <div className="flex items-center justify-between mb-4">
        <div
          style={{
            filter: `blur(${blurAmount}px)`,
            transition: "filter 0.5s ease-out",
          }}
        >
          <TextScramble
            duration={duration}
            trigger={shouldTriggerScramble}
            className="text-sm font-medium tracking-wider"
            onScrambleComplete={handleScrambleComplete}
          >
            {label}
          </TextScramble>
        </div>

        <div
          style={{
            filter: `blur(${blurAmount}px)`,
            transition: "filter 0.5s ease-out",
          }}
        >
          <TextScramble
            duration={duration}
            trigger={shouldTriggerScramble}
            className="text-sm font-medium"
          >
            {counter}
          </TextScramble>
        </div>
      </div>

      {/* Animated Divider */}
      <div className="relative h-[1px] w-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 ${dividerColor}`}
          style={{
            width: isInView ? "100%" : "0%",
            transition: `width ${duration}s ease-out`,
          }}
        />
      </div>
    </div>
  );
});

SectionDivider.displayName = "SectionDivider";
