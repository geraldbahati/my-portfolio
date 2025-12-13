import { fetchQuery } from "convex/nextjs";
import { cacheLife, cacheTag } from "next/cache";
import { api } from "@/convex/_generated/api";
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
  cacheTag(`project-nav-${slug}`);

  const data = await fetchQuery(api.projects.getProjectNavigation, {
    projectSlug: slug,
  });

  return data;
}

export default async function ProjectDetailLayout({
  children,
  params,
}: LayoutProps) {
  const { slug } = await params;
  const navigation = await getNavigationData(slug);

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
