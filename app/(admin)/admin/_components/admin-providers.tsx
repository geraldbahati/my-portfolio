"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import {
  Authenticated,
  AuthLoading,
  ConvexReactClient,
  Unauthenticated,
} from "convex/react";
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
      <AuthLoading>
        <AdminAuthStatus>Verifying admin session…</AdminAuthStatus>
      </AuthLoading>
      <Unauthenticated>
        <AdminAuthStatus isError>
          The admin session could not be verified.
        </AdminAuthStatus>
      </Unauthenticated>
      <Authenticated>{children}</Authenticated>
    </ConvexProviderWithClerk>
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
