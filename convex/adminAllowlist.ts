/**
 * The only accounts permitted to reach the admin dashboard.
 *
 * Deliberately a hardcoded constant rather than an environment variable: the
 * dashboard can edit and delete every project, FAQ and contact submission, so
 * changing who can reach it should require a reviewed commit, not a dashboard
 * click. These addresses are already public in the repo's commit history.
 *
 * Imported by BOTH gates so they can never drift apart:
 *   - app/(admin)/admin/layout.tsx  — decides whether the UI renders
 *   - convex/auth.ts requireAdmin() — decides whether a mutation runs
 *
 * The Convex gate is the one that actually matters; the layout gate only stops
 * someone loading a dashboard that would fail every call anyway.
 */
export const ADMIN_EMAILS = [
  "journeytoharvard@gmail.com",
  "bahatigerald0@gmail.com",
] as const;

/** Case- and whitespace-insensitive membership test. */
export function isAllowedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ADMIN_EMAILS.some((allowed) => allowed === normalized);
}
