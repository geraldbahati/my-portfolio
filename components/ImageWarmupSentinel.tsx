"use client";

import { useEffect, useRef } from "react";
import { warmImages } from "@/lib/resource-warmup";

interface ImageWarmupSentinelProps {
  images: string[];
  limit?: number;
  rootMargin?: string;
  delayMs?: number;
  className?: string;
}

export function ImageWarmupSentinel({
  images,
  limit = 2,
  rootMargin = "300px",
  delayMs = 0,
  className = "absolute inset-x-0 top-0 h-px pointer-events-none",
}: ImageWarmupSentinelProps) {
  const sentinelRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || images.length === 0) {
      return;
    }

    let timeoutId: number | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) {
          return;
        }

        observer.disconnect();

        const triggerWarmup = () => {
          warmImages(images, limit);
        };

        if (delayMs > 0) {
          timeoutId = window.setTimeout(triggerWarmup, delayMs);
          return;
        }

        triggerWarmup();
      },
      { rootMargin },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [delayMs, images, limit, rootMargin]);

  return <span ref={sentinelRef} aria-hidden="true" className={className} />;
}
