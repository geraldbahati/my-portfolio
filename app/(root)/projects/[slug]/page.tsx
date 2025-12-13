import { Suspense } from "react";
import { notFound } from "next/navigation";
import { fetchQuery } from "convex/nextjs";
import { cacheLife, cacheTag } from "next/cache";
import { api } from "@/convex/_generated/api";
import { ProjectHero } from "./_components/project-hero";
import { ProjectInfo } from "./_components/project-info";
import { ProjectMetrics } from "./_components/project-metrics";
import { ProjectGallery } from "./_components/project-gallery";
import { ProjectChallenges } from "./_components/project-challenges";
import { ProjectTestimonial } from "./_components/project-testimonial";
import { ProjectVideo } from "./_components/project-video";
import { ProjectDetailSkeleton } from "./_components/project-detail-skeleton";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all published projects at build time
export async function generateStaticParams() {
  const projects = await fetchQuery(api.projects.getPublishedProjects, {});
  return projects.map((project) => ({
    slug: project.id,
  }));
}

// Cached data fetching function
async function getProjectData(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(`project-${slug}`);

  const data = await fetchQuery(api.projects.getFullProjectDetails, {
    projectSlug: slug,
  });

  return data;
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <Suspense fallback={<ProjectDetailSkeleton />}>
      <ProjectContent slug={slug} />
    </Suspense>
  );
}

async function ProjectContent({ slug }: { slug: string }) {
  const data = await getProjectData(slug);

  // Not Found State
  if (data === null) {
    notFound();
  }

  const { project, details, metrics, gallery, challenges, testimonial } = data;

  return (
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
  );
}
