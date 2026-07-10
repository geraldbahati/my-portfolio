"use client";

import { useState, useEffect } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaUpload } from "@/components/ui/media-upload";
import { Loader2 } from "lucide-react";

interface ProjectTestimonialFormProps {
  projectId: Id<"projects">;
}

export default function ProjectTestimonialForm({
  projectId,
}: ProjectTestimonialFormProps) {
  const testimonial = useQuery(api.adminProjectTestimonials.getByProjectId, {
    projectId,
  });
  const upsertTestimonial = useAction(
    api.adminProjectTestimonials.upsertTestimonial,
  );
  const deleteTestimonial = useAction(
    api.adminProjectTestimonials.deleteTestimonial,
  );

  const [formData, setFormData] = useState({
    quote: "",
    authorName: "",
    authorRole: "",
    authorCompany: "",
    authorImage: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync form data when testimonial is loaded
  useEffect(() => {
    if (testimonial) {
      setFormData({
        quote: testimonial.quote || "",
        authorName: testimonial.authorName || "",
        authorRole: testimonial.authorRole || "",
        authorCompany: testimonial.authorCompany || "",
        authorImage: testimonial.authorImage || "",
      });
      setHasChanges(false);
    }
  }, [testimonial]);

  const updateField = <K extends keyof typeof formData>(
    field: K,
    value: (typeof formData)[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.quote.trim() || !formData.authorName.trim()) {
      alert("Quote and Author Name are required");
      return;
    }

    setIsSubmitting(true);
    try {
      await upsertTestimonial({
        projectId,
        quote: formData.quote,
        authorName: formData.authorName,
        authorRole: formData.authorRole || undefined,
        authorCompany: formData.authorCompany || undefined,
        authorImage: formData.authorImage || undefined,
      });
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save testimonial:", error);
      alert("Failed to save testimonial");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!testimonial) return;
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    setIsSubmitting(true);
    try {
      await deleteTestimonial({ projectId });
      setFormData({
        quote: "",
        authorName: "",
        authorRole: "",
        authorCompany: "",
        authorImage: "",
      });
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to delete testimonial:", error);
      alert("Failed to delete testimonial");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (testimonial === undefined) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Client Testimonial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quote">Quote *</Label>
            <Textarea
              id="quote"
              value={formData.quote}
              onChange={(e) => updateField("quote", e.target.value)}
              rows={4}
              placeholder="The testimonial quote from your client"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="authorName">Author Name *</Label>
              <Input
                id="authorName"
                value={formData.authorName}
                onChange={(e) => updateField("authorName", e.target.value)}
                placeholder="e.g., Klaus Hering"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="authorRole">Author Role</Label>
              <Input
                id="authorRole"
                value={formData.authorRole}
                onChange={(e) => updateField("authorRole", e.target.value)}
                placeholder="e.g., Sales Management"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="authorCompany">Author Company</Label>
              <Input
                id="authorCompany"
                value={formData.authorCompany}
                onChange={(e) => updateField("authorCompany", e.target.value)}
                placeholder="e.g., Rapid GmbH"
              />
            </div>
          </div>

          <MediaUpload
            label="Author Image"
            accept="image"
            maxSizeMB={5}
            currentUrl={formData.authorImage || undefined}
            onUploadComplete={(url) => updateField("authorImage", url)}
          />
        </CardContent>
      </Card>

      <div className="flex justify-between">
        {testimonial && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            Delete Testimonial
          </Button>
        )}
        <div className="flex-1" />
        <Button type="submit" disabled={isSubmitting || !hasChanges}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : testimonial ? (
            "Update Testimonial"
          ) : (
            "Add Testimonial"
          )}
        </Button>
      </div>
    </form>
  );
}
