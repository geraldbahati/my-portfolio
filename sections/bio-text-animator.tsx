"use client";

import { useEffect } from "react";
import { getBioCharOpacity } from "@/lib/bio-char-opacity";

export type SubscribeToTextProgress = (
  listener: (progress: number) => void,
) => () => void;

/**
 * BioTextAnimator - Thin client component for per-character text reveal.
 *
 * Uses querySelectorAll('[data-char-index]') to find character spans
 * rendered by the server component. Subscribes to a vanilla scroll
 * progress value forwarded from the shell.
 */
export default function BioTextAnimator({
  subscribeToTextProgress,
}: {
  subscribeToTextProgress: SubscribeToTextProgress;
}) {
  useEffect(() => {
    // Gather all character elements from the server-rendered bio
    const bioSection = document.querySelector("[data-bio-section]");
    if (!bioSection) return;

    const total = parseInt(
      bioSection.getAttribute("data-total-chars") || "0",
      10,
    );

    const els = bioSection.querySelectorAll<HTMLElement>("[data-char-index]");
    const charEls = Array.from(els).map((el) => ({
      el,
      index: parseInt(el.getAttribute("data-char-index") || "0", 10),
    }));

    return subscribeToTextProgress((progress) => {
      for (const { el, index } of charEls) {
        el.style.opacity = String(getBioCharOpacity(progress, index, total));
      }
    });
  }, [subscribeToTextProgress]);

  return null;
}
