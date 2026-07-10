"use client";

import { useState, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
} from "@/components/ui/sortable";
import { MediaUpload } from "@/components/ui/media-upload";
import {
  GripVertical,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";

interface ProjectGalleryTableProps {
  projectId: Id<"projects">;
}

type GalleryType = "feature" | "stack";
type DeviceType = "desktop" | "mobile" | "tablet" | "full-width" | undefined;

interface GalleryFormData {
  src: string;
  alt: string;
  caption: string;
  galleryType: GalleryType;
  width: number;
  height: number;
  deviceType: DeviceType;
}

const emptyForm: GalleryFormData = {
  src: "",
  alt: "",
  caption: "",
  galleryType: "stack",
  width: 800,
  height: 600,
  deviceType: undefined,
};

export default function ProjectGalleryTable({
  projectId,
}: ProjectGalleryTableProps) {
  const serverGallery = useQuery(api.adminProjectGallery.getByProjectId, {
    projectId,
  });
  const createGalleryItem = useAction(
    api.adminProjectGallery.createGalleryItem,
  );
  const updateGalleryItem = useAction(
    api.adminProjectGallery.updateGalleryItem,
  );
  const deleteGalleryItem = useAction(
    api.adminProjectGallery.deleteGalleryItem,
  );
  const reorderGallery = useAction(api.adminProjectGallery.reorderGallery);

  const [optimisticGallery, setOptimisticGallery] =
    useState<typeof serverGallery>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Id<"projectGallery"> | null>(
    null,
  );
  const [formData, setFormData] = useState<GalleryFormData>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (serverGallery) {
      setOptimisticGallery(serverGallery);
    }
  }, [serverGallery]);

  const gallery = optimisticGallery ?? serverGallery;
  const isLoading = gallery === undefined;

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormData(emptyForm);
    setIsDialogOpen(true);
  };

  const openEditDialog = (itemId: Id<"projectGallery">) => {
    const item = gallery?.find((g) => g._id === itemId);
    if (item) {
      setEditingItem(itemId);
      setFormData({
        src: item.src,
        alt: item.alt || "",
        caption: item.caption || "",
        galleryType: item.galleryType,
        width: item.width,
        height: item.height,
        deviceType: item.deviceType,
      });
      setIsDialogOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.src.trim()) {
      alert("Image is required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingItem) {
        await updateGalleryItem({
          galleryId: editingItem,
          src: formData.src,
          alt: formData.alt || undefined,
          caption: formData.caption || undefined,
          galleryType: formData.galleryType,
          width: formData.width,
          height: formData.height,
          deviceType: formData.deviceType,
        });
      } else {
        await createGalleryItem({
          projectId,
          src: formData.src,
          alt: formData.alt || undefined,
          caption: formData.caption || undefined,
          galleryType: formData.galleryType,
          width: formData.width,
          height: formData.height,
          deviceType: formData.deviceType,
          order: gallery?.length ?? 0,
        });
      }
      setIsDialogOpen(false);
      setFormData(emptyForm);
    } catch (error) {
      console.error("Failed to save gallery item:", error);
      alert("Failed to save gallery item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (itemId: Id<"projectGallery">) => {
    if (!confirm("Delete this gallery image?")) return;
    try {
      await deleteGalleryItem({ galleryId: itemId });
    } catch (error) {
      console.error("Failed to delete gallery item:", error);
      alert("Failed to delete gallery item");
    }
  };

  const handleReorder = async (reorderedGallery: typeof gallery) => {
    if (!reorderedGallery) return;
    setOptimisticGallery(reorderedGallery);

    try {
      const galleryOrders = reorderedGallery.map((item, index) => ({
        galleryId: item._id,
        order: index,
      }));
      await reorderGallery({ galleryOrders });
    } catch (error) {
      console.error("Failed to reorder gallery:", error);
      setOptimisticGallery(serverGallery);
      alert("Failed to reorder gallery");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gallery Images</h3>
        <Button onClick={openCreateDialog} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Image
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <CardContent className="p-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 py-2">
                <Skeleton className="h-16 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </CardContent>
        ) : gallery.length === 0 ? (
          <CardContent className="py-8 text-center text-muted-foreground">
            No gallery images yet. Add your first one!
          </CardContent>
        ) : (
          <CardContent className="p-0">
            <Sortable
              value={gallery}
              onValueChange={handleReorder}
              getItemValue={(item) => item._id}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="w-24">Preview</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Dimensions</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <SortableContent asChild withoutSlot>
                  <TableBody>
                    {gallery.map((item) => (
                      <SortableItem key={item._id} value={item._id} asChild>
                        <TableRow>
                          <TableCell>
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
                          <TableCell>
                            {item.src ? (
                              <div className="relative h-12 w-20 overflow-hidden rounded bg-muted">
                                <Image
                                  src={item.src}
                                  alt={item.alt || "Gallery image"}
                                  fill
                                  className="object-cover"
                                  sizes="80px"
                                />
                              </div>
                            ) : (
                              <div className="h-12 w-20 flex items-center justify-center bg-muted rounded">
                                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="capitalize">
                            {item.galleryType}
                          </TableCell>
                          <TableCell>
                            {item.width} × {item.height}
                          </TableCell>
                          <TableCell className="capitalize text-muted-foreground">
                            {item.deviceType || "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(item._id)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(item._id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      </SortableItem>
                    ))}
                  </TableBody>
                </SortableContent>
              </Table>
            </Sortable>
          </CardContent>
        )}
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Gallery Image" : "Add Gallery Image"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <MediaUpload
              label="Image *"
              accept="image"
              maxSizeMB={10}
              currentUrl={formData.src || undefined}
              onUploadComplete={(url) => setFormData({ ...formData, src: url })}
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="galleryType">Gallery Type *</Label>
                <Select
                  value={formData.galleryType}
                  onValueChange={(v) =>
                    setFormData({ ...formData, galleryType: v as GalleryType })
                  }
                >
                  <SelectTrigger id="galleryType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">
                      Feature (Left column)
                    </SelectItem>
                    <SelectItem value="stack">Stack (Right column)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deviceType">Device Type</Label>
                <Select
                  value={formData.deviceType || "none"}
                  onValueChange={(v) =>
                    setFormData({
                      ...formData,
                      deviceType: v === "none" ? undefined : (v as DeviceType),
                    })
                  }
                >
                  <SelectTrigger id="deviceType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="desktop">Desktop</SelectItem>
                    <SelectItem value="mobile">Mobile</SelectItem>
                    <SelectItem value="tablet">Tablet</SelectItem>
                    <SelectItem value="full-width">Full Width</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width (px) *</Label>
                <Input
                  id="width"
                  type="number"
                  value={formData.width}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      width: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (px) *</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      height: parseInt(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alt">Alt Text</Label>
              <Input
                id="alt"
                value={formData.alt}
                onChange={(e) =>
                  setFormData({ ...formData, alt: e.target.value })
                }
                placeholder="Describe the image"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="caption">Caption</Label>
              <Input
                id="caption"
                value={formData.caption}
                onChange={(e) =>
                  setFormData({ ...formData, caption: e.target.value })
                }
                placeholder="Optional image caption"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : editingItem ? (
                  "Update"
                ) : (
                  "Add"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
