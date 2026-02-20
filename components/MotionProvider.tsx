"use client";

import { LazyMotion, domAnimation } from "motion/react";
import { ReactNode } from "react";

export function MotionProvider({ children }: { children: ReactNode }) {
  return <LazyMotion features={domAnimation}>{children}</LazyMotion>;
}
