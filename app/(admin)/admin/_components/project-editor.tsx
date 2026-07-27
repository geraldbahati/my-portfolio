"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2 } from "lucide-react";
import ProjectFormDialog from "./project-form-dialog";
import ProjectDetailsForm from "./project-details-form";
import ProjectMetricsTable from "./project-metrics-table";
import ProjectTestimonialForm from "./project-testimonial-form";
import ProjectGalleryTable from "./project-gallery-table";
import ProjectChallengesTable from "./project-challenges-table";
import { useState } from "react";

interface ProjectEditorProps {
  projectId: Id<"projects">;
  onBack: () => void;
}

export default function ProjectEditor({
  projectId,
  onBack,
}: ProjectEditorProps) {
  const projects = useQuery(api.adminProjects.getAllProjectsQuery);
  const project = projects?.find((p) => p._id === projectId);

  const [isBasicDialogOpen, setIsBasicDialogOpen] = useState(false);

  if (projects === undefined) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Projects
        </Button>
        <div className="text-center py-16 text-muted-foreground">
          Project not found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">{project.title}</h2>
          <p className="text-muted-foreground text-sm">
            ID: {project.id} • {project.isPublished ? "Published" : "Draft"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="flex flex-row w-full h-auto p-1 bg-muted rounded-lg">
          <TabsTrigger value="basic" className="flex-1">
            Basic
          </TabsTrigger>
          <TabsTrigger value="details" className="flex-1">
            Details
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex-1">
            Metrics
          </TabsTrigger>
          <TabsTrigger value="testimonial" className="flex-1">
            Testimonial
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex-1">
            Gallery
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex-1">
            Challenges
          </TabsTrigger>
        </TabsList>

        {/* Basic Info Tab */}
        <TabsContent value="basic" className="mt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">Basic Project Info</h3>
                <p className="text-sm text-muted-foreground">
                  Core project fields like title, description, and media
                </p>
              </div>
              <Button onClick={() => setIsBasicDialogOpen(true)}>
                Edit Basic Info
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/30">
              <div>
                <p className="text-sm text-muted-foreground">Title</p>
                <p className="font-medium">{project.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium capitalize">{project.type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium">
                  {project.isPublished ? "Published" : "Draft"}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Order</p>
                <p className="font-medium">{project.order}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium line-clamp-3">
                  {project.description || (
                    <span className="text-muted-foreground italic">
                      No description
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Basic Info Edit Dialog */}
          <ProjectFormDialog
            key={`${isBasicDialogOpen}-${project._id}`}
            isOpen={isBasicDialogOpen}
            onClose={() => setIsBasicDialogOpen(false)}
            onSuccess={() => setIsBasicDialogOpen(false)}
            editingProject={project}
            nextOrder={projects.length}
          />
        </TabsContent>

        {/* Details Tab */}
        <TabsContent value="details" className="mt-6">
          <ProjectDetailsForm projectId={projectId} />
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="mt-6">
          <ProjectMetricsTable projectId={projectId} />
        </TabsContent>

        {/* Testimonial Tab */}
        <TabsContent value="testimonial" className="mt-6">
          <ProjectTestimonialForm projectId={projectId} />
        </TabsContent>

        {/* Gallery Tab */}
        <TabsContent value="gallery" className="mt-6">
          <ProjectGalleryTable projectId={projectId} />
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="mt-6">
          <ProjectChallengesTable projectId={projectId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
