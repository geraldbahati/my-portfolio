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
const CACHE_TAG_PATTERN =
  /^(?:projects|project-navigation|project-[a-z0-9]+(?:-[a-z0-9]+)*)$/;
const MAX_TAGS_PER_REQUEST = 20;

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
    if (body.tags !== undefined) {
      if (
        !Array.isArray(body.tags) ||
        body.tags.length === 0 ||
        body.tags.length > MAX_TAGS_PER_REQUEST ||
        !body.tags.every(
          (tag): tag is string =>
            typeof tag === "string" && CACHE_TAG_PATTERN.test(tag),
        )
      ) {
        return NextResponse.json(
          { revalidated: false, message: "Invalid cache tags" },
          { status: 400 },
        );
      }

      tags = [...new Set(body.tags)];
    }
  } catch {
    // No/invalid body → fall back to default tags.
  }

  for (const tag of tags) {
    revalidateTag(tag, "max");
  }

  return NextResponse.json({ revalidated: true, tags, now: Date.now() });
}
