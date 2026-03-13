"use client";

import React, { useEffect, useRef, useCallback, useMemo, useId } from "react";
import { cn } from "@/lib/utils";

interface HighlightSquare {
  x: number;
  y: number;
  timestamp: number;
  isCenter: boolean;
  opacity: number;
  scale: number;
}

interface GridPatternProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  squares?: Array<[number, number]>;
  strokeDasharray?: string;
  className?: string;
  gridClassName?: string;
  surroundingCells?: number;
  surroundingRadius?: number;
  style?: React.CSSProperties;
  disableInteraction?: boolean;
  [key: string]: unknown;
}

const SVG_NS = "http://www.w3.org/2000/svg";
const TRAIL_DURATION = 800;

/**
 * GridPattern component with optimized hover effects.
 *
 * Performance improvements over original:
 * - RAF loop only runs when there's something to animate (demand-driven)
 * - SVG rect pool: reuses elements instead of destroy/recreate every frame
 * - Avoids document.elementFromPoint() (layout thrash) — uses CSS pointer-events instead
 */
export default function GridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = "0",
  squares,
  className,
  gridClassName = "stroke-gray-400/30",
  surroundingCells = 6,
  surroundingRadius = 2,
  style,
  disableInteraction = false,
  ...props
}: GridPatternProps) {
  const id = useId();
  const svgRef = useRef<SVGSVGElement>(null);
  const interactiveGroupRef = useRef<SVGGElement>(null);
  const highlightSquaresRef = useRef<HighlightSquare[]>([]);
  const currentCellRef = useRef<{ x: number; y: number } | null>(null);
  const currentSurroundingRef = useRef<Array<{ x: number; y: number }>>([]);
  const isMovingRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const mouseMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // SVG rect element pool — avoids createElement/removeChild churn
  const rectPoolRef = useRef<SVGRectElement[]>([]);
  const activeRectCountRef = useRef(0);

  // Memoize static squares
  const staticSquares = useMemo(() => squares || [], [squares]);

  // Generate surrounding cells - memoized
  const generateSurroundingCells = useCallback(
    (centerX: number, centerY: number): Array<{ x: number; y: number }> => {
      const cells: Array<{ x: number; y: number }> = [];
      const usedPositions = new Set<string>();
      usedPositions.add(`${centerX}-${centerY}`);

      let attempts = 0;
      while (
        cells.length < surroundingCells &&
        attempts < surroundingCells * 3
      ) {
        const offsetX =
          Math.floor(Math.random() * (surroundingRadius * 2 + 1)) -
          surroundingRadius;
        const offsetY =
          Math.floor(Math.random() * (surroundingRadius * 2 + 1)) -
          surroundingRadius;

        if (offsetX === 0 && offsetY === 0) {
          attempts++;
          continue;
        }

        const newX = centerX + offsetX;
        const newY = centerY + offsetY;
        const key = `${newX}-${newY}`;

        if (!usedPositions.has(key)) {
          cells.push({ x: newX, y: newY });
          usedPositions.add(key);
        }

        attempts++;
      }

      return cells;
    },
    [surroundingCells, surroundingRadius],
  );

  // Cache the primary color to avoid repeated DOM queries
  const primaryColorRef = useRef<string | null>(null);

  const getPrimaryColor = useCallback(() => {
    if (primaryColorRef.current) return primaryColorRef.current;
    if (typeof window === "undefined") return "rgb(249, 115, 22)";

    const tempEl = document.createElement("div");
    tempEl.style.color = "var(--primary)";
    tempEl.style.display = "none";
    document.body.appendChild(tempEl);
    const computedColor = getComputedStyle(tempEl).color;
    document.body.removeChild(tempEl);

    primaryColorRef.current = computedColor || "rgb(249, 115, 22)";
    return primaryColorRef.current;
  }, []);

  // =========================================================================
  // Rect pool helpers — grow pool on demand, hide unused rects
  // =========================================================================
  const getPooledRect = useCallback(
    (index: number): SVGRectElement => {
      const pool = rectPoolRef.current;
      const group = interactiveGroupRef.current!;

      if (index < pool.length) {
        const rect = pool[index];
        // Unhide if it was hidden
        rect.removeAttribute("display");
        return rect;
      }

      // Grow pool
      const rect = document.createElementNS(SVG_NS, "rect");
      rect.setAttribute("fill", "none");
      group.appendChild(rect);
      pool.push(rect);
      return rect;
    },
    [],
  );

  const hideUnusedRects = useCallback((usedCount: number) => {
    const pool = rectPoolRef.current;
    for (let i = usedCount; i < pool.length; i++) {
      pool[i].setAttribute("display", "none");
    }
  }, []);

  // =========================================================================
  // Demand-driven animation — only runs when there's work to do
  // =========================================================================
  const isAnimatingRef = useRef(false);

  // Animation tick ref — called via ref to avoid stale closures
  const animationTickRef = useRef<(() => void) | null>(null);

  const scheduleAnimation = useCallback(() => {
    if (isAnimatingRef.current || disableInteraction) return;
    isAnimatingRef.current = true;
    rafIdRef.current = requestAnimationFrame(() => animationTickRef.current?.());
  }, [disableInteraction]);

  // Keep tick in sync on every render (no deps needed — always fresh)
  animationTickRef.current = () => {
    if (disableInteraction || !interactiveGroupRef.current) {
      isAnimatingRef.current = false;
      return;
    }

    const now = Date.now();

    // Remove expired highlights
    highlightSquaresRef.current = highlightSquaresRef.current.filter(
      (sq) => now - sq.timestamp < TRAIL_DURATION,
    );

    // Build array of squares to render
    type RenderSquare = {
      x: number;
      y: number;
      opacity: number;
      scale: number;
      isCenter: boolean;
    };
    const squaresToRender: RenderSquare[] = [];

    // Add current active cells if moving
    if (currentCellRef.current && isMovingRef.current) {
      const { x: cx, y: cy } = currentCellRef.current;
      squaresToRender.push({ x: cx, y: cy, opacity: 1, scale: 1, isCenter: true });
      currentSurroundingRef.current.forEach((cell) => {
        squaresToRender.push({ ...cell, opacity: 0.8, scale: 1, isCenter: false });
      });
    }

    // Add trail highlights
    highlightSquaresRef.current.forEach((square) => {
      if (squaresToRender.some((s) => s.x === square.x && s.y === square.y)) return;

      const age = Math.min(1, (now - square.timestamp) / TRAIL_DURATION);
      const opacity = Math.max(0, (square.isCenter ? 0.7 : 0.5) * (1 - age));
      if (opacity > 0) {
        squaresToRender.push({
          x: square.x,
          y: square.y,
          opacity,
          scale: 1 + age * 0.2,
          isCenter: square.isCenter,
        });
      }
    });

    const primaryColor = getPrimaryColor();

    // Update pooled rects (no create/destroy churn)
    squaresToRender.forEach((square, i) => {
      const rect = getPooledRect(i);
      rect.setAttribute("x", String(square.x * width + 0.5));
      rect.setAttribute("y", String(square.y * height + 0.5));
      rect.setAttribute("width", String(width - 1));
      rect.setAttribute("height", String(height - 1));
      rect.setAttribute("stroke", primaryColor);
      rect.setAttribute("stroke-width", square.isCenter ? "2" : "1.5");
      rect.setAttribute("opacity", String(square.opacity));
      rect.style.transform = `scale(${square.scale})`;
      rect.style.transformOrigin = `${square.x * width + width / 2}px ${square.y * height + height / 2}px`;
    });
    hideUnusedRects(squaresToRender.length);
    activeRectCountRef.current = squaresToRender.length;

    // Decide whether to keep the loop running
    const hasWork =
      squaresToRender.length > 0 || highlightSquaresRef.current.length > 0;

    if (hasWork) {
      rafIdRef.current = requestAnimationFrame(() => animationTickRef.current?.());
    } else {
      isAnimatingRef.current = false;
    }
  };

  // =========================================================================
  // Mouse handlers
  // =========================================================================
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!svgRef.current || disableInteraction) return;

      // Check if mouse is over a blocked area (uses event target — no layout thrash)
      const target = e.target as Element | null;
      if (target?.closest?.(".grid-interaction-blocked")) {
        if (currentCellRef.current) {
          currentCellRef.current = null;
          currentSurroundingRef.current = [];
          isMovingRef.current = false;
          if (mouseMoveTimeoutRef.current) clearTimeout(mouseMoveTimeoutRef.current);
          scheduleAnimation();
        }
        return;
      }

      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Out of bounds check
      if (mouseX < 0 || mouseY < 0 || mouseX > rect.width || mouseY > rect.height) return;

      const gridX = Math.floor(mouseX / width);
      const gridY = Math.floor(mouseY / height);

      if (gridX >= 0 && gridY >= 0) {
        const isSameCell =
          currentCellRef.current &&
          currentCellRef.current.x === gridX &&
          currentCellRef.current.y === gridY;

        isMovingRef.current = true;

        if (mouseMoveTimeoutRef.current) {
          clearTimeout(mouseMoveTimeoutRef.current);
        }

        mouseMoveTimeoutRef.current = setTimeout(() => {
          isMovingRef.current = false;
          currentCellRef.current = null;
          currentSurroundingRef.current = [];
          // One last tick to clear visuals
          scheduleAnimation();
        }, 100);

        if (!isSameCell) {
          // Add old cell to trail
          if (currentCellRef.current) {
            const timestamp = Date.now();
            const fadeSquares: HighlightSquare[] = [
              {
                x: currentCellRef.current.x,
                y: currentCellRef.current.y,
                timestamp,
                isCenter: true,
                opacity: 0.8,
                scale: 0.8,
              },
            ];

            currentSurroundingRef.current.forEach((pos) => {
              fadeSquares.push({
                x: pos.x,
                y: pos.y,
                timestamp,
                isCenter: false,
                opacity: 0.6,
                scale: 0.8,
              });
            });

            const now = Date.now();
            highlightSquaresRef.current = [
              ...highlightSquaresRef.current.filter(
                (s) => now - s.timestamp < TRAIL_DURATION,
              ),
              ...fadeSquares,
            ];
          }

          currentSurroundingRef.current = generateSurroundingCells(gridX, gridY);
          currentCellRef.current = { x: gridX, y: gridY };
        }

        scheduleAnimation();
      }
    },
    [width, height, generateSurroundingCells, disableInteraction, scheduleAnimation],
  );

  const handleMouseLeave = useCallback(() => {
    if (mouseMoveTimeoutRef.current) {
      clearTimeout(mouseMoveTimeoutRef.current);
    }

    if (currentCellRef.current && isMovingRef.current) {
      const timestamp = Date.now();
      const fadeSquares: HighlightSquare[] = [
        {
          x: currentCellRef.current.x,
          y: currentCellRef.current.y,
          timestamp,
          isCenter: true,
          opacity: 0.8,
          scale: 0.8,
        },
      ];

      currentSurroundingRef.current.forEach((pos) => {
        fadeSquares.push({
          x: pos.x,
          y: pos.y,
          timestamp,
          isCenter: false,
          opacity: 0.6,
          scale: 0.8,
        });
      });

      highlightSquaresRef.current = [
        ...highlightSquaresRef.current,
        ...fadeSquares,
      ];
    }

    currentCellRef.current = null;
    currentSurroundingRef.current = [];
    isMovingRef.current = false;

    // Keep animating to fade out trails
    scheduleAnimation();
  }, [scheduleAnimation]);

  // Handle mouse events — only attach when SVG is in viewport
  useEffect(() => {
    if (disableInteraction) return;

    const svg = svgRef.current;
    if (!svg) return;

    let mouseMoveAttached = false;

    const attachListeners = () => {
      if (mouseMoveAttached) return;
      mouseMoveAttached = true;
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      svg.addEventListener("mouseleave", handleMouseLeave);
    };

    const detachListeners = () => {
      if (!mouseMoveAttached) return;
      mouseMoveAttached = false;
      window.removeEventListener("mousemove", handleMouseMove);
      svg.removeEventListener("mouseleave", handleMouseLeave);
      // Clear active state when leaving viewport
      currentCellRef.current = null;
      currentSurroundingRef.current = [];
      isMovingRef.current = false;
      if (mouseMoveTimeoutRef.current) clearTimeout(mouseMoveTimeoutRef.current);
      scheduleAnimation(); // one last tick to clear visuals
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          attachListeners();
        } else {
          detachListeners();
        }
      },
      { threshold: 0 },
    );

    observer.observe(svg);

    return () => {
      observer.disconnect();
      detachListeners();
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      isAnimatingRef.current = false;
    };
  }, [handleMouseMove, handleMouseLeave, disableInteraction, scheduleAnimation]);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full",
        gridClassName,
        className,
      )}
      style={style}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />

      {/* Static squares */}
      {staticSquares.length > 0 && (
        <svg x={x} y={y} className="overflow-visible">
          {staticSquares.map(([sx, sy]) => (
            <rect
              strokeWidth="0"
              key={`${sx}-${sy}`}
              width={width - 1}
              height={height - 1}
              x={sx * width + 1}
              y={sy * height + 1}
              className="fill-current"
            />
          ))}
        </svg>
      )}

      {/* Interactive hover squares - rendered via pooled DOM manipulation */}
      {!disableInteraction && (
        <g ref={interactiveGroupRef} className="interactive-squares" />
      )}
    </svg>
  );
}
