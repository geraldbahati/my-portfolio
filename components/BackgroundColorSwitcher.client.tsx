"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, useAnimation, type Easing } from "framer-motion";
import { usePrefersReducedMotion } from "@/utils/usePrefersReducedMotion";

export interface BackgroundTarget {
  /** Unique identifier for the section (should match data-section-id attribute) */
  id: string;
  /** Background color to apply when this section is in view */
  color: string;
  /** Text color to apply when this section is in view (optional) */
  textColor?: string;
  /** Threshold for intersection observer (0-1, default: 0.5) */
  threshold?: number;
}

export interface BackgroundColorSwitcherProps {
  /** Array of section targets with their corresponding background colors */
  targets: BackgroundTarget[];
  /** Default background color (fallback) */
  defaultColor?: string;
  /** Animation duration in seconds */
  animationDuration?: number;
  /** Animation easing */
  animationEasing?: string;
  /** Whether to update CSS custom properties for theme switching */
  updateCSSVariables?: boolean;
}

/**
 * BackgroundColorSwitcher - A client component that smoothly transitions
 * the page background color based on which sections are in view.
 *
 * Features:
 * - Uses IntersectionObserver for efficient section visibility detection
 * - Respects prefers-reduced-motion accessibility setting
 * - Supports configurable thresholds and animation settings
 * - Updates CSS custom properties for theme coordination
 * - Server-side rendering safe
 */
export default function BackgroundColorSwitcher({
  targets,
  defaultColor = "#ffffff",
  animationDuration = 0.6,
  animationEasing = "easeInOut",
  updateCSSVariables = true,
}: BackgroundColorSwitcherProps) {
  const controls = useAnimation();
  const [activeColor, setActiveColor] = useState(defaultColor);
  const [activeTextColor, setActiveTextColor] = useState("");
  const prefersReducedMotion = usePrefersReducedMotion();

  // Track which sections are currently visible
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  // Memoized intersection handler with improved logic
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      let hasChanges = false;
      const newVisibleSections = new Set(visibleSections);

      entries.forEach((entry) => {
        const sectionId = entry.target.getAttribute("data-section-id");
        if (!sectionId) return;

        const target = targets.find((t) => t.id === sectionId);
        if (!target) return;

        const threshold = target.threshold ?? 0.5;
        const isVisible = entry.intersectionRatio >= threshold;

        // Update visible sections tracking
        if (isVisible && !newVisibleSections.has(sectionId)) {
          newVisibleSections.add(sectionId);
          hasChanges = true;
        } else if (!isVisible && newVisibleSections.has(sectionId)) {
          newVisibleSections.delete(sectionId);
          hasChanges = true;
        }
      });

      if (hasChanges) {
        setVisibleSections(newVisibleSections);

        // Determine which color should be active based on priority
        let activeTarget: BackgroundTarget | null = null;

        // Priority order: Later targets in array take precedence (FAQ over Projects)
        // Create reversed copy without modifying original array
        const reversedTargets = [...targets].reverse();
        for (const target of reversedTargets) {
          if (newVisibleSections.has(target.id)) {
            activeTarget = target;
            break;
          }
        }

        // Apply the determined color (or fallback to default)
        const targetColor = activeTarget ? activeTarget.color : defaultColor;
        const targetTextColor = activeTarget ? (activeTarget.textColor || "") : "";

        setActiveColor(targetColor);
        setActiveTextColor(targetTextColor);

        // Animate background color
        if (prefersReducedMotion) {
          controls.set({ backgroundColor: targetColor });
        } else {
          controls.start(
            { backgroundColor: targetColor },
            {
              duration: animationDuration,
              ease: animationEasing as Easing,
            }
          );
        }
      }
    },
    [targets, controls, prefersReducedMotion, animationDuration, animationEasing, visibleSections, defaultColor]
  );

  // Setup intersection observers
  useEffect(() => {
    if (typeof window === "undefined") return;

    const observers: IntersectionObserver[] = [];

    targets.forEach((target) => {
      const element = document.querySelector(`[data-section-id="${target.id}"]`);
      if (!element) {
        console.warn(`BackgroundColorSwitcher: Section with id "${target.id}" not found`);
        return;
      }

      // Use multiple thresholds for better detection during fast/slow scrolling
      const thresholds = [
        0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0
      ];

      const observer = new IntersectionObserver(
        handleIntersection,
        {
          threshold: thresholds,
          rootMargin: "-10px 0px -10px 0px", // Small margin for better detection
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    // Cleanup function
    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [targets, handleIntersection]);

  // Update CSS custom properties for theme coordination
  useEffect(() => {
    if (!updateCSSVariables || typeof document === "undefined") return;

    const root = document.documentElement;
    root.style.setProperty("--page-bg-color", activeColor);

    if (activeTextColor) {
      root.style.setProperty("--page-text-color", activeTextColor);
    }

    // Determine if background is dark for automatic text color
    const isDark = isColorDark(activeColor);
    root.style.setProperty("--page-text-auto", isDark ? "#ffffff" : "#000000");
    root.setAttribute("data-theme", isDark ? "dark" : "light");
  }, [activeColor, activeTextColor, updateCSSVariables]);

  return (
    <motion.div
      aria-hidden="true"
      role="presentation"
      initial={{ backgroundColor: defaultColor }}
      animate={controls}
      className="fixed inset-0 -z-50 pointer-events-none"
      style={{
        willChange: "backgroundColor",
      }}
    />
  );
}

/**
 * Utility function to determine if a color is dark
 * Uses relative luminance calculation for accurate results
 */
function isColorDark(color: string): boolean {
  // Handle hex colors
  if (color.startsWith("#")) {
    const hex = color.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  }

  // Handle rgb/rgba colors
  if (color.startsWith("rgb")) {
    const matches = color.match(/\d+/g);
    if (matches && matches.length >= 3) {
      const r = parseInt(matches[0]);
      const g = parseInt(matches[1]);
      const b = parseInt(matches[2]);

      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      return luminance < 0.5;
    }
  }

  // Handle named colors (basic implementation)
  const darkColors = ["black", "dark", "navy", "maroon"];
  return darkColors.some(dark => color.toLowerCase().includes(dark));
}