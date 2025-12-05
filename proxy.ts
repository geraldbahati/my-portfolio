import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define routes that require authentication
const isProtectedRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // Protect all admin routes - only accessible in development
  if (isProtectedRoute(req)) {
    // Block admin access in production
    if (process.env.NODE_ENV === 'production') {
      return Response.redirect(new URL('/', req.url));
    }

    // In development: require authentication AND admin role
    await auth.protect();

    // Then, check if user has admin role
    const { sessionClaims } = await auth();
    const publicMetadata = sessionClaims?.publicMetadata as { role?: string } | undefined;
    const isAdmin = publicMetadata?.role === 'admin';

    if (!isAdmin) {
      // Redirect to home page or show unauthorized error
      return Response.redirect(new URL('/', req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
