import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

// Production does not expose the development-only admin dashboard, so it can
// reject the route without initializing Clerk or requiring Clerk credentials.
// In development, Clerk runs only for /admin so auth() is available to the
// resource-level checks in the admin layout.
const adminProxy =
  process.env.NODE_ENV === "production"
    ? (request: NextRequest) =>
        NextResponse.redirect(new URL("/", request.url))
    : clerkMiddleware();

export default adminProxy;

export const config = {
  // Clerk is an admin-only dependency. Public pages and public API routes do
  // not read sessions, so they bypass Clerk entirely.
  //
  // `auth.protect()` in the admin layout requires clerkMiddleware to have run
  // on that request. Authorization remains enforced again at each Convex
  // admin function through requireAdmin().
  matcher: ["/admin/:path*"],
};
