"use client";

import { AnimatePresence, m } from "motion/react";
import { ExternalLinkIcon, EyeIcon } from "lucide-react";

export function ProjectCardHoverCursor({
  isHovering,
}: {
  isHovering: boolean;
}) {
  return (
    <m.div
      animate={{
        scaleX: isHovering ? 1 : 0.2,
        scaleY: isHovering ? 1 : 0.5,
      }}
      className="flex h-8 w-20 origin-center items-center justify-center rounded-[24px] bg-black/90 backdrop-blur-md"
    >
      <AnimatePresence>
        {isHovering && (
          <m.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="inline-flex w-full items-center justify-center"
          >
            <div className="inline-flex items-center text-sm text-white font-medium">
              View <EyeIcon className="ml-1 h-4 w-4" />
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
}

export function ProjectCardBadge({
  text,
  position,
  isHovered,
  index,
}: {
  text: string;
  position: "bottom-left" | "bottom-right";
  isHovered: boolean;
  index: number;
}) {
  const positionClasses =
    position === "bottom-right" ? "bottom-4 right-4" : "bottom-4 left-4";

  return (
    <m.div
      className={`absolute ${positionClasses} z-10`}
      initial={{ y: 10, opacity: 0.7, scale: 0.95 }}
      animate={{
        y: isHovered ? 0 : 10,
        opacity: isHovered ? 1 : 0.7,
        scale: isHovered ? 1 : 0.95,
      }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
        delay: index * 0.05,
      }}
    >
      <span className="inline-block bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
        {text}
      </span>
    </m.div>
  );
}

export function ProjectCardTitleOverlay({
  title,
  isHovered,
}: {
  title: string;
  isHovered: boolean;
}) {
  return (
    <m.div
      className="absolute top-4 left-4 z-10"
      initial={{ y: -10, opacity: 0.8 }}
      animate={{
        y: isHovered ? 0 : -10,
        opacity: isHovered ? 1 : 0.8,
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <h2 className="text-white text-lg font-semibold px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm">
        {title}
      </h2>
    </m.div>
  );
}

export function ProjectCardLiveLink({
  url,
  isHovered,
}: {
  url: string;
  isHovered: boolean;
}) {
  return (
    <m.div
      className="absolute top-4 right-4 z-20"
      initial={{ y: -10, opacity: 0 }}
      animate={{
        y: isHovered ? 0 : -10,
        opacity: isHovered ? 1 : 0,
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(event) => event.stopPropagation()}
        className="inline-flex items-center gap-1.5 bg-primary/90 backdrop-blur-sm text-primary-foreground text-sm font-medium px-3.5 py-1.5 rounded-full hover:bg-primary transition-colors shadow-lg shadow-primary/25"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>
        Live
        <ExternalLinkIcon className="h-3.5 w-3.5" />
      </a>
    </m.div>
  );
}
