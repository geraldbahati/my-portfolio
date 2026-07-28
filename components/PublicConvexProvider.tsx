"use client";

import { ReactNode, useEffect } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export default function PublicConvexProvider({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    if (!convex && process.env.NODE_ENV !== "production") {
      console.warn(
        "NEXT_PUBLIC_CONVEX_URL is missing. Convex-backed features are disabled in this environment.",
      );
    }
  }, []);

  if (!convex) {
    return <>{children}</>;
  }

  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
