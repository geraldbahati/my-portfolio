/**
 * Webline Technologies Ltd. — portfolio entries
 *
 * Replaces the earlier placeholder `webline-store` record (which pointed at
 * /placeholder-video.mp4 and had no real gallery) with two fully-populated
 * projects built from the real production applications:
 *
 *   1. webline-technologies — the corporate marketing site
 *   2. webline-store        — the e-commerce storefront
 *
 * Media is already uploaded:
 *   video  → Cloudflare Stream (HLS)
 *   images → R2, served from media.geraldbahati.dev/webline/*
 *
 * Run with:
 *   npx convex run seedWeblineTechnologies:seedWeblineTechnologies
 */

import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

const STREAM = "https://customer-pdxnd9di8ybc2kur.cloudflarestream.com";
const MEDIA = "https://media.geraldbahati.dev/webline";

const LANDING_UID = "5874f6a9938431958ee99e5c9354c9b5";
const STORE_UID = "462887d50ef66397070188e779015139";

const img = (name: string) => `${MEDIA}/${name}.webp`;
const hls = (uid: string) => `${STREAM}/${uid}/manifest/video.m3u8`;
const thumb = (uid: string) => `${STREAM}/${uid}/thumbnails/thumbnail.jpg`;

// =============================================================================
// 1 — Webline Technologies (corporate site)
// =============================================================================

const WEBLINE_TECHNOLOGIES = {
  project: {
    id: "webline-technologies",
    title: "Webline Technologies",
    description:
      "Corporate site for a Nairobi technology integrator, built as a scroll-driven narrative with pinned scenes and a multi-zone architecture that hands off seamlessly to the storefront.",
    src: hls(LANDING_UID),
    type: "video" as const,
    poster: thumb(LANDING_UID),
    alt: "Webline Technologies corporate site — scroll-driven service narrative",
    url: "https://webline.co.ke",
    badges: [
      { text: "Corporate Site", position: "bottom-left" as const },
      { text: "Motion Design", position: "bottom-right" as const },
    ],
    aspectRatio: "16/9",
    order: 0,
    isPublished: true,
  },

  details: {
    heroImage: img("landing-scene-01"),
    heroAlt: "Webline Technologies hero — 'Technology that keeps business moving'",
    tagline: "Technology that keeps business moving",
    videoUrl: hls(LANDING_UID),
    videoPoster: thumb(LANDING_UID),
    videoAlt: "Full walkthrough of the Webline Technologies corporate site",
    client: "Webline Technologies Ltd.",
    industry: "Technology / Managed IT Services",
    period: "2026",
    year: 2026,
    services: [
      "Brand & Narrative Design",
      "Front-End Engineering",
      "Motion / Scroll Design",
      "Multi-Zone Architecture",
      "Technical SEO",
      "Performance Engineering",
    ],
    features: [
      "Scroll-driven pinned scenes (GSAP ScrollSmoother)",
      "Five service pillars as full-bleed chapters",
      "Multi-zone hand-off to the storefront",
      "Server-rendered, fully static shell",
      "Structured data + generated sitemap",
      "Accessible reduced-motion fallbacks",
    ],
    colorPalette: [
      { hex: "#F2EFE9", name: "Bone" },
      { hex: "#0B0B0B", name: "Ink" },
      { hex: "#1D4ED8", name: "Signal Blue" },
      { hex: "#8A8578", name: "Warm Grey" },
    ],
    relatedProjectIds: ["webline-store"],
    fullDescription: `## Overview

Webline Technologies Ltd. is a Nairobi-based technology integrator selling infrastructure, workplace hardware, security systems and managed support. The brief was a corporate site that reads like a considered argument rather than a brochure — and that hands visitors to the storefront without the seam showing.

The result is a single scroll-driven narrative. Five service pillars are presented as full-bleed chapters that pin in place while their imagery moves behind the copy, so the page advances at reading pace instead of dumping a wall of cards.

## Architecture

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 16 (App Router), React 19 |
| **Styling** | Tailwind CSS 4 |
| **Motion** | GSAP ScrollSmoother, pinned scroll scenes |
| **Rendering** | Fully static shell, server components |
| **Zoning** | Reverse-proxy rewrites to the storefront deployment |
| **Hosting** | Vercel |

## Multi-zone architecture

The marketing site and the storefront are separate Next.js deployments that appear as one domain. \`webline.co.ke\` serves the corporate experience; \`/store/*\` is rewritten to the storefront deployment, which runs with its own \`basePath\`.

Getting this right required moving the proxy rewrites into \`beforeFiles\`. Vercel's router rewrites RSC segment-prefetch requests to \`.segments/*.segment.rsc\` paths *before* \`afterFiles\` rewrites run, which 404'd every prefetch crossing the zone boundary. Running the proxy earlier in the chain lets those requests reach the store deployment intact.

## Motion without the cost

The scroll narrative is deliberately cheap to run. Scenes are pinned rather than duplicated, imagery is served through the Next image pipeline in AVIF/WebP, and every animation is gated behind an intersection observer so nothing animates off-screen. The page ships as a static shell — there is no data fetching on the critical path.

## Why it matters

The site's job is to establish credibility before a visitor ever reaches a product page. Treating the five service pillars as chapters — each with its own imagery, colour and pace — gives the company room to explain what it actually does, then routes intent straight into the catalogue.`,
  },

  metrics: [
    { value: "3ms", label: "Time to first byte", icon: "zap" },
    { value: "100%", label: "Static shell coverage", icon: "layers" },
    { value: "5", label: "Service pillars", icon: "layout" },
    { value: "1", label: "Domain, two deployments", icon: "globe" },
  ],

  challenges: [
    {
      title: "Challenge: One domain, two applications",
      content: `The marketing site and the storefront are different applications with different rendering strategies, release cadences and teams — but visitors should never perceive a boundary.

**Approach.** A multi-zone setup: the corporate site owns the domain root and reverse-proxies \`/store/*\` to the storefront deployment, which runs under a matching \`basePath\`.

**The subtle failure.** Cross-zone client navigation silently broke. Next's segment prefetch requests carry a \`Next-Router-Segment-Prefetch\` header, and Vercel's router rewrites them to \`.segments/*.segment.rsc\` paths *before* \`afterFiles\` rewrites are evaluated — so every prefetch across the boundary 404'd. Moving the proxy into \`beforeFiles\` puts it ahead of that transform and the requests reach the store intact.`,
      order: 0,
    },
    {
      title: "Challenge: Narrative pacing on a scroll-driven page",
      content: `A conventional stacked-section layout would have made five service pillars feel like a list to skim past.

**Approach.** Each pillar pins to the viewport while its background imagery and copy move independently, so scrolling advances a chapter rather than travelling a distance. GSAP ScrollSmoother drives the timeline.

**Trade-off, stated plainly.** Pinned scroll layouts render inside a \`position: fixed\` wrapper, which means the document itself is an empty spacer. Anything that assumes a tall document — full-page screenshot tooling, some crawlers, naive print styles — sees blank space. That was an accepted cost for the pacing, mitigated with server-rendered content and structured data so machines read the markup, not the scroll position.`,
      order: 1,
    },
    {
      title: "Challenge: Motion that stays cheap",
      content: `Scroll-driven imagery is an easy way to build a page that feels expensive and performs badly.

**Approach.** Scenes pin rather than duplicate, so the DOM stays small. Imagery goes through the Next image pipeline with AVIF/WebP negotiation and explicit sizes. Every reveal is gated behind an intersection observer, and the whole page is a static shell — no data fetching on the critical path, which is why TTFB sits at single-digit milliseconds.`,
      order: 2,
    },
  ],

  // ProjectGallery renders `feature` as the left column — its own comment calls
  // it the "Long Scrolling Screenshot" — and `stack` as the right-hand column of
  // mockups. So the tall header-to-footer capture belongs in `feature`, and the
  // landscape scene shots stack beside it. (`deviceType` is stored but the
  // component never reads it.)
  gallery: [
    { src: img("landing-homepage-full"), alt: "Full Webline Technologies homepage, header to footer", caption: "The complete page, top to bottom", galleryType: "feature" as const, width: 1400, height: 7876, deviceType: "full-width" as const, order: 0 },
    { src: img("landing-scene-01"), alt: "Hero — 'Technology that keeps business moving' with drifting image collage", caption: "Hero: an animated collage assembles as the page settles", galleryType: "stack" as const, width: 2400, height: 1350, deviceType: "desktop" as const, order: 1 },
    { src: img("landing-scene-02"), alt: "Infrastructure chapter — resilient networks", caption: "Each service pillar pins as a full-bleed chapter", galleryType: "stack" as const, width: 2400, height: 1350, deviceType: "desktop" as const, order: 2 },
    { src: img("landing-scene-04"), alt: "Connected security chapter", caption: "Imagery moves behind pinned copy as you scroll", galleryType: "stack" as const, width: 2400, height: 1350, deviceType: "desktop" as const, order: 3 },
    { src: img("landing-scene-06"), alt: "Positioning statement", caption: "The argument, stated once, in full", galleryType: "stack" as const, width: 2400, height: 1350, deviceType: "desktop" as const, order: 4 },
    { src: img("landing-scene-09"), alt: "Leadership quote section", caption: "Leadership quote closes the narrative", galleryType: "stack" as const, width: 2400, height: 1350, deviceType: "desktop" as const, order: 5 },
    { src: img("landing-scene-10"), alt: "Closing section and footer", caption: "'Built for today, ready for what's next' — closing and footer", galleryType: "stack" as const, width: 2400, height: 1350, deviceType: "desktop" as const, order: 6 },
  ],
};

// =============================================================================
// 2 — Webline Store (e-commerce storefront)
// =============================================================================

const WEBLINE_STORE = {
  project: {
    id: "webline-store",
    title: "Webline Store",
    description:
      "Edge-first e-commerce storefront on Cloudflare Workers — partial prerendering, tag-driven cache invalidation, dynamic product variants and AI-assisted recommendations.",
    src: hls(STORE_UID),
    type: "video" as const,
    poster: thumb(STORE_UID),
    alt: "Webline Store — edge-first e-commerce storefront",
    url: "https://webline.co.ke/store",
    badges: [
      { text: "E-commerce", position: "bottom-left" as const },
      { text: "Edge / Workers", position: "bottom-right" as const },
    ],
    aspectRatio: "16/9",
    order: 1,
    isPublished: true,
  },

  details: {
    heroImage: img("store-01-hero"),
    heroAlt: "Webline Store homepage hero",
    tagline: "A catalogue that loads before you finish clicking",
    videoUrl: hls(STORE_UID),
    videoPoster: thumb(STORE_UID),
    videoAlt: "Walkthrough of the Webline Store — home, product detail, recommendations, catalogue",
    client: "Webline Technologies Ltd.",
    industry: "E-commerce / Technology Retail",
    period: "2026",
    year: 2026,
    services: [
      "Full-Stack Engineering",
      "Edge Architecture",
      "Performance Engineering",
      "Design Systems",
      "Payments Integration",
      "Search & Merchandising",
    ],
    features: [
      "Partial prerendering with tag-driven invalidation",
      "Dynamic variant system — any option type, not just size/colour",
      "Server-driven faceted search with cross-narrowed counts",
      "Anonymous carts that merge on sign-in",
      "Atomic inventory reservation at checkout",
      "M-Pesa, Paystack and PayPal payment paths",
    ],
    colorPalette: [
      { hex: "#FFFFFF", name: "Paper" },
      { hex: "#0B0B0B", name: "Ink" },
      { hex: "#1D4ED8", name: "Action Blue" },
      { hex: "#F4F4F5", name: "Surface" },
    ],
    relatedProjectIds: ["webline-technologies"],
    fullDescription: `## Overview

The storefront for Webline Technologies — a full commerce platform running on Cloudflare's edge. It shares a domain with the corporate site through a multi-zone setup, but is a separate Next.js 16 application with its own rendering strategy, backed by Workers, D1 and KV.

The engineering priority was straightforward: a catalogue should feel instant, and it should stay correct when the catalogue changes.

## Architecture

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16 (Cache Components / PPR), React 19, Tailwind CSS 4 |
| **API** | Hono + oRPC (end-to-end typed RPC) on Cloudflare Workers |
| **Database** | Cloudflare D1 (SQLite) + Drizzle ORM |
| **Caching** | Edge KV, Next.js \`use cache\`, TanStack Query |
| **Async** | Cloudflare Queues (orders, stock, cart recovery) |
| **Storage** | R2 for product media |
| **Auth** | Better Auth — 2FA, passkeys, organisations, anonymous sessions |

## Rendering model

Every page is a prerendered static shell with dynamic holes streamed at request time. Product pages are generated for the entire catalogue at build, so a product-to-product navigation is served from the shell with no API round-trip — measured at around 47ms from click to painted page.

Cache lifetimes are deliberately long, because freshness is event-driven rather than time-driven: dashboard mutations push tags such as \`product-<slug>\` to a revalidation endpoint, so an edit lands immediately instead of waiting out a TTL. Stock is re-checked atomically at order time, so a slightly stale badge can never oversell.

## Dynamic variants

Variants are not hard-coded to size and colour. Each variant carries an arbitrary options object — \`{ color, size, storage, ram }\` — which is aggregated into the option types a product actually has. The UI renders swatches for colour and button groups for everything else, and URL state encodes selections as JSON so a filtered view is shareable.

## Search and merchandising

A single faceted-search procedure returns the page of products, cross-narrowed facet counts and pagination in one call, so filter counts stay truthful as selections narrow. Popular unfiltered queries are cached at the edge; filtered queries go straight to the database to avoid polluting the cache.

## Commerce mechanics

Anonymous visitors get a real cart backed by an HTTP-only session cookie. On sign-up the anonymous cart merges into the account — quantities summed, capped at available stock. Inventory is reserved synchronously with optimistic D1 updates at checkout, so concurrent buyers cannot oversell a line; queues handle only the soft work afterwards, such as payment reminders and abandoned-cart recovery.`,
  },

  metrics: [
    { value: "3ms", label: "Time to first byte", icon: "zap" },
    { value: "47ms", label: "Product-to-product navigation", icon: "mouse-pointer-click" },
    { value: "24ms", label: "Search response, from 715ms", icon: "search" },
    { value: "391KB", label: "JS per page, from 454KB", icon: "package" },
  ],

  challenges: [
    {
      title: "Challenge: Making the catalogue feel instant",
      content: `A storefront lives or dies on how quickly a shopper can move between products.

**Approach.** Partial prerendering puts a static shell in front of every route, and \`generateStaticParams\` prerenders the whole product catalogue at build time. A product-to-product click is therefore served from the shell — no API call on the critical path.

**Measured.** Time to first byte sits at ~3ms; a click paints the next product in ~47ms. Fast enough that the route-level loading skeleton never gets a chance to appear, which is the intended outcome rather than a missing state.`,
      order: 0,
    },
    {
      title: "Challenge: Cache that is fast *and* correct",
      content: `Long cache lifetimes make a catalogue quick and make it wrong. Short ones keep it honest and make it slow.

**Approach.** Decouple freshness from time. Every cached read is tagged — \`products\`, \`categories\`, \`product-<slug>\` — and dashboard mutations push those tags to a revalidation endpoint, so an edit invalidates precisely what it touched, immediately. Lifetimes then exist only as a backstop.

**Result.** Search dropped from 715ms to 24ms and category pages from 1325ms to 760ms, with edits still landing instantly. Correctness where it matters is enforced separately: stock is re-checked atomically when an order is placed, so a stale badge cannot oversell.`,
      order: 1,
    },
    {
      title: "Challenge: A variant system that survives the catalogue",
      content: `Hard-coding size and colour is fine until the catalogue includes laptops with RAM and storage tiers, printers with ink configurations, and networking kit with no variants at all.

**Approach.** Each variant stores an arbitrary options object, and the option *types* a product supports are derived from its variants rather than declared up front. The UI adapts — colour swatches, button groups for everything else — and selections are encoded into URL state as JSON so any configuration is shareable.

**Payoff.** Adding a new dimension is a data change, not a schema migration and a UI rewrite.`,
      order: 2,
    },
    {
      title: "Challenge: Carts before customers",
      content: `Requiring sign-in before adding to a cart costs conversions; throwing the cart away at sign-up costs trust.

**Approach.** Anonymous visitors get a real server-side cart keyed to an HTTP-only session cookie — no localStorage, one source of truth. On sign-up or sign-in the anonymous cart merges into the account: duplicate lines have their quantities summed and capped at available stock, and a merge failure is logged without blocking authentication.

**Detail that matters.** Inventory is reserved synchronously with optimistic updates against D1 at checkout, so two shoppers racing for the last unit resolve deterministically. Queues carry only the soft work afterwards.`,
      order: 3,
    },
  ],

  // Same arrangement: header-to-footer capture in the left `feature` column,
  // component close-ups stacked on the right.
  gallery: [
    { src: img("store-homepage-full"), alt: "Full Webline Store homepage, header to footer", caption: "The complete homepage, top to bottom", galleryType: "feature" as const, width: 1400, height: 4776, deviceType: "full-width" as const, order: 0 },
    { src: img("store-01-hero"), alt: "Webline Store homepage hero and category tiles", caption: "Hero carousel over a six-category grid", galleryType: "stack" as const, width: 2400, height: 1350, deviceType: "desktop" as const, order: 1 },
    { src: img("store-09-product-detail"), alt: "Product detail page with gallery, key features and specifications", caption: "Product detail — gallery, features, full specification table", galleryType: "stack" as const, width: 2400, height: 1350, deviceType: "desktop" as const, order: 2 },
    { src: img("store-13-catalogue"), alt: "Full product catalogue with faceted filters", caption: "Catalogue with server-driven faceted search", galleryType: "stack" as const, width: 2400, height: 1350, deviceType: "desktop" as const, order: 3 },
    { src: img("store-10-goes-great-with"), alt: "'Goes great with' recommendation module", caption: "Recommendations with inline variant selection and add-to-cart", galleryType: "stack" as const, width: 1552, height: 796, deviceType: "tablet" as const, order: 4 },
    { src: img("store-03-mega-menu"), alt: "Store navigation mega menu open", caption: "Category navigation", galleryType: "stack" as const, width: 2400, height: 620, deviceType: "desktop" as const, order: 5 },
    { src: img("store-07-product-card"), alt: "Product card hover state revealing quick add", caption: "Product card reveals quick-add on hover", galleryType: "stack" as const, width: 860, height: 1144, deviceType: "mobile" as const, order: 6 },
  ],
};

// =============================================================================
// Mutation
// =============================================================================

async function purgeProject(ctx: any, slug: string) {
  const existing = await ctx.db
    .query("projects")
    .withIndex("by_project_id", (q: any) => q.eq("id", slug))
    .first();
  if (!existing) return 0;

  const pid = existing._id as Id<"projects">;
  let removed = 0;
  for (const table of [
    "projectDetails",
    "projectMetrics",
    "projectChallenges",
    "projectGallery",
    "projectTestimonials",
  ] as const) {
    const rows = await ctx.db
      .query(table)
      .withIndex("by_project", (q: any) => q.eq("projectId", pid))
      .collect();
    for (const r of rows) {
      await ctx.db.delete(r._id);
      removed++;
    }
  }
  await ctx.db.delete(pid);
  return removed + 1;
}

async function insertProject(ctx: any, data: any, now: number) {
  const projectId = await ctx.db.insert("projects", {
    ...data.project,
    createdAt: now,
    updatedAt: now,
  });

  await ctx.db.insert("projectDetails", {
    projectId,
    ...data.details,
    createdAt: now,
    updatedAt: now,
  });

  for (const [i, m] of data.metrics.entries()) {
    await ctx.db.insert("projectMetrics", {
      projectId,
      ...m,
      order: i,
      createdAt: now,
      updatedAt: now,
    });
  }

  for (const c of data.challenges) {
    await ctx.db.insert("projectChallenges", {
      projectId,
      ...c,
      createdAt: now,
      updatedAt: now,
    });
  }

  for (const g of data.gallery) {
    await ctx.db.insert("projectGallery", {
      projectId,
      ...g,
      createdAt: now,
      updatedAt: now,
    });
  }

  return projectId;
}

export const seedWeblineTechnologies = internalMutation({
  args: { dryRun: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const now = Date.now();
    const log: string[] = [];

    if (args.dryRun) {
      for (const slug of ["webline-store", "webline-technologies"]) {
        const p = await ctx.db
          .query("projects")
          .withIndex("by_project_id", (q) => q.eq("id", slug))
          .first();
        log.push(`${slug}: ${p ? `EXISTS (order ${p.order}, published ${p.isPublished})` : "absent"}`);
      }
      return { dryRun: true, log };
    }

    // Replace any previous versions of both slugs.
    log.push(`purged webline-store: ${await purgeProject(ctx, "webline-store")} docs`);
    log.push(`purged webline-technologies: ${await purgeProject(ctx, "webline-technologies")} docs`);

    await insertProject(ctx, WEBLINE_TECHNOLOGIES, now);
    log.push("inserted webline-technologies (order 0)");

    await insertProject(ctx, WEBLINE_STORE, now);
    log.push("inserted webline-store (order 1)");

    // Renumber every remaining project sequentially after the two new entries.
    // A relative bump (order + 2) collided whenever two projects already
    // shared a slot, so assign absolute positions instead.
    const others = (await ctx.db.query("projects").collect())
      .filter((p) => p.id !== "webline-technologies" && p.id !== "webline-store")
      .sort((a, b) => a.order - b.order || a.createdAt - b.createdAt);

    for (const [i, p] of others.entries()) {
      const nextOrder = i + 2;
      if (p.order !== nextOrder) {
        await ctx.db.patch(p._id, { order: nextOrder, updatedAt: now });
        log.push(`reordered ${p.id}: ${p.order} → ${nextOrder}`);
      }
    }

    return { ok: true, log };
  },
});
