"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Skeleton } from "@/components/ui/skeleton";

export default function SubmissionCount() {
  const submissionCount = useQuery(api.contactForm.getContactSubmissionCount);
  const isLoading = submissionCount === undefined;

  if (isLoading) {
    return <Skeleton className="w-12 h-6 inline-block" />;
  }

  return <span>{submissionCount}</span>;
}
