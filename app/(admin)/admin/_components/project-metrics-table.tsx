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
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
} from "@/components/ui/sortable";
import { GripVertical, Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectMetricsTableProps {
  projectId: Id<"projects">;
}

interface MetricFormData {
  value: string;
  label: string;
  icon: string;
}

const emptyForm: MetricFormData = { value: "", label: "", icon: "" };

export default function ProjectMetricsTable({
  projectId,
}: ProjectMetricsTableProps) {
  const serverMetrics = useQuery(api.adminProjectMetrics.getByProjectId, {
    projectId,
  });
  const createMetric = useAction(api.adminProjectMetrics.createMetric);
  const updateMetric = useAction(api.adminProjectMetrics.updateMetric);
  const deleteMetric = useAction(api.adminProjectMetrics.deleteMetric);
  const reorderMetrics = useAction(api.adminProjectMetrics.reorderMetrics);

  const [optimisticMetrics, setOptimisticMetrics] =
    useState<typeof serverMetrics>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMetric, setEditingMetric] =
    useState<Id<"projectMetrics"> | null>(null);
  const [formData, setFormData] = useState<MetricFormData>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (serverMetrics) {
      setOptimisticMetrics(serverMetrics);
    }
  }, [serverMetrics]);

  const metrics = optimisticMetrics ?? serverMetrics;
  const isLoading = metrics === undefined;

  const openCreateDialog = () => {
    setEditingMetric(null);
    setFormData(emptyForm);
    setIsDialogOpen(true);
  };

  const openEditDialog = (metricId: Id<"projectMetrics">) => {
    const metric = metrics?.find((m) => m._id === metricId);
    if (metric) {
      setEditingMetric(metricId);
      setFormData({
        value: metric.value,
        label: metric.label,
        icon: metric.icon || "",
      });
      setIsDialogOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.value.trim() || !formData.label.trim()) {
      alert("Value and Label are required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingMetric) {
        await updateMetric({
          metricId: editingMetric,
          value: formData.value,
          label: formData.label,
          icon: formData.icon || undefined,
        });
      } else {
        await createMetric({
          projectId,
          value: formData.value,
          label: formData.label,
          icon: formData.icon || undefined,
          order: metrics?.length ?? 0,
        });
      }
      setIsDialogOpen(false);
      setFormData(emptyForm);
    } catch (error) {
      console.error("Failed to save metric:", error);
      alert("Failed to save metric");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (metricId: Id<"projectMetrics">) => {
    if (!confirm("Delete this metric?")) return;
    try {
      await deleteMetric({ metricId });
    } catch (error) {
      console.error("Failed to delete metric:", error);
      alert("Failed to delete metric");
    }
  };

  const handleReorder = async (reorderedMetrics: typeof metrics) => {
    if (!reorderedMetrics) return;
    setOptimisticMetrics(reorderedMetrics);

    try {
      const metricOrders = reorderedMetrics.map((metric, index) => ({
        metricId: metric._id,
        order: index,
      }));
      await reorderMetrics({ metricOrders });
    } catch (error) {
      console.error("Failed to reorder metrics:", error);
      setOptimisticMetrics(serverMetrics);
      alert("Failed to reorder metrics");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">KPI Metrics</h3>
        <Button onClick={openCreateDialog} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Metric
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <CardContent className="p-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 py-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </CardContent>
        ) : metrics.length === 0 ? (
          <CardContent className="py-8 text-center text-muted-foreground">
            No metrics yet. Add your first KPI!
          </CardContent>
        ) : (
          <CardContent className="p-0">
            <Sortable
              value={metrics}
              onValueChange={handleReorder}
              getItemValue={(metric) => metric._id}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Label</TableHead>
                    <TableHead>Icon</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <SortableContent asChild withoutSlot>
                  <TableBody>
                    {metrics.map((metric) => (
                      <SortableItem key={metric._id} value={metric._id} asChild>
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
                          <TableCell className="font-medium">
                            {metric.value}
                          </TableCell>
                          <TableCell>{metric.label}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {metric.icon || "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(metric._id)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(metric._id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingMetric ? "Edit Metric" : "Add Metric"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="value">Value *</Label>
              <Input
                id="value"
                value={formData.value}
                onChange={(e) =>
                  setFormData({ ...formData, value: e.target.value })
                }
                placeholder="e.g., 53 €, 87 %, Ø40"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="label">Label *</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                placeholder="e.g., Cost per application"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Icon (optional)</Label>
              <Input
                id="icon"
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                placeholder="Icon identifier"
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
                ) : editingMetric ? (
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
