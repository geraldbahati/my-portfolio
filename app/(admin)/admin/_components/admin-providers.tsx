"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { useEffect, useState, type ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

function AdminConvexProvider({ children }: { children: ReactNode }) {
  const { getToken, isLoaded, isSignedIn, sessionClaims, userId } = useAuth();
  const [authenticatedUserId, setAuthenticatedUserId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!convex || !isLoaded || !isSignedIn || !userId) return;

    let isActive = true;

    convex.setAuth(
      ({ forceRefreshToken }) =>
        getToken({
          ...(sessionClaims?.aud === "convex"
            ? {}
            : { template: "convex" as const }),
          skipCache: forceRefreshToken,
        }),
      (authenticated) => {
        if (isActive) {
          setAuthenticatedUserId(authenticated ? userId : null);
        }
      },
    );

    return () => {
      isActive = false;
      convex.clearAuth();
    };
  }, [getToken, isLoaded, isSignedIn, sessionClaims?.aud, userId]);

  if (!convex) {
    throw new Error(
      "NEXT_PUBLIC_CONVEX_URL is required to render the admin dashboard.",
    );
  }

  const isAuthReady =
    isLoaded &&
    isSignedIn &&
    userId !== null &&
    authenticatedUserId === userId;

  return (
    <ConvexProvider client={convex}>
      {!isLoaded || (isSignedIn && !isAuthReady) ? (
        <AdminAuthStatus>Verifying admin session…</AdminAuthStatus>
      ) : null}
      {isLoaded && !isSignedIn ? (
        <AdminAuthStatus isError>
          The admin session could not be verified.
        </AdminAuthStatus>
      ) : null}
      {isAuthReady ? children : null}
    </ConvexProvider>
  );
}

function AdminAuthStatus({
  children,
  isError = false,
}: {
  children: ReactNode;
  isError?: boolean;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <p
        className={isError ? "text-destructive" : "text-muted-foreground"}
        role={isError ? "alert" : "status"}
      >
        {children}
      </p>
    </main>
  );
}

export function AdminProviders({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <AdminConvexProvider>{children}</AdminConvexProvider>
    </ClerkProvider>
  );
}
