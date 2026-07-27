"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MediaUpload } from "@/components/ui/media-upload";

interface ProjectFormData {
  id: string;
  title: string;
  description: string;
  src: string;
  type: "video" | "gif";
  poster: string;
  alt: string;
  url: string;
  aspectRatio: string;
  isPublished: boolean;
}

interface ProjectFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingProject?: {
    _id: Id<"projects">;
    id: string;
    title: string;
    description?: string;
    src: string;
    type: "video" | "gif";
    poster?: string;
    alt?: string;
    url?: string;
    aspectRatio?: string;
    isPublished: boolean;
    order: number;
  };
  nextOrder: number;
}

const emptyForm: ProjectFormData = {
  id: "",
  title: "",
  description: "",
  src: "",
  type: "video",
  poster: "",
  alt: "",
  url: "",
  aspectRatio: "16/9",
  isPublished: true,
};

function getInitialFormData(
  editingProject: ProjectFormDialogProps["editingProject"],
): ProjectFormData {
  return editingProject
    ? {
        id: editingProject.id,
        title: editingProject.title,
        description: editingProject.description || "",
        src: editingProject.src,
        type: editingProject.type,
        poster: editingProject.poster || "",
        alt: editingProject.alt || "",
        url: editingProject.url || "",
        aspectRatio: editingProject.aspectRatio || "16/9",
        isPublished: editingProject.isPublished,
      }
    : emptyForm;
}

export default function ProjectFormDialog({
  isOpen,
  onClose,
  onSuccess,
  editingProject,
  nextOrder,
}: ProjectFormDialogProps) {
  const createProjectAction = useAction(api.adminProjects.createProject);
  const updateProjectAction = useAction(api.adminProjects.updateProject);

  const [formData, setFormData] = useState<ProjectFormData>(() =>
    getInitialFormData(editingProject),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const save = editingProject
      ? updateProjectAction({
          projectId: editingProject._id,
          title: formData.title,
          description: formData.description || undefined,
          src: formData.src,
          type: formData.type,
          poster: formData.poster || undefined,
          alt: formData.alt || undefined,
          url: formData.url || undefined,
          aspectRatio: formData.aspectRatio || undefined,
          isPublished: formData.isPublished,
        })
      : createProjectAction({
          id: formData.id,
          title: formData.title,
          description: formData.description || undefined,
          src: formData.src,
          type: formData.type,
          poster: formData.poster || undefined,
          alt: formData.alt || undefined,
          url: formData.url || undefined,
          aspectRatio: formData.aspectRatio || undefined,
          order: nextOrder,
          isPublished: formData.isPublished,
        });

    const error = await save
      .then(() => null)
      .catch((cause: unknown) => cause)
      .finally(() => setIsSubmitting(false));

    if (error) {
      console.error("Failed to save project:", error);
      alert("Failed to save project");
    } else {
      onSuccess();
      setFormData(emptyForm);
    }
  };

  const handleCancel = () => {
    setFormData(emptyForm);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingProject ? "Edit Project" : "Create New Project"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="id">Project ID (URL slug)</Label>
              <Input
                id="id"
                type="text"
                value={formData.id}
                onChange={(e) =>
                  setFormData({ ...formData, id: e.target.value })
                }
                required
                disabled={!!editingProject}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={12}
              />
            </div>

            <div className="md:col-span-2">
              <MediaUpload
                label="Project Video/GIF"
                accept="video"
                maxSizeMB={500}
                currentUrl={formData.src || undefined}
                onUploadComplete={(url, metadata) => {
                  setFormData((prev) => ({
                    ...prev,
                    src: url,
                    type: url.endsWith(".gif") ? "gif" : "video",
                    // Auto-set poster from Stream thumbnail if available
                    poster:
                      metadata?.thumbnailUrl && !prev.poster
                        ? metadata.thumbnailUrl
                        : prev.poster,
                  }));
                }}
              />
              {formData.src && (
                <div className="mt-2">
                  <Label className="text-xs text-muted-foreground">
                    Current URL:
                  </Label>
                  <Input
                    type="url"
                    value={formData.src}
                    onChange={(e) =>
                      setFormData({ ...formData, src: e.target.value })
                    }
                    className="mt-1 text-xs"
                    placeholder="Or paste URL manually"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    type: value as "video" | "gif",
                  })
                }
              >
                <SelectTrigger id="type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="gif">GIF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <MediaUpload
                label="Poster/Thumbnail Image"
                accept="image"
                maxSizeMB={10}
                currentUrl={formData.poster || undefined}
                onUploadComplete={(url) => {
                  setFormData((prev) => ({ ...prev, poster: url }));
                }}
              />
              {formData.poster && (
                <div className="mt-2">
                  <Label className="text-xs text-muted-foreground">
                    Current URL:
                  </Label>
                  <Input
                    type="url"
                    value={formData.poster}
                    onChange={(e) =>
                      setFormData({ ...formData, poster: e.target.value })
                    }
                    className="mt-1 text-xs"
                    placeholder="Or paste URL manually"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="alt">Alt Text</Label>
              <Input
                id="alt"
                type="text"
                value={formData.alt}
                onChange={(e) =>
                  setFormData({ ...formData, alt: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Project URL (Live Site)</Label>
              <Input
                id="url"
                type="url"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aspectRatio">Aspect Ratio</Label>
              <Input
                id="aspectRatio"
                type="text"
                value={formData.aspectRatio}
                onChange={(e) =>
                  setFormData({ ...formData, aspectRatio: e.target.value })
                }
                placeholder="16/9"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublished"
                checked={formData.isPublished}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPublished: checked === true })
                }
              />
              <Label htmlFor="isPublished" className="!mt-0 cursor-pointer">
                Published
              </Label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : editingProject
                  ? "Update"
                  : "Create"}
            </Button>
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
