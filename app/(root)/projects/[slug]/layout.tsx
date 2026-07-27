import { fetchQuery } from "convex/nextjs";
import { cacheLife, cacheTag } from "next/cache";
import { api } from "@/convex/_generated/api";
import {
  getProjectCacheTag,
  PROJECT_NAVIGATION_CACHE_TAG,
  PROJECTS_CACHE_TAG,
} from "@/lib/data/project-cache-tags";
import { ProjectNavigation } from "./_components/project-navigation";
import { ProjectCTA } from "./_components/project-cta";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

// Cached navigation data fetching
async function getNavigationData(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag(
    PROJECTS_CACHE_TAG,
    getProjectCacheTag(slug),
    PROJECT_NAVIGATION_CACHE_TAG,
  );

  return await fetchQuery(api.projects.getProjectNavigation, {
    projectSlug: slug,
  });
}

export default async function ProjectDetailLayout({
  children,
  params,
}: LayoutProps) {
  const { slug } = await params;
  const navigation = slug === "_" ? null : await getNavigationData(slug);

  return (
    <>
      {/* Main page content */}
      {children}

      {/* Navigation Links */}
      <ProjectNavigation
        previousProject={navigation?.previousProject ?? null}
        nextProject={navigation?.nextProject ?? null}
      />

      {/* CTA Section */}
      <ProjectCTA />
    </>
  );
}
