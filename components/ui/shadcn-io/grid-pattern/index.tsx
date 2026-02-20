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

/**
 * GridPattern component with optimized hover effects.
 *
 * Uses direct DOM manipulation for interactive squares instead of React state
 * to prevent parent component re-renders during mouse movement.
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
  const animateRef = useRef<(() => void) | null>(null);

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

  // Get computed primary color from CSS - converts to RGB for SVG compatibility
  const getPrimaryColor = useCallback(() => {
    // Return cached value if available
    if (primaryColorRef.current) return primaryColorRef.current;

    if (typeof window === "undefined") return "rgb(249, 115, 22)"; // fallback orange

    // Create a temporary element to compute the actual color value
    const tempEl = document.createElement("div");
    tempEl.style.color = "var(--primary)";
    tempEl.style.display = "none";
    document.body.appendChild(tempEl);

    const computedColor = getComputedStyle(tempEl).color;
    document.body.removeChild(tempEl);

    // Cache the result
    primaryColorRef.current = computedColor || "rgb(249, 115, 22)";
    return primaryColorRef.current;
  }, []);

  // Animation loop using RAF - uses direct DOM manipulation, NO React state updates
  const animate = useCallback(() => {
    if (disableInteraction || !interactiveGroupRef.current) {
      rafIdRef.current = requestAnimationFrame(() => animateRef.current?.());
      return;
    }

    const now = Date.now();
    const group = interactiveGroupRef.current;

    // Remove expired highlights
    highlightSquaresRef.current = highlightSquaresRef.current.filter(
      (square) => now - square.timestamp < 800,
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
      squaresToRender.push({
        x: cx,
        y: cy,
        opacity: 1,
        scale: 1,
        isCenter: true,
      });
      currentSurroundingRef.current.forEach((cell) => {
        squaresToRender.push({
          ...cell,
          opacity: 0.8,
          scale: 1,
          isCenter: false,
        });
      });
    }

    // Add trail highlights
    highlightSquaresRef.current.forEach((square) => {
      // Skip if already in active cells
      if (squaresToRender.some((s) => s.x === square.x && s.y === square.y))
        return;

      const age = Math.min(1, (now - square.timestamp) / 800);
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

    // Get primary color
    const primaryColor = getPrimaryColor();

    // Update DOM directly - clear and rebuild
    // This is more efficient than tracking individual elements for this use case
    while (group.firstChild) {
      group.removeChild(group.firstChild);
    }

    squaresToRender.forEach((square) => {
      const rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect",
      );
      rect.setAttribute("x", String(square.x * width + 0.5));
      rect.setAttribute("y", String(square.y * height + 0.5));
      rect.setAttribute("width", String(width - 1));
      rect.setAttribute("height", String(height - 1));
      rect.setAttribute("fill", "none");
      rect.setAttribute("stroke", primaryColor);
      rect.setAttribute("stroke-width", square.isCenter ? "2" : "1.5");
      rect.setAttribute("opacity", String(square.opacity));
      rect.style.transform = `scale(${square.scale})`;
      rect.style.transformOrigin = `${square.x * width + width / 2}px ${square.y * height + height / 2}px`;
      group.appendChild(rect);
    });

    rafIdRef.current = requestAnimationFrame(() => animateRef.current?.());
  }, [disableInteraction, width, height, getPrimaryColor]);

  useEffect(() => {
    animateRef.current = animate;
  });

  // Throttled mouse handler
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!svgRef.current || disableInteraction) return;

      // Check if mouse is over blocked area
      const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY);
      if (elementUnderMouse?.closest(".grid-interaction-blocked")) {
        currentCellRef.current = null;
        currentSurroundingRef.current = [];
        isMovingRef.current = false;
        if (mouseMoveTimeoutRef.current) {
          clearTimeout(mouseMoveTimeoutRef.current);
        }
        return;
      }

      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const gridX = Math.floor(mouseX / width);
      const gridY = Math.floor(mouseY / height);

      if (gridX >= 0 && gridY >= 0) {
        const isSameCell =
          currentCellRef.current &&
          currentCellRef.current.x === gridX &&
          currentCellRef.current.y === gridY;

        // Set moving state to true
        isMovingRef.current = true;

        // Clear existing timeout
        if (mouseMoveTimeoutRef.current) {
          clearTimeout(mouseMoveTimeoutRef.current);
        }

        // Set timeout to detect when mouse stops moving
        mouseMoveTimeoutRef.current = setTimeout(() => {
          isMovingRef.current = false;
          currentCellRef.current = null;
          currentSurroundingRef.current = [];
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
                (s) => now - s.timestamp < 800,
              ),
              ...fadeSquares,
            ];
          }

          // Generate new surrounding cells
          currentSurroundingRef.current = generateSurroundingCells(
            gridX,
            gridY,
          );
          currentCellRef.current = { x: gridX, y: gridY };
        }
      }
    },
    [width, height, generateSurroundingCells, disableInteraction],
  );

  // Mouse leave handler
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
  }, []);

  // Start animation loop
  useEffect(() => {
    if (disableInteraction) return;

    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (mouseMoveTimeoutRef.current) {
        clearTimeout(mouseMoveTimeoutRef.current);
      }
    };
  }, [animate, disableInteraction]);

  // Handle mouse events
  useEffect(() => {
    if (disableInteraction) return;

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    const svg = svgRef.current;
    if (svg) {
      svg.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (svg) {
        svg.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [handleMouseMove, handleMouseLeave, disableInteraction]);

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

      {/* Interactive hover squares - rendered via direct DOM manipulation */}
      {!disableInteraction && (
        <g ref={interactiveGroupRef} className="interactive-squares" />
      )}
    </svg>
  );
}
