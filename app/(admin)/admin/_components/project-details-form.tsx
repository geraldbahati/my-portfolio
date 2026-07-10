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
import { Loader2, Plus, X } from "lucide-react";

interface ProjectDetailsFormProps {
  projectId: Id<"projects">;
}

export default function ProjectDetailsForm({
  projectId,
}: ProjectDetailsFormProps) {
  const details = useQuery(api.adminProjectDetails.getByProjectId, {
    projectId,
  });
  const upsertDetails = useAction(api.adminProjectDetails.upsertDetails);

  const [formData, setFormData] = useState({
    heroImage: "",
    heroAlt: "",
    tagline: "",
    fullDescription: "",
    services: [] as string[],
    client: "",
    industry: "",
    period: "",
    year: undefined as number | undefined,
    features: [] as string[],
    videoUrl: "",
    videoPoster: "",
    videoAlt: "",
    colorPalette: [] as { hex: string; name?: string }[],
  });
  const [newService, setNewService] = useState("");
  const [newFeature, setNewFeature] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");
  const [newColorName, setNewColorName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync form data when details are loaded
  useEffect(() => {
    if (details) {
      setFormData({
        heroImage: details.heroImage || "",
        heroAlt: details.heroAlt || "",
        tagline: details.tagline || "",
        fullDescription: details.fullDescription || "",
        services: details.services || [],
        client: details.client || "",
        industry: details.industry || "",
        period: details.period || "",
        year: details.year,
        features: details.features || [],
        videoUrl: details.videoUrl || "",
        videoPoster: details.videoPoster || "",
        videoAlt: details.videoAlt || "",
        colorPalette: details.colorPalette || [],
      });
      setHasChanges(false);
    }
  }, [details]);

  const updateField = <K extends keyof typeof formData>(
    field: K,
    value: (typeof formData)[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const addService = () => {
    if (newService.trim()) {
      updateField("services", [...formData.services, newService.trim()]);
      setNewService("");
    }
  };

  const removeService = (index: number) => {
    updateField(
      "services",
      formData.services.filter((_, i) => i !== index),
    );
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      updateField("features", [...formData.features, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    updateField(
      "features",
      formData.features.filter((_, i) => i !== index),
    );
  };

  const addColor = () => {
    if (newColorHex.trim()) {
      updateField("colorPalette", [
        ...formData.colorPalette,
        { hex: newColorHex.trim(), name: newColorName.trim() || undefined },
      ]);
      setNewColorHex("#000000");
      setNewColorName("");
    }
  };

  const removeColor = (index: number) => {
    updateField(
      "colorPalette",
      formData.colorPalette.filter((_, i) => i !== index),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await upsertDetails({
        projectId,
        heroImage: formData.heroImage || undefined,
        heroAlt: formData.heroAlt || undefined,
        tagline: formData.tagline || undefined,
        fullDescription: formData.fullDescription || undefined,
        services: formData.services.length > 0 ? formData.services : undefined,
        client: formData.client || undefined,
        industry: formData.industry || undefined,
        period: formData.period || undefined,
        year: formData.year,
        features: formData.features.length > 0 ? formData.features : undefined,
        videoUrl: formData.videoUrl || undefined,
        videoPoster: formData.videoPoster || undefined,
        videoAlt: formData.videoAlt || undefined,
        colorPalette:
          formData.colorPalette.length > 0 ? formData.colorPalette : undefined,
      });
      setHasChanges(false);
    } catch (error) {
      console.error("Failed to save details:", error);
      alert("Failed to save details");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (details === undefined) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Hero Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hero Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <MediaUpload
              label="Hero Image"
              accept="image"
              maxSizeMB={10}
              currentUrl={formData.heroImage || undefined}
              onUploadComplete={(url) => updateField("heroImage", url)}
            />
            {formData.heroImage && (
              <div className="mt-2">
                <Label className="text-xs text-muted-foreground">
                  Current URL:
                </Label>
                <Input
                  type="url"
                  value={formData.heroImage}
                  onChange={(e) => updateField("heroImage", e.target.value)}
                  className="mt-1 text-xs"
                  placeholder="Or paste URL manually"
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="heroAlt">Hero Alt Text</Label>
            <Input
              id="heroAlt"
              value={formData.heroAlt}
              onChange={(e) => updateField("heroAlt", e.target.value)}
              placeholder="Describe the hero image"
            />
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={formData.tagline}
              onChange={(e) => updateField("tagline", e.target.value)}
              placeholder="Short project tagline"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullDescription">Full Description (Markdown)</Label>
            <Textarea
              id="fullDescription"
              value={formData.fullDescription}
              onChange={(e) => updateField("fullDescription", e.target.value)}
              rows={8}
              placeholder="Detailed project description in markdown format"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) => updateField("client", e.target.value)}
                placeholder="e.g., Marketing & Sales"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => updateField("industry", e.target.value)}
                placeholder="e.g., Technology"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="period">Period</Label>
              <Input
                id="period"
                value={formData.period}
                onChange={(e) => updateField("period", e.target.value)}
                placeholder="e.g., 6 months"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={formData.year ?? ""}
                onChange={(e) =>
                  updateField(
                    "year",
                    e.target.value ? parseInt(e.target.value) : undefined,
                  )
                }
                placeholder="e.g., 2024"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newService}
              onChange={(e) => setNewService(e.target.value)}
              placeholder="Add a service (e.g., Web Design)"
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addService())
              }
            />
            <Button
              type="button"
              onClick={addService}
              size="icon"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.services.map((service, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full text-sm"
              >
                {service}
                <button
                  type="button"
                  onClick={() => removeService(index)}
                  className="hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Add a feature (e.g., Multi-Channel Campaign)"
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addFeature())
              }
            />
            <Button
              type="button"
              onClick={addFeature}
              size="icon"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full text-sm"
              >
                {feature}
                <button
                  type="button"
                  onClick={() => removeFeature(index)}
                  className="hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Color Palette */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Color Palette</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 items-end">
            <div className="space-y-1">
              <Label htmlFor="colorPicker" className="text-xs">
                Color
              </Label>
              <div className="flex gap-2">
                <input
                  id="colorPicker"
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="h-10 w-14 cursor-pointer rounded border"
                />
                <Input
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  placeholder="#000000"
                  className="w-24 font-mono text-sm"
                />
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <Label htmlFor="colorName" className="text-xs">
                Name (optional)
              </Label>
              <Input
                id="colorName"
                value={newColorName}
                onChange={(e) => setNewColorName(e.target.value)}
                placeholder="e.g., Primary Blue"
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addColor())
                }
              />
            </div>
            <Button
              type="button"
              onClick={addColor}
              size="icon"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-3">
            {formData.colorPalette.map((color, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg"
              >
                <div
                  className="h-6 w-6 rounded border shadow-sm"
                  style={{ backgroundColor: color.hex }}
                />
                <div className="text-sm">
                  <span className="font-mono text-xs">{color.hex}</span>
                  {color.name && (
                    <span className="ml-1 text-muted-foreground">
                      ({color.name})
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeColor(index)}
                  className="hover:text-destructive ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Video Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Video Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <MediaUpload
              label="Project Video"
              accept="video"
              maxSizeMB={500}
              currentUrl={formData.videoUrl || undefined}
              onUploadComplete={(url, metadata) => {
                setFormData((prev) => ({
                  ...prev,
                  videoUrl: url,
                  // Auto-set poster from Stream thumbnail if available
                  videoPoster:
                    metadata?.thumbnailUrl && !prev.videoPoster
                      ? metadata.thumbnailUrl
                      : prev.videoPoster,
                }));
                setHasChanges(true);
              }}
            />
            {formData.videoUrl && (
              <div className="mt-2">
                <Label className="text-xs text-muted-foreground">
                  Current URL:
                </Label>
                <Input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => updateField("videoUrl", e.target.value)}
                  className="mt-1 text-xs"
                  placeholder="Or paste URL manually"
                />
              </div>
            )}
          </div>

          <div>
            <MediaUpload
              label="Video Poster"
              accept="image"
              maxSizeMB={10}
              currentUrl={formData.videoPoster || undefined}
              onUploadComplete={(url) => updateField("videoPoster", url)}
            />
            {formData.videoPoster && (
              <div className="mt-2">
                <Label className="text-xs text-muted-foreground">
                  Current URL:
                </Label>
                <Input
                  type="url"
                  value={formData.videoPoster}
                  onChange={(e) => updateField("videoPoster", e.target.value)}
                  className="mt-1 text-xs"
                  placeholder="Or paste URL manually"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoAlt">Video Alt Text</Label>
            <Input
              id="videoAlt"
              value={formData.videoAlt}
              onChange={(e) => updateField("videoAlt", e.target.value)}
              placeholder="Accessibility description for video"
            />
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting || !hasChanges}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Details"
          )}
        </Button>
      </div>
    </form>
  );
}
