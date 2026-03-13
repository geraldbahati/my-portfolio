"use client";

import { LazyMotion } from "motion/react";
import { ReactNode } from "react";

// Lazy-load animation features instead of static import to reduce initial JS bundle
const loadFeatures = () =>
  import("motion/react").then((mod) => mod.domAnimation);

export function MotionProvider({ children }: { children: ReactNode }) {
  return <LazyMotion features={loadFeatures}>{children}</LazyMotion>;
}
