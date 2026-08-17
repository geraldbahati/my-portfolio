import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

// The admin dashboard is closed unless NEXT_PUBLIC_ENABLE_ADMIN is explicitly
// "true", so the safe default survives a missing or misspelled variable. When
// it is closed the route is rejected here, without initializing Clerk or
// requiring Clerk credentials — which is what keeps a Clerk misconfiguration
// from being able to affect the public site.
//
// When open, Clerk runs for /admin only, so auth() is available to the
// resource-level checks in the admin layout. Authorization is still enforced
// again in the layout (admin role) and at every Convex admin function through
// requireAdmin().
const adminEnabled = process.env.NEXT_PUBLIC_ENABLE_ADMIN === "true";

const adminProxy = adminEnabled
  ? clerkMiddleware()
  : (request: NextRequest) => NextResponse.redirect(new URL("/", request.url));

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
