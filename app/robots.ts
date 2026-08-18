import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const PUBLIC_DISALLOW = ["/api/", "/admin/"];

/**
 * Explicit allow-rules for AI search crawlers. The wildcard already permits
 * them; listing them stops a later `Disallow` from silently applying and
 * makes the intent obvious in Search Console / CDN logs.
 */
const AI_SEARCH_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
] as const;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: PUBLIC_DISALLOW,
      },
      ...AI_SEARCH_AGENTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: PUBLIC_DISALLOW,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
