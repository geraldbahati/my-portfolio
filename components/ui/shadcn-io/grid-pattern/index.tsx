"use client";

import React, {
  useEffect,
  useRef,
  useCallback,
  useMemo,
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
  strokeDasharray, // Destructured for API compatibility but not used in Canvas
  squares,
  className,
  gridClassName = "stroke-current/30",
  surroundingCells = 6,
  surroundingRadius = 2,
  style,
  disableInteraction = false,
  ...props
}: GridPatternProps) {
  // strokeDasharray is part of the API for SVG compatibility but not used in Canvas implementation
  void strokeDasharray;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const highlightSquaresRef = useRef<HighlightSquare[]>([]);
  const currentCellRef = useRef<{ x: number; y: number } | null>(null);
  const currentSurroundingRef = useRef<Array<{ x: number; y: number }>>([]);
  const isMovingRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef(0);
  const lastMouseMoveTimeRef = useRef(0);
  const mouseMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize static squares
  const staticSquares = useMemo(() => squares || [], [squares]);

  // Get grid color from context - calculates from actual DOM element
  const getGridColor = useCallback(() => {
    if (typeof window === "undefined") return "rgba(0, 0, 0, 0.1)";

    // Extract opacity from className like "stroke-current/50"
    const match = gridClassName.match(/\/(\d+)/);
    const opacity = match ? parseInt(match[1]) / 100 : 0.1;

    const canvasEl = canvasRef.current;
    if (!canvasEl) return `rgba(0, 0, 0, ${opacity})`;

    // Helper function to find first non-transparent background
    const findBackgroundColor = (element: HTMLElement | null): string | null => {
      let current = element;
      let depth = 0;

      console.log("🔍 Starting background color detection...");

      while (current && depth < 15) {
        const styles = getComputedStyle(current);
        const bgColor = styles.backgroundColor;

        console.log(`  Depth ${depth}:`, {
          element: current.tagName,
          className: current.className,
          backgroundColor: bgColor,
        });

        // Check if background is not transparent
        if (bgColor && bgColor !== "rgba(0, 0, 0, 0)" && bgColor !== "transparent") {
          console.log(`  ✅ Found background at depth ${depth}:`, bgColor);
          return bgColor;
        }

        current = current.parentElement;
        depth++;
      }

      // Last resort: check body background
      if (document.body) {
        const bodyBgColor = getComputedStyle(document.body).backgroundColor;
        console.log("  🔄 Checking body background:", bodyBgColor);
        if (bodyBgColor && bodyBgColor !== "rgba(0, 0, 0, 0)" && bodyBgColor !== "transparent") {
          console.log("  ✅ Using body background:", bodyBgColor);
          return bodyBgColor;
        }
      }

      console.log("  ❌ No background found");
      return null;
    };

    // Try to find the actual background color by traversing up
    const bgColor = findBackgroundColor(canvasEl.parentElement);

    if (bgColor) {
      // Parse the background color and calculate luminance
      const rgbMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (rgbMatch) {
        const [, r, g, b] = rgbMatch.map(Number);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        console.log("📊 Luminance calculation:", {
          rgb: `rgb(${r}, ${g}, ${b})`,
          luminance: luminance.toFixed(2),
          isDark: luminance < 0.5,
        });

        // If dark background (luminance < 0.5), use white lines
        // If light background (luminance >= 0.5), use black lines
        if (luminance < 0.5) {
          console.log("🎨 Using WHITE lines for dark background");
          return `rgba(255, 255, 255, ${opacity})`;
        } else {
          console.log("🎨 Using BLACK lines for light background");
          return `rgba(0, 0, 0, ${opacity})`;
        }
      }
    }

    // Default to black with opacity (safer fallback for light backgrounds)
    console.log("🎨 Using DEFAULT black lines");
    return `rgba(0, 0, 0, ${opacity})`;
  }, [gridClassName]);

  // Get primary color from CSS variables
  const getPrimaryColor = useCallback(() => {
    if (typeof window === "undefined") return "rgba(139, 92, 246, 0.9)";

    const rootStyles = getComputedStyle(document.documentElement);
    const primaryColor = rootStyles.getPropertyValue("--primary").trim();

    // If we have an oklch color, use it directly (modern browsers support it)
    if (primaryColor.startsWith("oklch")) {
      return primaryColor;
    }

    // Fallback to hardcoded primary color
    return "rgba(139, 92, 246, 0.9)";
  }, []);

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

  // Draw grid on offscreen canvas (only once)
  const drawStaticGrid = useCallback(
    (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
      const dpr = window.devicePixelRatio || 1;
      const canvasWidth = canvas.width / dpr;
      const canvasHeight = canvas.height / dpr;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = getGridColor();
      ctx.lineWidth = 0.5;

      // Draw vertical lines
      for (let i = x; i < canvasWidth; i += width) {
        ctx.beginPath();
        ctx.moveTo(i * dpr, 0);
        ctx.lineTo(i * dpr, canvas.height);
        ctx.stroke();
      }

      // Draw horizontal lines
      for (let i = y; i < canvasHeight; i += height) {
        ctx.beginPath();
        ctx.moveTo(0, i * dpr);
        ctx.lineTo(canvas.width, i * dpr);
        ctx.stroke();
      }

      // Draw static squares
      if (staticSquares.length > 0) {
        ctx.fillStyle = "currentColor";
        staticSquares.forEach(([sx, sy]) => {
          ctx.fillRect(
            (sx * width + 1) * dpr,
            (sy * height + 1) * dpr,
            (width - 1) * dpr,
            (height - 1) * dpr
          );
        });
      }
    },
    [width, height, x, y, getGridColor, staticSquares]
  );

  // Animation loop using RAF
  const animate = useCallback(
    (timestamp: number) => {
      const canvas = canvasRef.current;
      const offscreenCanvas = offscreenCanvasRef.current;
      if (!canvas || !offscreenCanvas || disableInteraction) {
        rafIdRef.current = requestAnimationFrame(animate);
        return;
      }

      // Throttle to ~60fps
      if (timestamp - lastFrameTimeRef.current < 16) {
        rafIdRef.current = requestAnimationFrame(animate);
        return;
      }
      lastFrameTimeRef.current = timestamp;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        rafIdRef.current = requestAnimationFrame(animate);
        return;
      }

      const dpr = window.devicePixelRatio || 1;

      // Draw static grid from offscreen canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(offscreenCanvas, 0, 0);

      // Update and draw highlights
      const now = Date.now();
      const highlights = highlightSquaresRef.current;

      // Remove expired highlights
      highlightSquaresRef.current = highlights.filter(
        (square) => now - square.timestamp < 800
      );

      // Get current cell and surrounding cells for collision detection
      let currentActiveCells: { x: number; y: number }[] = [];

      // Draw current active cell ONLY when mouse is moving (not stationary)
      if (currentCellRef.current && isMovingRef.current) {
        const { x: cx, y: cy } = currentCellRef.current;
        // Use cached surrounding cells for performance
        currentActiveCells = [{ x: cx, y: cy }, ...currentSurroundingRef.current];

        // Get primary color from CSS variables
        const primaryColor = getPrimaryColor();

        currentActiveCells.forEach((cell, index) => {
          const isCenter = index === 0;
          ctx.strokeStyle = primaryColor;
          ctx.lineWidth = (isCenter ? 2 : 1.5) * dpr;

          ctx.strokeRect(
            (cell.x * width + 0.5) * dpr,
            (cell.y * height + 0.5) * dpr,
            (width - 1) * dpr,
            (height - 1) * dpr
          );
        });
      }

      // Draw animated trail highlights (skip if matches current active cells to avoid duplication)
      // Get primary color once for all trail highlights
      const primaryColorBase = getPrimaryColor();

      highlightSquaresRef.current.forEach((square) => {
        // Skip drawing if this square matches any of the current hovered cells
        const isCurrentlyActive = currentActiveCells.some(
          (cell) => cell.x === square.x && cell.y === square.y
        );

        if (isCurrentlyActive) {
          return;
        }

        const age = Math.min(1, (now - square.timestamp) / 800);
        const opacity = Math.max(
          0,
          (square.isCenter ? 0.7 : 0.5) * (1 - age)
        );
        const scale = 1 + age * 0.2;
        const lineWidth = Math.max(
          0.5,
          (square.isCenter ? 1.5 : 1) * (1 - age)
        );

        if (opacity > 0) {
          ctx.save();

          // Apply scale transform
          const centerX = (square.x * width + width / 2) * dpr;
          const centerY = (square.y * height + width / 2) * dpr;

          ctx.translate(centerX, centerY);
          ctx.scale(scale, scale);
          ctx.translate(-centerX, -centerY);

          // Use primary color with dynamic opacity
          // If primaryColorBase is oklch, append alpha; otherwise use rgba
          if (primaryColorBase.startsWith("oklch")) {
            // Convert oklch to rgba for opacity support in canvas
            // For now, set opacity via globalAlpha
            ctx.globalAlpha = opacity;
            ctx.strokeStyle = primaryColorBase;
          } else {
            ctx.strokeStyle = primaryColorBase.replace(/[\d.]+\)$/g, `${opacity})`);
          }

          ctx.lineWidth = lineWidth * dpr;

          ctx.strokeRect(
            (square.x * width + 0.5) * dpr,
            (square.y * height + 0.5) * dpr,
            (width - 1) * dpr,
            (height - 1) * dpr
          );

          ctx.restore();
        }
      });

      rafIdRef.current = requestAnimationFrame(animate);
    },
    [width, height, disableInteraction, getPrimaryColor]
  );

  // Throttled mouse handler
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!canvasRef.current || disableInteraction) return;

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

      const rect = canvasRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const gridX = Math.floor(mouseX / width);
      const gridY = Math.floor(mouseY / height);

      if (gridX >= 0 && gridY >= 0) {
        const isSameCell =
          currentCellRef.current &&
          currentCellRef.current.x === gridX &&
          currentCellRef.current.y === gridY;

        // Update last mouse move time
        lastMouseMoveTimeRef.current = Date.now();

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

  // Setup canvas and start animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Setup main canvas
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);

    // Create and setup offscreen canvas for static grid
    const offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;
    offscreenCanvasRef.current = offscreenCanvas;

    const offscreenCtx = offscreenCanvas.getContext("2d");
    if (offscreenCtx) {
      offscreenCtx.scale(dpr, dpr);

      // Wait longer to ensure all styles are fully computed and painted
      // Using both RAF and setTimeout to ensure styles are ready
      requestAnimationFrame(() => {
        setTimeout(() => {
          drawStaticGrid(offscreenCanvas, offscreenCtx);
        }, 100);
      });
    }

    // Start animation loop
    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (mouseMoveTimeoutRef.current) {
        clearTimeout(mouseMoveTimeoutRef.current);
      }
    };
  }, [animate, drawStaticGrid]);

  // Handle mouse events
  useEffect(() => {
    if (disableInteraction) return;

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (canvas) {
        canvas.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [handleMouseMove, handleMouseLeave, disableInteraction]);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const offscreenCanvas = offscreenCanvasRef.current;
      if (!canvas || !offscreenCanvas) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      offscreenCanvas.width = canvas.width;
      offscreenCanvas.height = canvas.height;

      const ctx = canvas.getContext("2d");
      const offscreenCtx = offscreenCanvas.getContext("2d");

      if (ctx && offscreenCtx) {
        ctx.scale(dpr, dpr);
        offscreenCtx.scale(dpr, dpr);
        // Redraw with slight delay to ensure styles are ready
        requestAnimationFrame(() => {
          drawStaticGrid(offscreenCanvas, offscreenCtx);
        });
      }
    };

    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, [drawStaticGrid]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("absolute inset-0 h-full w-full", className)}
      style={{ ...style, pointerEvents: disableInteraction ? "none" : "auto" }}
      {...props}
    />
  );
}
