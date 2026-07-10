"use client";

import StatCard from "./stat-card";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ContentOverview() {
  const projects = useQuery(api.projects.getPublishedProjects);
  const faqs = useQuery(api.faqs.getPublishedFaqs);
  const contactStats = useQuery(api.contactForm.getContactStats);

  const isLoadingProjects = projects === undefined;
  const isLoadingFaqs = faqs === undefined;
  const isLoadingContactStats = contactStats === undefined;

  const publishedProjects = projects?.filter((p) => p.isPublished).length ?? 0;
  const publishedFaqs = faqs?.filter((f) => f.isPublished).length ?? 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Projects"
        value={publishedProjects}
        description={`${publishedProjects} published`}
        isLoading={isLoadingProjects}
      />
      <StatCard
        title="FAQs"
        value={publishedFaqs}
        description={`${publishedFaqs} published`}
        isLoading={isLoadingFaqs}
      />
      <StatCard
        title="Failed Emails"
        value={contactStats?.failed ?? 0}
        description="Needs attention"
        isLoading={isLoadingContactStats}
      />
      <StatCard
        title="Status"
        value="Active"
        description="All systems operational"
        isLoading={false}
      />
    </div>
  );
}
