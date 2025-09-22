"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useId,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface HighlightSquare {
  x: number;
  y: number;
  id: string;
  timestamp: number;
  isCenter?: boolean;
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
  style?: React.CSSProperties; // Add style prop support
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
  surroundingCells = 6,
  surroundingRadius = 2,
  style, // Accept style prop
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
  const [mounted, setMounted] = useState(false);
  const lastGridCell = useRef<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout>(null);
  const moveTimeoutRef = useRef<NodeJS.Timeout>(null);

  // Ensure component is mounted before rendering interactive elements
  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate random surrounding cells
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

  // Enhanced mouse movement handling for better interaction through layers
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
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

        setIsMoving(true);

        if (moveTimeoutRef.current) {
          clearTimeout(moveTimeoutRef.current);
        }

        moveTimeoutRef.current = setTimeout(() => {
          setIsMoving(false);

          if (lastGridCell.current) {
            const timestamp = Date.now();

            const fadeSquares: HighlightSquare[] = [
              {
                x: lastGridCell.current.x,
                y: lastGridCell.current.y,
                id: `fade-center-${lastGridCell.current.x}-${lastGridCell.current.y}-${timestamp}`,
                timestamp,
                isCenter: true,
              },
            ];

            const surroundingPositions = generateSurroundingCells(
              lastGridCell.current.x,
              lastGridCell.current.y,
            );

            surroundingPositions.forEach((pos, index) => {
              fadeSquares.push({
                x: pos.x,
                y: pos.y,
                id: `fade-surround-${pos.x}-${pos.y}-${timestamp}-${index}-${Math.random().toString(36).substr(2, 9)}`,
                timestamp,
                isCenter: false,
              });
            });

            setHighlightSquares((prev) => [...prev, ...fadeSquares]);
          }

          setCurrentCell(null);
        }, 100);

        if (!isSameCell) {
          setCurrentCell({ x: gridX, y: gridY });

          const timestamp = Date.now();
          const newSquares: HighlightSquare[] = [];

          newSquares.push({
            x: gridX,
            y: gridY,
            id: `center-${gridX}-${gridY}-${timestamp}`,
            timestamp,
            isCenter: true,
          });

          const surroundingPositions = generateSurroundingCells(gridX, gridY);
          surroundingPositions.forEach((pos, index) => {
            newSquares.push({
              x: pos.x,
              y: pos.y,
              id: `surround-${pos.x}-${pos.y}-${timestamp}-${index}-${Math.random().toString(36).substr(2, 9)}`,
              timestamp,
              isCenter: false,
            });
          });

          setHighlightSquares((prev) => {
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

      const surroundingPositions = generateSurroundingCells(
        currentCell.x,
        currentCell.y,
      );
      surroundingPositions.forEach((pos, index) => {
        fadeSquares.push({
          x: pos.x,
          y: pos.y,
          id: `fade-leave-surround-${pos.x}-${pos.y}-${timestamp}-${index}-${Math.random().toString(36).substr(2, 9)}`,
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

  // Use document-level mouse tracking for better interaction through layers
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Use window-level mouse tracking to catch events through layers
    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleMouseMove(e);
    };

    const handleSvgMouseLeave = () => {
      handleMouseLeave();
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    svg.addEventListener("mouseleave", handleSvgMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      if (svg) {
        svg.removeEventListener("mouseleave", handleSvgMouseLeave);
      }
    };
  }, [handleMouseMove, handleMouseLeave]);

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

  const staticSquares = useMemo(() => squares || [], [squares]);

  const currentActiveCells = useMemo(() => {
    if (!currentCell || !isMoving) return [];

    const cells = [currentCell];
    const surrounding = generateSurroundingCells(currentCell.x, currentCell.y);
    return [...cells, ...surrounding];
  }, [currentCell, isMoving, generateSurroundingCells]);

  // Generate a stable ID using useId to avoid hydration mismatches
  const patternId = useId();

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      className={cn("absolute inset-0 h-full w-full", className)}
      style={style} // Apply style prop
      {...props}
    >
      <defs>
        <pattern
          id={patternId}
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

      <rect
        width="100%"
        height="100%"
        strokeWidth={0}
        fill={`url(#${patternId})`}
      />

      {/* Instant highlight for current cluster */}
      {mounted &&
        isMoving &&
        currentActiveCells.map((cell, index) => (
          <rect
            key={`active-${cell.x}-${cell.y}-${index}`}
            x={cell.x * width + 0.5}
            y={cell.y * height + 0.5}
            width={width - 1}
            height={height - 1}
            fill="none"
            className="stroke-primary"
            strokeWidth={index === 0 ? 2 : 1.5}
            opacity={index === 0 ? 0.9 : 0.7}
            pointerEvents="none"
          />
        ))}

      {/* Animated trail highlights */}
      <AnimatePresence mode="popLayout">
        {mounted &&
          highlightSquares.map((square) => {
            const now = Date.now();
            const age = Math.min(1, (now - square.timestamp) / 800);

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
                  opacity: Math.max(
                    0,
                    (square.isCenter ? 0.7 : 0.5) * (1 - age),
                  ),
                  strokeWidth: Math.max(
                    0.5,
                    (square.isCenter ? 1.5 : 1) * (1 - age),
                  ),
                  scale: 1 + age * 0.2,
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
