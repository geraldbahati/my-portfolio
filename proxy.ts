import { clerkMiddleware } from "@clerk/nextjs/server";

// Clerk still needs to run so auth() is available to server resources.
// Authorization lives in the admin layout, following Clerk v7's
// resource-based protection model.
export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals, observability tunnels, and all static files,
    // unless found in search params. Running Clerk on monitoring requests
    // would add latency and cookies to traffic that needs neither.
    "/((?!_next|gbx|monitoring|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
