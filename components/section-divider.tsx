"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import { motion, useInView } from "motion/react";
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
  const [hasTriggered, setHasTriggered] = useState(false);
  const [shouldTriggerScramble, setShouldTriggerScramble] = useState(false);
  const [blurAmount, setBlurAmount] = useState(4);

  // Trigger animation once when entering viewport
  useEffect(() => {
    if (isInView && !hasTriggered) {
      setHasTriggered(true);
      setShouldTriggerScramble(true);
      setBlurAmount(4);

      // Auto-stop scramble after duration (when line animation completes)
      const timer = setTimeout(() => {
        setShouldTriggerScramble(false);
        setBlurAmount(0);
      }, duration * 1000);

      return () => clearTimeout(timer);
    }
  }, [isInView, hasTriggered, duration]);

  const handleScrambleComplete = useCallback(() => {
    setShouldTriggerScramble(false);
    setBlurAmount(0);
    onAnimationComplete?.();
  }, [onAnimationComplete]);

  return (
    <div ref={ref} className={`w-full ${className}`}>
      {/* Text Container */}
      <div className="flex items-center justify-between mb-4">
        <motion.div
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
        </motion.div>

        <motion.div
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
        </motion.div>
      </div>

      {/* Animated Divider */}
      <div className="relative h-[1px] w-full overflow-hidden">
        <motion.div
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
