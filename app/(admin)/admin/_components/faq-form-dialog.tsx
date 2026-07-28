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

interface FaqFormData {
  question: string;
  answer: string;
  isPublished: boolean;
}

interface FaqFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingFaq?: {
    _id: Id<"faqs">;
    question: string;
    answer: string;
    isPublished: boolean;
    order: number;
  };
  nextOrder: number;
}

const emptyForm: FaqFormData = {
  question: "",
  answer: "",
  isPublished: true,
};

function getInitialFormData(
  editingFaq: FaqFormDialogProps["editingFaq"],
): FaqFormData {
  return editingFaq
    ? {
        question: editingFaq.question,
        answer: editingFaq.answer,
        isPublished: editingFaq.isPublished,
      }
    : emptyForm;
}

export default function FaqFormDialog({
  isOpen,
  onClose,
  onSuccess,
  editingFaq,
  nextOrder,
}: FaqFormDialogProps) {
  const createFaqAction = useAction(api.adminFaqs.createFaq);
  const updateFaqAction = useAction(api.adminFaqs.updateFaq);

  const [formData, setFormData] = useState<FaqFormData>(() =>
    getInitialFormData(editingFaq),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Promise-based rather than try/catch: the React Compiler bails out of any
    // component containing try/catch, leaving the whole dialog unmemoised. Same
    // idiom as the contact form.
    const save = editingFaq
      ? updateFaqAction({
          faqId: editingFaq._id,
          question: formData.question,
          answer: formData.answer,
          isPublished: formData.isPublished,
        })
      : createFaqAction({
          question: formData.question,
          answer: formData.answer,
          order: nextOrder,
          isPublished: formData.isPublished,
        });

    const error = await save
      .then(() => null)
      .catch((err: unknown) => err)
      .finally(() => setIsSubmitting(false));

    if (error) {
      console.error("Failed to save FAQ:", error);
      alert("Failed to save FAQ");
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingFaq ? "Edit FAQ" : "Create New FAQ"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Input
              id="question"
              type="text"
              value={formData.question}
              onChange={(e) =>
                setFormData({ ...formData, question: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="answer">Answer</Label>
            <Textarea
              id="answer"
              value={formData.answer}
              onChange={(e) =>
                setFormData({ ...formData, answer: e.target.value })
              }
              rows={5}
              required
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

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingFaq ? "Update" : "Create"}
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
