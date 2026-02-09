import { Metadata } from "next";
import { cacheLife } from "next/cache";
import { Suspense } from "react";
import { ProjectsGrid } from "@/components/projects-grid";
import { getCachedProjects } from "@/lib/data/projects";
import { PageAnalytics } from "@/components/PageAnalytics";
import { generateBreadcrumbSchema } from "@/lib/seo";

// SEO Metadata
export const metadata: Metadata = {
  title: "Projects - Creative Digital Solutions & Web Development",
  description:
    "Explore my portfolio of creative digital projects including web development, UI/UX design, and innovative digital solutions. Each project showcases quality craftsmanship and sustainable results.",
  keywords: [
    "portfolio",
    "projects",
    "web development",
    "interactive design",
    "UI/UX",
    "digital solutions",
    "creative development",
  ],
  openGraph: {
    title: "Projects - Creative Digital Solutions & Web Development",
    description:
      "Explore my portfolio of creative digital projects including web development, UI/UX design, and innovative digital solutions with sustainable results.",
    type: "website",
    url: "/projects",
  },
  twitter: {
    card: "summary_large_image",
    title: "Projects - Creative Digital Solutions & Web Development",
    description:
      "Explore my portfolio of creative digital projects including web development, UI/UX design, and innovative digital solutions with sustainable results.",
  },
  alternates: {
    canonical: "/projects",
  },
};

/**
 * Projects Grid Component - Displays the grid of projects
 *
 * This is a separate async component to enable Suspense boundaries
 * and proper cache handling for the dynamic data.
 */
async function ProjectsContent() {
  // Fetch projects with aggressive caching (7 days)
  const projects = await getCachedProjects();

  // Generate JSON-LD structured data for SEO
  const baseUrl = "https://geraldbahati.dev";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Portfolio Projects",
    description:
      "A curated selection of projects showcasing creative digital solutions",
    url: `${baseUrl}/projects`,
    numberOfItems: projects.length,
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "CreativeWork",
        "@id": `${baseUrl}/projects/${project.id}`,
        name: project.title,
        description: project.description || project.alt,
        image: project.poster || project.src,
        url: `${baseUrl}/projects/${project.id}`,
        keywords: project.badges?.map((b) => b.text).join(", "),
      },
    })),
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

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
export default async function ProjectsPage() {
  "use cache";
  cacheLife("hours");

  const breadcrumbLd = generateBreadcrumbSchema([
    { name: "Home", url: "https://geraldbahati.dev" },
    { name: "Projects", url: "https://geraldbahati.dev/projects" },
  ]);

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <PageAnalytics trackPageView trackScroll trackTime />
      {/* Page Header - Static, always pre-rendered */}
      <header className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 md:pt-24 lg:pt-32 pb-12">
        <h1
          className="text-4xl lg:text-6xl font-bold mb-6 text-foreground"
          style={{ fontSize: "2.25rem" }}
        >
          Projects
        </h1>
        <p className="text-base text-muted-foreground max-w-3xl leading-relaxed">
          Creative digital advancement – get to know my approach and style
          through a selection of my projects. Each project represents{" "}
          <strong className="font-semibold text-foreground">
            quality, well-thought-out structures, and sustainable digital
            solutions
          </strong>{" "}
          that deliver measurable results.
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
