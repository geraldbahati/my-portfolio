"use client";
import { type JSX, useEffect, useState } from "react";
import { motion, MotionProps } from "motion/react";

export type TextScrambleProps = {
  children: string;
  duration?: number;
  speed?: number;
  characterSet?: string;
  as?: React.ElementType;
  className?: string;
  trigger?: boolean;
  onScrambleComplete?: () => void;
} & MotionProps;

const defaultChars =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function TextScramble({
  children,
  duration = 0.8,
  speed = 0.04,
  characterSet = defaultChars,
  className,
  as: Component = "p",
  trigger = true,
  onScrambleComplete,
  ...props
}: TextScrambleProps) {
  const MotionComponent = motion.create(
    Component as keyof JSX.IntrinsicElements,
  );
  const [displayText, setDisplayText] = useState(children);
  const [isAnimating, setIsAnimating] = useState(false);
  const [intervalRef, setIntervalRef] = useState<NodeJS.Timeout | null>(null);
  const text = children;

  useEffect(() => {
    const scramble = async () => {
      if (isAnimating) return;
      setIsAnimating(true);

      const steps = duration / speed;
      let step = 0;

      const interval = setInterval(() => {
        let scrambled = "";
        const progress = step / steps;

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
        step++;

        if (step > steps) {
          clearInterval(interval);
          setDisplayText(text);
          setIsAnimating(false);
          setIntervalRef(null);
          onScrambleComplete?.();
        }
      }, speed * 1000);

      setIntervalRef(interval);
    };

    const stopScramble = () => {
      if (intervalRef) {
        clearInterval(intervalRef);
        setIntervalRef(null);
      }
      setDisplayText(text);
      setIsAnimating(false);
      onScrambleComplete?.();
    };

    if (trigger) {
      scramble();
    } else {
      stopScramble();
    }

    return () => {
      if (intervalRef) {
        clearInterval(intervalRef);
      }
    };
  }, [
    trigger,
    duration,
    speed,
    characterSet,
    text,
    isAnimating,
    intervalRef,
    onScrambleComplete,
  ]);

  return (
    <MotionComponent
      className={className}
      style={{ pointerEvents: "none" }}
      {...props}
    >
      {displayText}
    </MotionComponent>
  );
}
