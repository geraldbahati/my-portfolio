"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface GridPatternInteractiveProps {
  /**
   * Width of each grid cell
   * @default 40
   */
  width?: number;
  /**
   * Height of each grid cell
   * @default 40
   */
  height?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Maximum opacity of the hover effect
   * @default 0.3
   */
  maxOpacity?: number;
}

/**
 * Interactive Grid Pattern with Hover Effect
 *
 * This component adds a subtle hover highlight that follows the mouse.
 * Uses requestAnimationFrame for smooth 60fps animations.
 *
 * @example
 * ```tsx
 * <GridPatternInteractive className="opacity-20" />
 * ```
 */
export function GridPatternInteractive({
  width = 40,
  height = 40,
  className,
  maxOpacity = 0.3,
}: GridPatternInteractiveProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check if device supports hover
    if (window.matchMedia("(hover: none)").matches) return;

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;

      // Cancel previous frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Schedule update on next frame
      rafRef.current = requestAnimationFrame(() => {
        container.style.setProperty("--mouse-x", `${mouseX}px`);
        container.style.setProperty("--mouse-y", `${mouseY}px`);
      });
    };

    const handleMouseLeave = () => {
      container.style.setProperty("--mouse-x", "-1000px");
      container.style.setProperty("--mouse-y", "-1000px");
    };

    container.addEventListener("mousemove", handleMouseMove, { passive: true });
    container.addEventListener("mouseleave", handleMouseLeave, {
      passive: true,
    });

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "pointer-events-auto absolute inset-0",
        "before:pointer-events-none before:absolute before:inset-0",
        "before:bg-[length:var(--grid-size)] before:bg-[position:0_0]",
        "[--grid-size:40px_40px]",
        "[--mouse-x:-1000px]",
        "[--mouse-y:-1000px]",
        className,
      )}
      style={
        {
          "--grid-size": `${width}px ${height}px`,
          "--max-opacity": maxOpacity,
          backgroundImage: `
          linear-gradient(to right, rgb(255 255 255 / 0.1) 1px, transparent 1px),
          linear-gradient(to bottom, rgb(255 255 255 / 0.1) 1px, transparent 1px)
        `,
          backgroundSize: `${width}px ${height}px`,
        } as React.CSSProperties
      }
      aria-hidden="true"
    >
      <style jsx>{`
        div::before {
          content: "";
          background-image:
            linear-gradient(
              to right,
              rgb(255 255 255 / 0.3) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgb(255 255 255 / 0.3) 1px,
              transparent 1px
            );
          mask-image: radial-gradient(
            circle 200px at var(--mouse-x) var(--mouse-y),
            black 0%,
            transparent 70%
          );
          -webkit-mask-image: radial-gradient(
            circle 200px at var(--mouse-x) var(--mouse-y),
            black 0%,
            transparent 70%
          );
          opacity: var(--max-opacity, 0.3);
          transition: opacity 0.2s ease;
        }

        /* Disable on touch devices */
        @media (hover: none) {
          div::before {
            display: none;
          }
        }

        /* Performance: Disable on low-end devices */
        @media (prefers-reduced-motion: reduce) {
          div::before {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
