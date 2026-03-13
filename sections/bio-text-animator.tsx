"use client";

import { useEffect, useRef } from "react";

/**
 * BioTextAnimator - Thin client component for per-character text reveal.
 *
 * Uses querySelectorAll('[data-char-index]') to find character spans
 * rendered by the server component. Subscribes to a vanilla scroll
 * progress value forwarded from the shell.
 */
export default function BioTextAnimator({
  getTextProgress,
}: {
  getTextProgress: () => number;
}) {
  const charEls = useRef<{ el: HTMLElement; index: number }[]>([]);
  const totalChars = useRef(0);
  const rafId = useRef(0);
  const lastProgress = useRef(-1);

  useEffect(() => {
    // Gather all character elements from the server-rendered bio
    const bioSection = document.querySelector("[data-bio-section]");
    if (!bioSection) return;

    const total = parseInt(
      bioSection.getAttribute("data-total-chars") || "0",
      10,
    );
    totalChars.current = total;

    const els = bioSection.querySelectorAll<HTMLElement>("[data-char-index]");
    charEls.current = Array.from(els).map((el) => ({
      el,
      index: parseInt(el.getAttribute("data-char-index") || "0", 10),
    }));

    // Animation loop driven by the shell's scroll progress
    function animate() {
      const progress = getTextProgress();

      // Skip if progress hasn't changed
      if (progress !== lastProgress.current) {
        lastProgress.current = progress;
        const total = totalChars.current;

        for (const { el, index } of charEls.current) {
          const charStart = index / total;
          const charWidth = 3 / total;
          const t = Math.min(
            1,
            Math.max(0, (progress - charStart) / charWidth),
          );
          el.style.opacity = String(0.2 + 0.8 * t);
        }
      }

      rafId.current = requestAnimationFrame(animate);
    }

    rafId.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(rafId.current);
  }, [getTextProgress]);

  return null;
}
