/**
 * BadgePill component - displays a small badge with text.
 * Accessible, keyboard focusable, and supports positioning.
 */

import React from "react";

export interface BadgePillProps {
  text: string;
  position?: "bottom-left" | "bottom-right";
  className?: string;
  onClick?: () => void;
}

export const BadgePill: React.FC<BadgePillProps> = ({
  text,
  className = "",
  onClick,
}) => {
  const isInteractive = !!onClick;

  const baseClasses =
    "inline-flex items-center px-3 py-1 rounded-full text-sm lg:text-md font-medium transition-all duration-200";
  const colorClasses = "bg-muted text-muted-foreground";
  const interactiveClasses = isInteractive
    ? "cursor-pointer hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    : "";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isInteractive && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <span
      className={`${baseClasses} ${colorClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={text}
    >
      {text}
    </span>
  );
};
