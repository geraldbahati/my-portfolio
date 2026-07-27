"use client";

import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

interface ProjectChallengesTableProps {
  projectId: Id<"projects">;
}

interface ChallengeFormData {
  title: string;
  content: string;
}

const emptyForm: ChallengeFormData = { title: "", content: "" };

export default function ProjectChallengesTable({
  projectId,
}: ProjectChallengesTableProps) {
  const serverChallenges = useQuery(api.adminProjectChallenges.getByProjectId, {
    projectId,
  });
  const createChallenge = useAction(api.adminProjectChallenges.createChallenge);
  const updateChallenge = useAction(api.adminProjectChallenges.updateChallenge);
  const deleteChallenge = useAction(api.adminProjectChallenges.deleteChallenge);
  const reorderChallenges = useAction(
    api.adminProjectChallenges.reorderChallenges,
  );

  const [optimisticChallenges, setOptimisticChallenges] =
    useState<typeof serverChallenges>(undefined);
  const [syncedChallenges, setSyncedChallenges] =
    useState<typeof serverChallenges>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] =
    useState<Id<"projectChallenges"> | null>(null);
  const [formData, setFormData] = useState<ChallengeFormData>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (serverChallenges !== syncedChallenges) {
    setSyncedChallenges(serverChallenges);
    setOptimisticChallenges(serverChallenges);
  }

  const challenges = optimisticChallenges ?? serverChallenges;
  const isLoading = challenges === undefined;

  const openCreateDialog = () => {
    setEditingChallenge(null);
    setFormData(emptyForm);
    setIsDialogOpen(true);
  };

  const openEditDialog = (challengeId: Id<"projectChallenges">) => {
    const challenge = challenges?.find((c) => c._id === challengeId);
    if (challenge) {
      setEditingChallenge(challengeId);
      setFormData({
        title: challenge.title,
        content: challenge.content,
      });
      setIsDialogOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      alert("Title and Content are required");
      return;
    }

    setIsSubmitting(true);
    const save = editingChallenge
      ? updateChallenge({
          challengeId: editingChallenge,
          title: formData.title,
          content: formData.content,
        })
      : createChallenge({
          projectId,
          title: formData.title,
          content: formData.content,
          order: challenges?.length ?? 0,
        });

    const error = await save
      .then(() => null)
      .catch((cause: unknown) => cause)
      .finally(() => setIsSubmitting(false));

    if (error) {
      console.error("Failed to save challenge:", error);
      alert("Failed to save challenge");
    } else {
      setIsDialogOpen(false);
      setFormData(emptyForm);
    }
  };

  const handleDelete = async (challengeId: Id<"projectChallenges">) => {
    if (!confirm("Delete this challenge section?")) return;
    try {
      await deleteChallenge({ challengeId });
    } catch (error) {
      console.error("Failed to delete challenge:", error);
      alert("Failed to delete challenge");
    }
  };

  const handleReorder = async (reorderedChallenges: typeof challenges) => {
    if (!reorderedChallenges) return;
    setOptimisticChallenges(reorderedChallenges);

    try {
      const challengeOrders = reorderedChallenges.map((challenge, index) => ({
        challengeId: challenge._id,
        order: index,
      }));
      await reorderChallenges({ challengeOrders });
    } catch (error) {
      console.error("Failed to reorder challenges:", error);
      setOptimisticChallenges(serverChallenges);
      alert("Failed to reorder challenges");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Challenges & Solutions</h3>
        <Button onClick={openCreateDialog} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Section
        </Button>
      </div>

      <Card>
        {isLoading ? (
          <CardContent className="p-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-4 py-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </CardContent>
        ) : challenges.length === 0 ? (
          <CardContent className="py-8 text-center text-muted-foreground">
            No challenge sections yet. Add your first one!
          </CardContent>
        ) : (
          <CardContent className="p-0">
            <Sortable
              value={challenges}
              onValueChange={handleReorder}
              getItemValue={(c) => c._id}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Content Preview</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <SortableContent asChild withoutSlot>
                  <TableBody>
                    {challenges.map((challenge) => (
                      <SortableItem
                        key={challenge._id}
                        value={challenge._id}
                        asChild
                      >
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
                            {challenge.title}
                          </TableCell>
                          <TableCell className="max-w-md">
                            <div className="line-clamp-2 text-muted-foreground text-sm">
                              {challenge.content}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(challenge._id)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(challenge._id)}
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
              {editingChallenge
                ? "Edit Challenge Section"
                : "Add Challenge Section"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Customer challenges and wishes"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content (Markdown) *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                rows={10}
                placeholder="Describe the challenges and solutions in markdown format"
                required
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
                ) : editingChallenge ? (
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
