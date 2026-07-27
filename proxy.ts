import { clerkMiddleware } from "@clerk/nextjs/server";

// Clerk still needs to run so auth() is available to server resources.
// Authorization lives in the admin layout, following Clerk v7's
// resource-based protection model.
export default clerkMiddleware();

export const config = {
  // Allow-list rather than deny-list: run Clerk only where a session is
  // actually consulted.
  //
  // `auth.protect()` in the admin layout requires clerkMiddleware to have run
  // on that request, so /admin must stay matched. Nothing outside it does —
  // ClerkProvider is commented out in the root layout, no public route calls
  // auth() or currentUser(), and Convex's requireAdmin authenticates through
  // the Convex/Clerk JWT rather than this middleware.
  //
  // The previous deny-list ran Clerk on every public page view, which cost an
  // anonymous visitor a full handshake for a session that was never read.
  matcher: ["/admin(.*)", "/(api|trpc)(.*)"],
};
