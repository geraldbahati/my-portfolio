"use client";

import dynamic from "next/dynamic";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import type { PrivacyPolicySection } from "./PrivacyPolicy";

// Loading skeleton component
function PrivacyPolicySkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Content Skeleton - Add top padding to account for fixed navbar */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-32">
        <div className="bg-card rounded-3xl shadow-xl border border-border p-8 sm:p-12 animate-pulse">
          <div className="space-y-6">
            <div className="h-8 bg-muted rounded w-2/3"></div>
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
              <div className="h-4 bg-muted rounded w-4/6"></div>
            </div>
            <div className="h-6 bg-muted rounded w-1/2 mt-8"></div>
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Button Skeleton */}
      <div className="fixed bottom-8 right-8 z-50">
        <div className="w-12 h-12 bg-muted rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}

// Dynamic import with client-side only rendering to handle React 19 compatibility
const PrivacyPolicy = dynamic(
  () => import("./PrivacyPolicy").then((mod) => mod.PrivacyPolicy),
  {
    ssr: false,
    loading: () => <PrivacyPolicySkeleton />,
  }
);

interface PrivacyPolicyWrapperProps {
  content: MDXRemoteSerializeResult | PrivacyPolicySection[];
  className?: string;
}

export function PrivacyPolicyWrapper(props: PrivacyPolicyWrapperProps) {
  return <PrivacyPolicy {...props} />;
}
