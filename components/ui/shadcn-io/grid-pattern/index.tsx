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
}

interface GridPatternProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  squares?: Array<[number, number]>;
  strokeDasharray?: string;
  className?: string;
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
  const skipCounter = useRef(0);
  const moveTimeoutRef = useRef<NodeJS.Timeout>(null);

  // Direct mouse movement handling - with selective trail creation
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

        // Start fade after mouse stops for 100ms
        moveTimeoutRef.current = setTimeout(() => {
          setIsMoving(false);

          // Add current cell to trail so it fades out naturally
          if (lastGridCell.current) {
            const timestamp = Date.now();
            const fadeSquare: HighlightSquare = {
              x: lastGridCell.current.x,
              y: lastGridCell.current.y,
              id: `fade-${lastGridCell.current.x}-${lastGridCell.current.y}-${timestamp}`,
              timestamp,
            };

            setHighlightSquares((prev) => [...prev, fadeSquare]);
          }

          setCurrentCell(null);
        }, 100);

        if (!isSameCell) {
          // Only update current cell when actually moving to a new cell
          setCurrentCell({ x: gridX, y: gridY });

          skipCounter.current++;

          // Only add to trail every 2-3 cells for breaks in the line
          const shouldAddToTrail = skipCounter.current % 3 !== 1;

          if (shouldAddToTrail) {
            const timestamp = Date.now();
            const newSquare: HighlightSquare = {
              x: gridX,
              y: gridY,
              id: `${gridX}-${gridY}-${timestamp}`,
              timestamp,
            };

            setHighlightSquares((prev) => {
              // Keep only recent highlights to prevent memory buildup
              const recent = prev.filter((s) => timestamp - s.timestamp < 1500);
              return [...recent, newSquare];
            });
          }

          lastGridCell.current = { x: gridX, y: gridY };
        }
      }
    },
    [width, height],
  );

  const handleMouseLeave = useCallback(() => {
    // Add current cell to trail before clearing
    if (currentCell && isMoving) {
      const timestamp = Date.now();
      const fadeSquare: HighlightSquare = {
        x: currentCell.x,
        y: currentCell.y,
        id: `fade-${currentCell.x}-${currentCell.y}-${timestamp}`,
        timestamp,
      };

      setHighlightSquares((prev) => [...prev, fadeSquare]);
    }

    setCurrentCell(null);
    setIsMoving(false);
    skipCounter.current = 0;
    if (moveTimeoutRef.current) {
      clearTimeout(moveTimeoutRef.current);
    }
  }, [currentCell, isMoving]);

  // Cleanup old squares less frequently
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      setHighlightSquares((prev) =>
        prev.filter((square) => now - square.timestamp < 1500),
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

  // Group highlights by cell for efficient lookup
  const highlightMap = useMemo(() => {
    const map = new Map<string, HighlightSquare>();
    highlightSquares.forEach((square) => {
      const key = `${square.x}-${square.y}`;
      const existing = map.get(key);
      if (!existing || square.timestamp > existing.timestamp) {
        map.set(key, square);
      }
    });
    return map;
  }, [highlightSquares]);

  if (!dimensions) {
    return (
      <svg
        ref={svgRef}
        aria-hidden="true"
        className={cn(
          "absolute inset-0 h-full w-full fill-muted-foreground/20 stroke-muted-foreground/20",
          className,
        )}
        {...props}
      />
    );
  }

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      className={cn(
        "absolute inset-0 h-full w-full fill-muted-foreground/20 stroke-muted-foreground/20",
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <defs>
        {/* Use pattern for base grid - much more efficient than individual rects */}
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
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray={strokeDasharray}
            opacity="0.3"
          />
        </pattern>
      </defs>

      {/* Base grid using pattern - single element instead of thousands */}
      <rect
        width="100%"
        height="100%"
        strokeWidth={0}
        fill="url(#grid-pattern)"
      />

      {/* Instant highlight for current cell - only when moving */}
      {currentCell && isMoving && (
        <rect
          x={currentCell.x * width + 0.5}
          y={currentCell.y * height + 0.5}
          width={width - 1}
          height={height - 1}
          fill="none"
          className="stroke-primary"
          strokeWidth={2}
          opacity={0.9}
          pointerEvents="none"
        />
      )}

      {/* Animated trail highlights - more visible with breaks */}
      <AnimatePresence mode="popLayout">
        {Array.from(highlightMap.values()).map((square) => {
          const now = Date.now();
          const age = Math.min(1, (now - square.timestamp) / 1500);

          // Don't render if this is the current cell (avoid double highlight)
          if (
            currentCell &&
            square.x === currentCell.x &&
            square.y === currentCell.y
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
              className="stroke-primary/60"
              strokeWidth={1.5}
              initial={{ opacity: 0.7 }}
              animate={{
                opacity: Math.max(0, 0.6 * (1 - age)),
                strokeWidth: Math.max(0.5, 1.5 * (1 - age)),
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.8,
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
