"use client";

import { useQuery } from "convex/react";
import StatCard from "./stat-card";
import { api } from "@/convex/_generated/api";

export default function ContactStats() {
  const contactStats = useQuery(api.contactForm.getContactStats);
  const isLoading = contactStats === undefined;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Submissions"
        value={contactStats?.total ?? 0}
        description="All time"
        isLoading={isLoading}
      />
      <StatCard
        title="Today"
        value={contactStats?.today ?? 0}
        description="Submissions today"
        isLoading={isLoading}
      />
      <StatCard
        title="This Week"
        value={contactStats?.week ?? 0}
        description="Last 7 days"
        isLoading={isLoading}
      />
      <StatCard
        title="Pending"
        value={contactStats?.pending ?? 0}
        description="Awaiting response"
        isLoading={isLoading}
      />
    </div>
  );
}
