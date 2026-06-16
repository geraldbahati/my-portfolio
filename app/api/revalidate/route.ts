import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

/**
 * On-demand cache revalidation endpoint.
 *
 * Called by Convex admin actions after a project/FAQ mutation so the cached
 * home page (and project pages) reflect changes without waiting for the
 * time-based `cacheLife`. Uses `revalidateTag(tag, "max")` for stale-while-
 * revalidate semantics (works with `cacheComponents`).
 *
 * Auth: a shared secret in the `x-revalidate-secret` header, matched against
 * the `REVALIDATE_SECRET` env var.
 */

const DEFAULT_TAGS = ["projects"];

export async function POST(req: NextRequest) {
  const expected = process.env.REVALIDATE_SECRET;
  const provided = req.headers.get("x-revalidate-secret");

  if (!expected || provided !== expected) {
    return NextResponse.json(
      { revalidated: false, message: "Invalid or missing secret" },
      { status: 401 },
    );
  }

  let tags = DEFAULT_TAGS;
  try {
    const body = (await req.json()) as { tags?: unknown };
    if (
      Array.isArray(body.tags) &&
      body.tags.every((t): t is string => typeof t === "string") &&
      body.tags.length > 0
    ) {
      tags = body.tags;
    }
  } catch {
    // No/invalid body → fall back to default tags.
  }

  for (const tag of tags) {
    revalidateTag(tag, "max");
  }

  return NextResponse.json({ revalidated: true, tags, now: Date.now() });
}
