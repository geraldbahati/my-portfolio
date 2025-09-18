import { cn } from "@/lib/utils";

interface GridPatternProps {
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
   * X offset for the grid pattern
   * @default 0
   */
  x?: number;
  /**
   * Y offset for the grid pattern
   * @default 0
   */
  y?: number;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Pattern variant
   * @default "default"
   */
  variant?: "default" | "dotted" | "dashed" | "plus" | "cross";
  /**
   * Enable fade edges for a softer look
   * @default false
   */
  fadeEdges?: boolean;
  /**
   * Stroke width of the grid lines
   * @default 1
   */
  strokeWidth?: number;
}

/**
 * Performant Grid Pattern Component
 *
 * This component uses CSS-only rendering for optimal performance.
 * No JavaScript animations or state management for better LCP scores.
 *
 * @example
 * ```tsx
 * <GridPattern className="opacity-20" />
 * ```
 */
export default function GridPattern({
  width = 40,
  height = 40,
  x = 0,
  y = 0,
  className,
  variant = "default",
  fadeEdges = false,
  strokeWidth = 1,
}: GridPatternProps) {
  // Generate pattern based on variant
  const getPatternStyles = () => {
    const baseColor = "rgb(255 255 255 / 0.2)"; // Tailwind white with opacity

    switch (variant) {
      case "dotted":
        return {
          backgroundImage: `radial-gradient(circle at center, ${baseColor} ${strokeWidth}px, transparent ${strokeWidth}px)`,
          backgroundSize: `${width}px ${height}px`,
        };

      case "dashed":
        return {
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent ${height / 4}px, ${baseColor} ${height / 4}px, ${baseColor} ${height / 2}px),
            repeating-linear-gradient(90deg, transparent, transparent ${width / 4}px, ${baseColor} ${width / 4}px, ${baseColor} ${width / 2}px)
          `,
          backgroundSize: `${width}px ${height}px`,
        };

      case "plus":
        return {
          backgroundImage: `
            linear-gradient(${baseColor} ${strokeWidth}px, transparent ${strokeWidth}px),
            linear-gradient(90deg, ${baseColor} ${strokeWidth}px, transparent ${strokeWidth}px)
          `,
          backgroundSize: `${width}px ${height}px`,
          backgroundPosition: `${x}px ${y}px, ${x}px ${y}px`,
        };

      case "cross":
        return {
          backgroundImage: `
            linear-gradient(45deg, transparent 45%, ${baseColor} 45%, ${baseColor} 55%, transparent 55%),
            linear-gradient(-45deg, transparent 45%, ${baseColor} 45%, ${baseColor} 55%, transparent 55%)
          `,
          backgroundSize: `${width}px ${height}px`,
          backgroundPosition: `${x}px ${y}px`,
        };

      default:
        return {
          backgroundImage: `
            linear-gradient(to right, ${baseColor} ${strokeWidth}px, transparent ${strokeWidth}px),
            linear-gradient(to bottom, ${baseColor} ${strokeWidth}px, transparent ${strokeWidth}px)
          `,
          backgroundSize: `${width}px ${height}px`,
          backgroundPosition: `${x}px ${y}px`,
        };
    }
  };

  return (
    <div
      className={cn(
        // Base styles
        "pointer-events-none absolute inset-0",
        // Fade edges using Tailwind's gradient utilities
        fadeEdges && [
          "mask-image-[radial-gradient(ellipse_at_center,transparent,black)]",
          "[mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_90%)]",
        ],
        className,
      )}
      style={getPatternStyles()}
      aria-hidden="true"
    />
  );
}
