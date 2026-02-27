"use client";

import { useEffect } from "react";
import { Observer } from "tailwindcss-intersect";

export function IntersectObserver() {
  useEffect(() => {
    Observer.start();
  }, []);

  return null;
}
