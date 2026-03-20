"use client";
import { useEffect, useEffectEvent, useRef, useState, type ElementType, type HTMLAttributes } from "react";
import { motion } from "motion/react";

export type TextScrambleProps = {
  children: string;
  duration?: number;
  speed?: number;
  characterSet?: string;
  as?: ElementType;
  className?: string;
  trigger?: boolean;
  onScrambleComplete?: () => void;
} & HTMLAttributes<HTMLElement>;

const defaultChars =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const motionComponentMap = {
  div: motion.div,
  p: motion.p,
  span: motion.span,
} as const;

export function TextScramble({
  children,
  duration = 0.8,
  speed = 0.04,
  characterSet = defaultChars,
  className,
  as: Component = "p",
  trigger = true,
  onScrambleComplete,
  style,
  ...props
}: TextScrambleProps) {
  const [displayText, setDisplayText] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const text = children;
  const intervalMs = Math.max(speed * 1000, 16);
  const stepCount = Math.max(Math.ceil(duration / speed), 1);

  const handleScrambleComplete = useEffectEvent(() => {
    onScrambleComplete?.();
  });

  useEffect(() => {
    const clearActiveInterval = () => {
      if (!intervalRef.current) return;
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };

    clearActiveInterval();

    if (!trigger) {
      handleScrambleComplete();
      return clearActiveInterval;
    }

    const startedAt = performance.now();
    intervalRef.current = setInterval(() => {
      const elapsed = performance.now() - startedAt;
      const currentStep = Math.min(
        stepCount + 1,
        Math.floor(elapsed / intervalMs),
      );
      const progress = currentStep / stepCount;

      let scrambled = "";
      for (let i = 0; i < text.length; i++) {
        if (text[i] === " ") {
          scrambled += " ";
          continue;
        }

        if (progress * text.length > i) {
          scrambled += text[i];
        } else {
          scrambled +=
            characterSet[Math.floor(Math.random() * characterSet.length)];
        }
      }

      setDisplayText(scrambled);

      if (currentStep > stepCount) {
        clearActiveInterval();
        setDisplayText(text);
        handleScrambleComplete();
      }
    }, intervalMs);

    return clearActiveInterval;
  }, [
    trigger,
    duration,
    speed,
    characterSet,
    text,
    intervalMs,
    stepCount,
  ]);

  const ComponentTag = Component as ElementType;
  const MotionComponent =
    typeof Component === "string" && Component in motionComponentMap
      ? motionComponentMap[Component as keyof typeof motionComponentMap]
      : null;

  if (MotionComponent) {
    return (
      <MotionComponent
        className={className}
        style={{ pointerEvents: "none", ...style }}
        {...props}
      >
        {trigger ? displayText ?? text : text}
      </MotionComponent>
    );
  }

  return (
    <ComponentTag
      className={className}
      style={{ pointerEvents: "none", ...style }}
      {...props}
    >
      {trigger ? displayText ?? text : text}
    </ComponentTag>
  );
}
