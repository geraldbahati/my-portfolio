"use client";

import dynamic from "next/dynamic";
import type { BackgroundTarget } from "@/components/BackgroundColorSwitcher.client";

// Dynamically import BackgroundColorSwitcher to prevent SSR issues
const BackgroundColorSwitcher = dynamic(
  () => import("@/components/BackgroundColorSwitcher.client"),
  { ssr: false }
);

interface BackgroundColorSwitcherWrapperProps {
  targets: BackgroundTarget[];
  defaultColor?: string;
  animationDuration?: number;
  animationEasing?: string;
  updateCSSVariables?: boolean;
}

export default function BackgroundColorSwitcherWrapper(
  props: BackgroundColorSwitcherWrapperProps
) {
  return <BackgroundColorSwitcher {...props} />;
}