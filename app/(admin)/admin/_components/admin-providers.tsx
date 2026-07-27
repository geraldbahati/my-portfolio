"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useEffect, useState, type ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

function AdminConvexProvider({ children }: { children: ReactNode }) {
  const { getToken, isLoaded, isSignedIn, sessionClaims } = useAuth();
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    if (!convex || !isLoaded || !isSignedIn) return;

    convex.setAuth(
      ({ forceRefreshToken }) =>
        getToken({
          ...(sessionClaims?.aud === "convex"
            ? {}
            : { template: "convex" as const }),
          skipCache: forceRefreshToken,
        }),
      (authenticated) => setIsAuthReady(authenticated),
    );

    return () => convex.clearAuth();
  }, [getToken, isLoaded, isSignedIn, sessionClaims?.aud]);

  if (!convex) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL is required to render the admin dashboard.",
    );
  }

  return (
    <ConvexProvider client={convex}>
      {isAuthReady ? children : null}
    </ConvexProvider>
  );
}

export function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <AdminConvexProvider>{children}</AdminConvexProvider>
    </ClerkProvider>
  );
}
