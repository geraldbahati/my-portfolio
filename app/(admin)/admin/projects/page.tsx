"use client";

import { useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import ProjectsTable from "../_components/projects-table";
import ProjectEditor from "../_components/project-editor";

export default function ProjectsPage() {
  const [editingProjectId, setEditingProjectId] =
    useState<Id<"projects"> | null>(null);

  if (editingProjectId) {
    return (
      <ProjectEditor
        projectId={editingProjectId}
        onBack={() => setEditingProjectId(null)}
      />
    );
  }

  return (
    <ProjectsTable
      onManageProject={(projectId) => setEditingProjectId(projectId)}
    />
  );
}
