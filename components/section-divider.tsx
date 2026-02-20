"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import { m, useInView } from "motion/react";
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
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: 0.5 });
  const [animationDone, setAnimationDone] = useState(false);

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
        <m.div
          animate={{
            filter: `blur(${blurAmount}px)`,
          }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
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
        </m.div>

        <m.div
          animate={{
            filter: `blur(${blurAmount}px)`,
          }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
        >
          <TextScramble
            duration={duration}
            trigger={shouldTriggerScramble}
            className="text-sm font-medium"
          >
            {counter}
          </TextScramble>
        </m.div>
      </div>

      {/* Animated Divider */}
      <div className="relative h-[1px] w-full overflow-hidden">
        <m.div
          className={`absolute inset-y-0 left-0 ${dividerColor}`}
          initial={{ width: "0%" }}
          animate={{ width: isInView ? "100%" : "0%" }}
          transition={{
            duration,
            ease: "easeOut",
          }}
        />
      </div>
    </div>
  );
});

SectionDivider.displayName = "SectionDivider";
