import { QueryCtx, MutationCtx, ActionCtx } from "./_generated/server";
import { query } from "./_generated/server";
import { v } from "convex/values";
import { isAllowedAdminEmail } from "./adminAllowlist";

// Type for user metadata with role
type UserMetadata = {
  role?: string;
  [key: string]: unknown;
};

// Type for any Convex context
type AnyCtx = QueryCtx | MutationCtx | ActionCtx;

/**
 * Check if the current user is authenticated
 * @throws Error if user is not authenticated
 */
export async function requireAuth(ctx: AnyCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity;
}

/**
 * Check if we're in development mode
 * Uses ENABLE_ADMIN environment variable to control admin access
 * Set ENABLE_ADMIN=true in Convex Dashboard for development deployment only
 */
function isDevelopment(): boolean {
  // Check if admin access is explicitly enabled via environment variable
  return process.env.ENABLE_ADMIN === "true";
}

/**
 * Check if the current user is an admin
 * @throws Error if user is not authenticated or not an admin
 * Admin access only works in development environment
 */
export async function requireAdmin(ctx: AnyCtx) {
  // First check that admin access is enabled at all
  if (!isDevelopment()) {
    throw new Error("Admin access is not enabled on this deployment");
  }

  const identity = await requireAuth(ctx);

  // The account must be on the allowlist. This is the authoritative check:
  // role metadata can be granted from the Clerk dashboard, but the allowlist
  // only changes through a reviewed commit.
  if (!isAllowedAdminEmail(identity.email)) {
    throw new Error("Unauthorized: Admin access required");
  }

  // Check if user has admin role in their public metadata
  const publicMetadata = identity.publicMetadata as UserMetadata | undefined;
  const isAdmin = publicMetadata?.role === "admin";

  if (!isAdmin) {
    throw new Error("Unauthorized: Admin access required");
  }

  return identity;
}

/**
 * Check if the current user is an admin (returns boolean instead of throwing)
 * Admin access only works in development environment
 */
export async function isAdmin(ctx: AnyCtx): Promise<boolean> {
  // Admin only works in development
  if (!isDevelopment()) return false;

  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return false;
  if (!isAllowedAdminEmail(identity.email)) return false;

  const publicMetadata = identity.publicMetadata as UserMetadata | undefined;
  return publicMetadata?.role === "admin";
}

/**
 * Public query to check if current user is an admin
 * Used for debugging and UI conditional rendering
 */
export const checkIsAdmin = query({
  args: {},
  handler: async (ctx) => {
    return await isAdmin(ctx);
  },
  returns: v.boolean(),
});
