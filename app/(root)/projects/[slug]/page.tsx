import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { cacheLife, cacheTag } from "next/cache";
import dynamic from "next/dynamic";
import { api } from "@/convex/_generated/api";
import {
  generateBreadcrumbSchema,
  PERSON_ID,
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

  // Build description ensuring at least 100 characters for social media
  const baseDescription =
    details?.tagline ?? project.description ?? `Explore ${projectTitle}`;
  const projectDescription =
    baseDescription.length >= 100
      ? baseDescription
      : `${baseDescription}. A project by Gerald Bahati showcasing modern web development, creative design, and digital solutions.`;

  const projectPath = `/projects/${slug}`;

  // Build keywords from project data
  const keywords = [
    projectTitle,
    details?.industry,
    ...(details?.services ?? []),
    "Gerald Bahati",
    "portfolio project",
    "case study",
  ].filter((k): k is string => Boolean(k));

  return {
    title: projectTitle,
    description: projectDescription,
    keywords,
    openGraph: {
      type: "article",
      siteName: SITE_NAME,
      title: projectTitle,
      description: projectDescription,
      url: projectPath,
      publishedTime: project._creationTime
        ? new Date(project._creationTime).toISOString()
        : undefined,
      authors: ["Gerald Bahati"],
    },
    twitter: {
      card: "summary_large_image",
      title: projectTitle,
      description: projectDescription,
      creator: "@gerald_baha",
    },
    alternates: {
      canonical: projectPath,
    },
  };
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

  const projectLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: projectTitle,
    description: details?.tagline ?? project?.description ?? project?.alt,
    url: projectUrl,
    author: {
      "@type": "Person",
      "@id": PERSON_ID,
      name: "Gerald Bahati",
      url: SITE_URL,
    },
    ...(project?.poster && { image: project.poster }),
    ...(details?.industry && { genre: details.industry }),
    ...(details?.services && { keywords: details.services.join(", ") }),
    ...(project?._creationTime && {
      dateCreated: new Date(project._creationTime).toISOString(),
    }),
  };

  return (
    <>
      <JsonLdScript data={projectLd} />
      <JsonLdScript data={breadcrumbLd} />
      <main className="min-h-screen bg-background">
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
