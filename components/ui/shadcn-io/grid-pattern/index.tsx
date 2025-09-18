"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface HighlightSquare {
  x: number;
  y: number;
  id: string;
  timestamp: number;
  isCenter?: boolean; // Track if this is the center cell
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
  surroundingCells?: number; // Number of surrounding cells to highlight
  surroundingRadius?: number; // Max radius for surrounding cells
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
  gridClassName = "stroke-current/30",
  surroundingCells = 6, // Default number of surrounding cells
  surroundingRadius = 2, // Default radius
  ...props
}: GridPatternProps) {
  const [highlightSquares, setHighlightSquares] = useState<HighlightSquare[]>(
    [],
  );
  const [currentCell, setCurrentCell] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const lastGridCell = useRef<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout>(null);
  const moveTimeoutRef = useRef<NodeJS.Timeout>(null);

  // Generate random surrounding cells
  const generateSurroundingCells = useCallback(
    (centerX: number, centerY: number): Array<{ x: number; y: number }> => {
      const cells: Array<{ x: number; y: number }> = [];
      const usedPositions = new Set<string>();

      // Add the center cell
      usedPositions.add(`${centerX}-${centerY}`);

      // Generate random surrounding cells
      let attempts = 0;
      while (
        cells.length < surroundingCells &&
        attempts < surroundingCells * 3
      ) {
        // Random offset within radius
        const offsetX =
          Math.floor(Math.random() * (surroundingRadius * 2 + 1)) -
          surroundingRadius;
        const offsetY =
          Math.floor(Math.random() * (surroundingRadius * 2 + 1)) -
          surroundingRadius;

        // Skip center cell
        if (offsetX === 0 && offsetY === 0) {
          attempts++;
          continue;
        }

        const newX = centerX + offsetX;
        const newY = centerY + offsetY;
        const key = `${newX}-${newY}`;

        // Check if position is already used
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

  // Mouse movement handling with surrounding cells
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current) return;

      const rect = svgRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const gridX = Math.floor(mouseX / width);
      const gridY = Math.floor(mouseY / height);

      if (gridX >= 0 && gridY >= 0) {
        const isSameCell =
          lastGridCell.current &&
          lastGridCell.current.x === gridX &&
          lastGridCell.current.y === gridY;

        // Set moving state
        setIsMoving(true);

        // Clear existing timeout and set new one
        if (moveTimeoutRef.current) {
          clearTimeout(moveTimeoutRef.current);
        }

        // Start fade after mouse stops
        moveTimeoutRef.current = setTimeout(() => {
          setIsMoving(false);

          // Add current cluster to trail so it fades out naturally
          if (lastGridCell.current) {
            const timestamp = Date.now();

            // Add center cell
            const fadeSquares: HighlightSquare[] = [
              {
                x: lastGridCell.current.x,
                y: lastGridCell.current.y,
                id: `fade-center-${lastGridCell.current.x}-${lastGridCell.current.y}-${timestamp}`,
                timestamp,
                isCenter: true,
              },
            ];

            // Add surrounding cells from current state
            const surroundingPositions = generateSurroundingCells(
              lastGridCell.current.x,
              lastGridCell.current.y,
            );

            surroundingPositions.forEach((pos, index) => {
              fadeSquares.push({
                x: pos.x,
                y: pos.y,
                id: `fade-surround-${pos.x}-${pos.y}-${timestamp}-${index}`,
                timestamp,
                isCenter: false,
              });
            });

            setHighlightSquares((prev) => [...prev, ...fadeSquares]);
          }

          setCurrentCell(null);
        }, 100);

        if (!isSameCell) {
          // Update current cell
          setCurrentCell({ x: gridX, y: gridY });

          // Generate new cluster of highlights
          const timestamp = Date.now();
          const newSquares: HighlightSquare[] = [];

          // Add center cell
          newSquares.push({
            x: gridX,
            y: gridY,
            id: `center-${gridX}-${gridY}-${timestamp}`,
            timestamp,
            isCenter: true,
          });

          // Add random surrounding cells
          const surroundingPositions = generateSurroundingCells(gridX, gridY);
          surroundingPositions.forEach((pos, index) => {
            newSquares.push({
              x: pos.x,
              y: pos.y,
              id: `surround-${pos.x}-${pos.y}-${timestamp}-${index}`,
              timestamp,
              isCenter: false,
            });
          });

          setHighlightSquares((prev) => {
            // Keep only recent highlights
            const recent = prev.filter((s) => timestamp - s.timestamp < 800);
            return [...recent, ...newSquares];
          });

          lastGridCell.current = { x: gridX, y: gridY };
        }
      }
    },
    [width, height, generateSurroundingCells],
  );

  const handleMouseLeave = useCallback(() => {
    // Add current cluster to trail before clearing
    if (currentCell && isMoving) {
      const timestamp = Date.now();
      const fadeSquares: HighlightSquare[] = [
        {
          x: currentCell.x,
          y: currentCell.y,
          id: `fade-leave-center-${currentCell.x}-${currentCell.y}-${timestamp}`,
          timestamp,
          isCenter: true,
        },
      ];

      // Add surrounding cells
      const surroundingPositions = generateSurroundingCells(
        currentCell.x,
        currentCell.y,
      );
      surroundingPositions.forEach((pos, index) => {
        fadeSquares.push({
          x: pos.x,
          y: pos.y,
          id: `fade-leave-surround-${pos.x}-${pos.y}-${timestamp}-${index}`,
          timestamp,
          isCenter: false,
        });
      });

      setHighlightSquares((prev) => [...prev, ...fadeSquares]);
    }

    setCurrentCell(null);
    setIsMoving(false);
    if (moveTimeoutRef.current) {
      clearTimeout(moveTimeoutRef.current);
    }
  }, [currentCell, isMoving, generateSurroundingCells]);

  // Cleanup old squares
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      setHighlightSquares((prev) =>
        prev.filter((square) => now - square.timestamp < 800),
      );
    };

    cleanupTimeoutRef.current = setInterval(cleanup, 500);
    return () => {
      if (cleanupTimeoutRef.current) clearInterval(cleanupTimeoutRef.current);
      if (moveTimeoutRef.current) clearTimeout(moveTimeoutRef.current);
    };
  }, []);

  // Memoize dimensions calculation
  const [dimensions, setDimensions] = useState<{
    cols: number;
    rows: number;
  } | null>(null);

  useEffect(() => {
    const calculateDimensions = () => {
      const cols = Math.ceil(window.innerWidth / width) + 2;
      const rows = Math.ceil(window.innerHeight / height) + 2;
      setDimensions({ cols, rows });
    };

    calculateDimensions();

    // Debounce resize
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(calculateDimensions, 150);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [width, height]);

  // Memoize static squares
  const staticSquares = useMemo(() => squares || [], [squares]);

  // Get current active cells (center + surrounding) for instant highlight
  const currentActiveCells = useMemo(() => {
    if (!currentCell || !isMoving) return [];

    const cells = [currentCell];
    const surrounding = generateSurroundingCells(currentCell.x, currentCell.y);
    return [...cells, ...surrounding];
  }, [currentCell, isMoving, generateSurroundingCells]);

  if (!dimensions) {
    return (
      <svg
        ref={svgRef}
        aria-hidden="true"
        className={cn("absolute inset-0 h-full w-full", className)}
        {...props}
      />
    );
  }

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      className={cn("absolute inset-0 h-full w-full", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <defs>
        {/* Use pattern for base grid */}
        <pattern
          id="grid-pattern"
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            className={gridClassName}
            strokeWidth="0.5"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>

      {/* Base grid using pattern */}
      <rect
        width="100%"
        height="100%"
        strokeWidth={0}
        fill="url(#grid-pattern)"
      />

      {/* Instant highlight for current cluster - only when moving */}
      {isMoving &&
        currentActiveCells.map((cell, index) => (
          <rect
            key={`active-${cell.x}-${cell.y}-${index}`}
            x={cell.x * width + 0.5}
            y={cell.y * height + 0.5}
            width={width - 1}
            height={height - 1}
            fill="none"
            className="stroke-primary"
            strokeWidth={index === 0 ? 2 : 1.5} // Center cell has thicker stroke
            opacity={index === 0 ? 0.9 : 0.7} // Center cell more opaque
            pointerEvents="none"
          />
        ))}

      {/* Animated trail highlights */}
      <AnimatePresence mode="popLayout">
        {highlightSquares.map((square) => {
          const now = Date.now();
          const age = Math.min(1, (now - square.timestamp) / 800);

          // Skip if this is part of current active cells
          if (
            isMoving &&
            currentActiveCells.some(
              (cell) => cell.x === square.x && cell.y === square.y,
            )
          ) {
            return null;
          }

          return (
            <motion.rect
              key={square.id}
              x={square.x * width + 0.5}
              y={square.y * height + 0.5}
              width={width - 1}
              height={height - 1}
              fill="none"
              className={
                square.isCenter ? "stroke-primary/70" : "stroke-primary/50"
              }
              strokeWidth={square.isCenter ? 1.5 : 1}
              initial={{
                opacity: square.isCenter ? 0.8 : 0.6,
                scale: 0.8,
              }}
              animate={{
                opacity: Math.max(0, (square.isCenter ? 0.7 : 0.5) * (1 - age)),
                strokeWidth: Math.max(
                  0.5,
                  (square.isCenter ? 1.5 : 1) * (1 - age),
                ),
                scale: 1 + age * 0.2, // Gentle scale out effect
              }}
              exit={{
                opacity: 0,
                scale: 1.3,
              }}
              transition={{
                duration: 0.4,
                ease: [0.4, 0, 0.6, 1],
              }}
            />
          );
        })}
      </AnimatePresence>

      {/* Static overlay squares */}
      {staticSquares.length > 0 && (
        <g>
          {staticSquares.map(([x, y], index) => (
            <rect
              strokeWidth="0"
              key={`static-${x}-${y}-${index}`}
              width={width - 1}
              height={height - 1}
              x={x * width + 1}
              y={y * height + 1}
              fill="currentColor"
            />
          ))}
        </g>
      )}
    </svg>
  );
}
