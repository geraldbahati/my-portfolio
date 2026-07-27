"use client";

import { type ComponentProps, useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
} from "@/components/ui/sortable";
import { GripVertical, Settings2 } from "lucide-react";
import ProjectFormDialog from "./project-form-dialog";

interface ProjectsTableProps {
  onManageProject?: (projectId: Id<"projects">) => void;
}

type EditingProject = ComponentProps<
  typeof ProjectFormDialog
>["editingProject"];

export default function ProjectsTable({ onManageProject }: ProjectsTableProps) {
  const serverProjects = useQuery(api.adminProjects.getAllProjectsQuery);
  const deleteProjectAction = useAction(api.adminProjects.deleteProject);
  const reorderProjectsAction = useAction(api.adminProjects.reorderProjects);

  // Local state for optimistic updates
  const [optimisticProjects, setOptimisticProjects] =
    useState<typeof serverProjects>(undefined);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] =
    useState<EditingProject>(undefined);

  // Reset the optimistic copy whenever fresh server data arrives. Adjusting
  // state during render is React's documented alternative to a syncing effect:
  // it re-renders before committing, instead of painting stale rows first and
  // correcting them afterwards.
  const [syncedProjects, setSyncedProjects] =
    useState<typeof serverProjects>(undefined);

  if (serverProjects !== syncedProjects) {
    setSyncedProjects(serverProjects);
    setOptimisticProjects(serverProjects);
  }

  const projects = optimisticProjects ?? serverProjects;
  const isLoading = projects === undefined;

  const handleCreate = () => {
    setEditingProject(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (projectId: Id<"projects">) => {
    const project = projects?.find((p) => p._id === projectId);
    if (project) {
      setEditingProject(project);
      setIsDialogOpen(true);
    }
  };

  const handleDelete = async (projectId: Id<"projects">) => {
    if (confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteProjectAction({ projectId });
      } catch (error) {
        console.error("Failed to delete project:", error);
        alert("Failed to delete project");
      }
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingProject(undefined);
  };

  const handleReorder = async (reorderedProjects: typeof projects) => {
    if (!reorderedProjects) return;

    // Optimistic update: immediately update UI
    setOptimisticProjects(reorderedProjects);

    try {
      // Create project orders array with updated order values
      const projectOrders = reorderedProjects.map((project, index) => ({
        projectId: project._id,
        order: index,
      }));

      // Update server in the background
      await reorderProjectsAction({ projectOrders });
      // Server data will sync back through useEffect when query updates
    } catch (error) {
      console.error("Failed to reorder projects:", error);
      // Revert to server state on error
      setOptimisticProjects(serverProjects);
      alert("Failed to reorder projects");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Projects Management</h2>
          <p className="text-muted-foreground">
            Create, edit, and manage portfolio projects
          </p>
        </div>
        <Button onClick={handleCreate}>+ New Project</Button>
      </div>

      {/* Form Dialog */}
      <ProjectFormDialog
        key={`${isDialogOpen}-${editingProject?._id ?? "new"}`}
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onSuccess={handleDialogClose}
        editingProject={editingProject}
        nextOrder={projects?.length ?? 0}
      />

      {/* Projects Table */}
      <Card>
        {isLoading ? (
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(3)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Skeleton className="h-4 w-8" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-48" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-20 rounded-full" />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-14" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        ) : projects.length === 0 ? (
          <CardContent className="py-8 text-center text-muted-foreground">
            No projects yet. Create your first project!
          </CardContent>
        ) : (
          <CardContent className="p-0">
            <Sortable
              value={projects}
              onValueChange={handleReorder}
              getItemValue={(project) => project._id}
            >
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <SortableContent asChild withoutSlot>
                    <TableBody>
                      {projects.map((project) => (
                        <SortableItem
                          key={project._id}
                          value={project._id}
                          asChild
                        >
                          <TableRow>
                            <TableCell className="w-12">
                              <SortableItemHandle asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="cursor-grab active:cursor-grabbing h-8 w-8 p-0"
                                >
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </SortableItemHandle>
                            </TableCell>
                            <TableCell>{project.order}</TableCell>
                            <TableCell className="font-medium">
                              {project.title}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {project.id}
                            </TableCell>
                            <TableCell className="capitalize">
                              {project.type}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  project.isPublished ? "default" : "outline"
                                }
                              >
                                {project.isPublished ? "Published" : "Draft"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {onManageProject && (
                                  <Button
                                    onClick={() => onManageProject(project._id)}
                                    variant="outline"
                                    size="sm"
                                  >
                                    <Settings2 className="h-4 w-4 mr-1" />
                                    Manage
                                  </Button>
                                )}
                                <Button
                                  onClick={() => handleEdit(project._id)}
                                  variant="ghost"
                                  size="sm"
                                >
                                  Edit
                                </Button>
                                <Button
                                  onClick={() => handleDelete(project._id)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                >
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        </SortableItem>
                      ))}
                    </TableBody>
                  </SortableContent>
                </Table>
              </div>
            </Sortable>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
