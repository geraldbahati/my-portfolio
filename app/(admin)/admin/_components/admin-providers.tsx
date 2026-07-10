"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import type { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

function AdminConvexProvider({ children }: { children: ReactNode }) {
  if (!convex) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL is required to render the admin dashboard.",
    );
  }

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}

export function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <AdminConvexProvider>{children}</AdminConvexProvider>
    </ClerkProvider>
  );
}
