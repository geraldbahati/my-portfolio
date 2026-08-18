import { Metadata } from "next";
import { Suspense } from "react";
import { connection } from "next/server";
import { ProjectsGrid } from "@/components/projects-grid";
import { getCachedProjects } from "@/lib/data/projects";
import { PageAnalytics } from "@/components/PageAnalytics";
import { JsonLdScript } from "@/components/JsonLdScript";
import {
  generateBreadcrumbSchema,
  PAGE_COPY,
  projectListNode,
  projectsIndexMetadata,
  SITE_URL,
} from "@/lib/seo";

export const metadata: Metadata = projectsIndexMetadata;

/**
 * Projects Grid Component - Displays the grid of projects
 *
 * This is a separate async component to enable Suspense boundaries
 * and proper cache handling for the dynamic data.
 */
async function ProjectsContent() {
  // Keep the page shell statically generated while deferring Convex access to
  // the incoming request. The cached query still makes subsequent responses
  // effectively instant.
  await connection();

  // Fetch projects with aggressive caching (7 days)
  const projects = await getCachedProjects();

  // Generate JSON-LD structured data for SEO
  const structuredData = projectListNode(projects);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <JsonLdScript data={structuredData} />

      {/* Projects Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <ProjectsGrid projects={projects} />
      </section>
    </>
  );
}

/**
 * Projects Grid Skeleton - Loading state
 */
function ProjectsGridSkeleton() {
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-20 md:pt-24 lg:pt-32">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-video bg-muted animate-pulse rounded-lg"
          />
        ))}
      </div>
    </section>
  );
}

/**
 * Projects Page - Cached with Cache Components
 *
 * This page uses Suspense boundaries to enable Partial Prerendering (PPR).
 * The static header is pre-rendered, while the dynamic projects content
 * streams in with cached data for optimal performance.
 *
 * Cache strategy:
 * - Projects are cached for 7 days (configured in getCachedProjects)
 * - Use revalidateTag("projects") to invalidate cache when projects change
 * - Static shell (header) renders instantly
 * - Projects content streams in (usually instant from cache)
 */
export default function ProjectsPage() {
  const breadcrumbLd = generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Projects", url: `${SITE_URL}/projects` },
  ]);

  return (
    <main id="main-content" className="min-h-screen bg-background">
      <JsonLdScript data={breadcrumbLd} />
      <PageAnalytics />
      {/* Page Header - Static, always pre-rendered */}
      <header className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 md:pt-24 lg:pt-32 pb-12">
        <h1
          className="text-4xl lg:text-6xl font-bold mb-6 text-foreground"
          style={{ fontSize: "2.25rem" }}
        >
          Projects I shipped
        </h1>
        <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">
          {PAGE_COPY.projects.description} Each case study covers the problem,
          the architecture, and the result.
        </p>
      </header>

      {/* Separator Line */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <hr className="border-border mb-12" />
      </div>

      {/* Projects Content - Dynamic, with Suspense boundary */}
      <Suspense fallback={<ProjectsGridSkeleton />}>
        <ProjectsContent />
      </Suspense>
    </main>
  );
}
