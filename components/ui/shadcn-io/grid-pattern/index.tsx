"use client";

import React, {
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useState,
  useId,
} from "react";
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
  const highlightSquaresRef = useRef<HighlightSquare[]>([]);
  const currentCellRef = useRef<{ x: number; y: number } | null>(null);
  const currentSurroundingRef = useRef<Array<{ x: number; y: number }>>([]);
  const isMovingRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const mouseMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [interactiveSquares, setInteractiveSquares] = useState<
    Array<{ x: number; y: number; opacity: number; scale: number; isCenter: boolean }>
  >([]);

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
    [surroundingCells, surroundingRadius]
  );

  // Animation loop using RAF - updates interactive squares state
  const animate = useCallback(() => {
    if (disableInteraction) {
      rafIdRef.current = requestAnimationFrame(animate);
      return;
    }

    const now = Date.now();
    const highlights = highlightSquaresRef.current;

    // Remove expired highlights
    highlightSquaresRef.current = highlights.filter(
      (square) => now - square.timestamp < 800
    );

    // Get current cell and surrounding cells
    let currentActiveCells: Array<{ x: number; y: number; opacity: number; scale: number; isCenter: boolean }> = [];

    // Add current active cell ONLY when mouse is moving (not stationary)
    if (currentCellRef.current && isMovingRef.current) {
      const { x: cx, y: cy } = currentCellRef.current;
      currentActiveCells = [
        { x: cx, y: cy, opacity: 1, scale: 1, isCenter: true },
        ...currentSurroundingRef.current.map(cell => ({
          ...cell,
          opacity: 0.8,
          scale: 1,
          isCenter: false
        }))
      ];
    }

    // Add animated trail highlights (skip if matches current active cells)
    const trailSquares = highlightSquaresRef.current
      .filter(square => {
        return !currentActiveCells.some(
          cell => cell.x === square.x && cell.y === square.y
        );
      })
      .map(square => {
        const age = Math.min(1, (now - square.timestamp) / 800);
        const opacity = Math.max(0, (square.isCenter ? 0.7 : 0.5) * (1 - age));
        const scale = 1 + age * 0.2;
        return {
          x: square.x,
          y: square.y,
          opacity,
          scale,
          isCenter: square.isCenter
        };
      })
      .filter(square => square.opacity > 0);

    // Update state with combined squares
    setInteractiveSquares([...currentActiveCells, ...trailSquares]);

    rafIdRef.current = requestAnimationFrame(animate);
  }, [disableInteraction]);

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

        // Set moving state to true (will be set to false after timeout)
        isMovingRef.current = true;

        // Clear existing timeout
        if (mouseMoveTimeoutRef.current) {
          clearTimeout(mouseMoveTimeoutRef.current);
        }

        // Set timeout to detect when mouse stops moving (100ms without cell change)
        mouseMoveTimeoutRef.current = setTimeout(() => {
          isMovingRef.current = false;
          // Also clear current cell so no highlight shows when stationary
          currentCellRef.current = null;
          currentSurroundingRef.current = [];
        }, 100);

        if (!isSameCell) {
          // Add old cell to trail ONLY when actually moving between cells
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

            // Use cached surrounding cells for the trail
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

            // Keep only recent highlights
            const now = Date.now();
            highlightSquaresRef.current = [
              ...highlightSquaresRef.current.filter(
                (s) => now - s.timestamp < 800
              ),
              ...fadeSquares,
            ];
          }

          // Generate new surrounding cells ONLY when entering a new cell
          currentSurroundingRef.current = generateSurroundingCells(gridX, gridY);
          currentCellRef.current = { x: gridX, y: gridY };
        }
      }
    },
    [width, height, generateSurroundingCells, disableInteraction]
  );

  // Mouse leave handler
  const handleMouseLeave = useCallback(() => {
    // Clear timeout
    if (mouseMoveTimeoutRef.current) {
      clearTimeout(mouseMoveTimeoutRef.current);
    }

    // Only add to trail if we were actually moving when leaving
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

      // Use cached surrounding cells (no need to regenerate)
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
        className
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

      {/* Interactive hover squares */}
      {!disableInteraction && interactiveSquares.length > 0 && (
        <g className="interactive-squares">
          {interactiveSquares.map((square, index) => (
            <rect
              key={`${square.x}-${square.y}-${index}`}
              x={square.x * width + 0.5}
              y={square.y * height + 0.5}
              width={width - 1}
              height={height - 1}
              fill="none"
              className="stroke-primary"
              strokeWidth={square.isCenter ? 2 : 1.5}
              opacity={square.opacity}
              style={{
                transform: `scale(${square.scale})`,
                transformOrigin: `${square.x * width + width / 2}px ${square.y * height + height / 2}px`,
              }}
            />
          ))}
        </g>
      )}
    </svg>
  );
}
