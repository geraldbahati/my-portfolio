import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { cacheLife, cacheTag } from "next/cache";
import dynamic from "next/dynamic";
import { api } from "@/convex/_generated/api";
import {
  generateBreadcrumbSchema,
  pageMetadata,
  projectWorkNode,
  SITE_NAME,
  SITE_URL,
} from "@/lib/seo";
import { PageAnalytics } from "@/components/PageAnalytics";
import { JsonLdScript } from "@/components/JsonLdScript";
import { ProjectHero } from "./_components/project-hero";
import { ProjectInfo } from "./_components/project-info";
import { ProjectGallery } from "./_components/project-gallery";
import { ProjectChallenges } from "./_components/project-challenges";
import { ProjectTestimonial } from "./_components/project-testimonial";
import { ProjectDetailSkeleton } from "./_components/project-detail-skeleton";
import {
  getProjectCacheTag,
  PROJECTS_CACHE_TAG,
} from "@/lib/data/project-cache-tags";

// Dynamic imports only for Client Components (have 'use client' directive)
const ProjectMetrics = dynamic(
  () =>
    import("./_components/project-metrics").then((mod) => ({
      default: mod.ProjectMetrics,
    })),
  {
    loading: () => (
      <div className="h-48 animate-pulse bg-muted/30 rounded-lg" />
    ),
  },
);
const ProjectVideo = dynamic(
  () =>
    import("./_components/project-video").then((mod) => ({
      default: mod.ProjectVideo,
    })),
  {
    loading: () => (
      <div className="h-96 animate-pulse bg-muted/30 rounded-lg" />
    ),
  },
);

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all published projects at build time
export async function generateStaticParams() {
  try {
    const projects = await fetchQuery(api.projects.getPublishedProjects, {});
    if (projects.length > 0) {
      return projects.map((project) => ({
        slug: project.id,
      }));
    }
  } catch (error) {
    console.warn(
      "Projects were unavailable during static generation; pages will render on demand.",
      error,
    );
  }
  // Next.js 16 with Cache Components requires at least one result;
  // return a placeholder slug that will be handled by notFound() at runtime
  return [{ slug: "_" }];
}

// Generate dynamic metadata for each project page
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  if (slug === "_") {
    return {
      title: "Project Not Found",
      robots: { index: false, follow: false },
    };
  }

  // Use the same cached function as the page component
  const data = await getProjectData(slug);

  if (!data?.project) {
    return {
      title: "Project Not Found",
      description: "The requested project could not be found.",
    };
  }

  const { project, details } = data;
  const projectTitle = project.title ?? "Project";

  const baseDescription =
    details?.tagline ?? project.description ?? `What I shipped for ${projectTitle}`;
  const projectDescription =
    baseDescription.length >= 100
      ? baseDescription
      : `${baseDescription}. A case study of production work I shipped — architecture, constraints, and the result.`;

  const projectPath = `/projects/${slug}`;

  const keywords = [
    projectTitle,
    details?.industry,
    ...(details?.services ?? []),
    "Gerald Bahati",
    "case study",
    "what I shipped",
  ].filter((k): k is string => Boolean(k));

  return pageMetadata({
    title: `${projectTitle}: What I Shipped`,
    description: projectDescription,
    path: projectPath,
    keywords,
    ogType: "article",
    publishedTime: project._creationTime
      ? new Date(project._creationTime).toISOString()
      : undefined,
    authors: [SITE_NAME],
  });
}

// Cached data fetching function
async function getProjectData(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(PROJECTS_CACHE_TAG, getProjectCacheTag(slug));

  return await fetchQuery(api.projects.getFullProjectDetails, {
    projectSlug: slug,
  });
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <>
      {/* Scroll depth on case studies is the signal for whether a project
          actually holds attention. Sections aren't marked on this page, so
          section tracking is off. */}
      <Suspense fallback={null}>
        <PageAnalytics trackSections={false} />
      </Suspense>

      <Suspense fallback={<ProjectDetailSkeleton />}>
        <ProjectContent slug={slug} />
      </Suspense>
    </>
  );
}

async function ProjectContent({ slug }: { slug: string }) {
  if (slug === "_") {
    notFound();
  }

  const data = await getProjectData(slug);

  // Not Found State
  if (data === null) {
    notFound();
  }

  const { project, details, metrics, gallery, challenges, testimonial } = data;

  const projectTitle = project?.title ?? "Project";
  const projectUrl = `${SITE_URL}/projects/${slug}`;

  const breadcrumbLd = generateBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Projects", url: `${SITE_URL}/projects` },
    { name: projectTitle, url: projectUrl },
  ]);

  const projectLd = projectWorkNode({
    slug,
    name: projectTitle,
    description: details?.tagline ?? project?.description ?? project?.alt,
    image: project?.poster,
    dateCreated: project?._creationTime,
    dateModified: project?.updatedAt,
    keywords: details?.services,
    genre: details?.industry,
    videoUrl: project?.type === "video" ? project.src : undefined,
    videoPoster: project?.poster ?? details?.videoPoster,
    testimonial: testimonial
      ? {
          quote: testimonial.quote,
          authorName: testimonial.authorName,
          authorRole: testimonial.authorRole,
          authorCompany: testimonial.authorCompany,
        }
      : null,
  });

  return (
    <>
      <JsonLdScript data={projectLd} />
      <JsonLdScript data={breadcrumbLd} />
      <main id="main-content" className="min-h-screen bg-background">
        <ProjectHero project={project} details={details} />

        <ProjectInfo details={details} />

        <ProjectChallenges challenges={challenges} />

        <ProjectGallery gallery={gallery} />

        <ProjectVideo
          videoUrl={project?.src}
          posterUrl={project?.poster}
          alt={project?.alt}
          url={project?.url}
        />

        <ProjectMetrics metrics={metrics} />

        <ProjectTestimonial testimonial={testimonial} />
      </main>
    </>
  );
}
