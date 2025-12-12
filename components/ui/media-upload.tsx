"use client";

import { useState, useCallback, useRef } from "react";
import { useUploadFile } from "@convex-dev/r2/react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Spinner } from "./spinner";
import {
  getTransformedImageUrl,
  getStreamVideoUrls,
} from "@/lib/cloudflare-media";

interface MediaUploadProps {
  onUploadComplete: (url: string, metadata?: UploadMetadata) => void;
  accept?: "image" | "video" | "both";
  maxSizeMB?: number;
  className?: string;
  currentUrl?: string;
  label?: string;
}

interface UploadMetadata {
  key?: string;
  streamUid?: string;
  thumbnailUrl?: string;
  type: "image" | "video";
  originalName: string;
}

interface UploadState {
  status:
    | "idle"
    | "compressing"
    | "uploading"
    | "processing"
    | "complete"
    | "error";
  progress: number;
  error?: string;
  message?: string;
}

const MEDIA_BASE_URL = "https://media.geraldbahati.dev";

/**
 * Compress an image using canvas
 */
async function compressImage(
  file: File,
  maxWidth = 1920,
  quality = 0.85,
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      let { width, height } = img;

      // Scale down if needed
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Could not compress image"));
            return;
          }

          // If compressed is larger, use original
          if (blob.size >= file.size) {
            resolve(file);
            return;
          }

          const compressedFile = new File([blob], file.name, {
            type: "image/webp",
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        },
        "image/webp",
        quality,
      );
    };

    img.onerror = () => reject(new Error("Could not load image"));
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Get accept string for file input
 */
function getAcceptString(accept: "image" | "video" | "both"): string {
  switch (accept) {
    case "image":
      return "image/jpeg,image/png,image/gif,image/webp";
    case "video":
      return "video/mp4,video/webm,video/quicktime";
    case "both":
      return "image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime";
  }
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function MediaUpload({
  onUploadComplete,
  accept = "both",
  maxSizeMB = 100,
  className,
  currentUrl,
  label = "Upload Media",
}: MediaUploadProps) {
  const uploadFile = useUploadFile(api.r2);
  const generateStreamUploadUrl = useAction(api.stream.generateStreamUploadUrl);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
    progress: 0,
  });
  const [preview, setPreview] = useState<string | null>(currentUrl || null);

  /**
   * Upload video to Cloudflare Stream
   */
  const uploadToStream = useCallback(
    async (file: File): Promise<{ uid: string; hlsUrl: string }> => {
      // Get direct upload URL from Convex
      const { uploadUrl, uid } = await generateStreamUploadUrl({
        maxDurationSeconds: 3600, // 1 hour max
      });

      // Upload directly to Stream
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload video to Stream");
      }

      // Get the HLS URL
      const { hls } = getStreamVideoUrls(uid);

      return { uid, hlsUrl: hls };
    },
    [generateStreamUploadUrl],
  );

  /**
   * Upload image to R2
   */
  const uploadToR2 = useCallback(
    async (file: File): Promise<{ key: string; url: string }> => {
      const key = await uploadFile(file);
      const url = `${MEDIA_BASE_URL}/${key}`;
      return { key, url };
    },
    [uploadFile],
  );

  const handleFile = useCallback(
    async (file: File) => {
      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      if (file.size > maxSizeBytes) {
        setUploadState({
          status: "error",
          progress: 0,
          error: `File too large. Maximum size is ${maxSizeMB}MB`,
        });
        return;
      }

      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");

      if (!isImage && !isVideo) {
        setUploadState({
          status: "error",
          progress: 0,
          error: "Unsupported file type",
        });
        return;
      }

      try {
        // Set preview
        const previewUrl = URL.createObjectURL(file);
        setPreview(previewUrl);

        if (isVideo) {
          // Upload video to Cloudflare Stream
          setUploadState({
            status: "uploading",
            progress: 30,
            message: "Uploading to Stream...",
          });

          const { uid, hlsUrl } = await uploadToStream(file);

          setUploadState({
            status: "processing",
            progress: 80,
            message: "Processing video...",
          });

          // Get thumbnail URL
          const { thumbnail } = getStreamVideoUrls(uid);

          setUploadState({ status: "complete", progress: 100 });

          onUploadComplete(hlsUrl, {
            streamUid: uid,
            thumbnailUrl: thumbnail,
            type: "video",
            originalName: file.name,
          });
        } else {
          // Upload image to R2
          let fileToUpload = file;

          // Compress images (except GIFs)
          if (!file.type.includes("gif")) {
            setUploadState({
              status: "compressing",
              progress: 10,
              message: "Compressing...",
            });
            fileToUpload = await compressImage(file);
            console.log(
              `[Upload] Compressed ${formatBytes(file.size)} -> ${formatBytes(fileToUpload.size)}`,
            );
          }

          setUploadState({
            status: "uploading",
            progress: 50,
            message: "Uploading...",
          });

          const { key, url } = await uploadToR2(fileToUpload);

          // Generate optimized URL using Cloudflare Image Transformations
          const optimizedUrl = getTransformedImageUrl(url, {
            format: "auto",
            quality: 85,
          });

          setUploadState({ status: "complete", progress: 100 });

          onUploadComplete(url, {
            key,
            type: "image",
            originalName: file.name,
            // Include transformed URL for display purposes
            thumbnailUrl: optimizedUrl,
          });
        }
      } catch (error) {
        console.error("[Upload] Failed:", error);
        setUploadState({
          status: "error",
          progress: 0,
          error: error instanceof Error ? error.message : "Upload failed",
        });
        setPreview(null);
      }
    },
    [maxSizeMB, onUploadComplete, uploadToStream, uploadToR2],
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile],
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleRemove = useCallback(() => {
    setPreview(null);
    setUploadState({ status: "idle", progress: 0 });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const isUploading =
    uploadState.status === "compressing" ||
    uploadState.status === "uploading" ||
    uploadState.status === "processing";

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium">{label}</label>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!isUploading ? handleClick : undefined}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          isUploading && "pointer-events-none opacity-75",
          uploadState.status === "error" && "border-destructive",
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={getAcceptString(accept)}
          onChange={handleInputChange}
          className="hidden"
          disabled={isUploading}
        />

        {preview ? (
          <div className="relative">
            {preview.includes("video") ||
            preview.endsWith(".mp4") ||
            preview.endsWith(".webm") ||
            preview.includes(".m3u8") ? (
              <video
                src={preview}
                className="w-full h-32 object-cover rounded"
                muted
                playsInline
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt="Preview"
                className="w-full h-32 object-cover rounded"
              />
            )}

            {uploadState.status === "complete" && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                Remove
              </Button>
            )}

            {isUploading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded">
                <div className="flex flex-col items-center gap-2">
                  <Spinner className="h-6 w-6" />
                  <span className="text-sm">
                    {uploadState.message || "Uploading..."}
                  </span>
                  {uploadState.progress > 0 && (
                    <div className="w-32 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${uploadState.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 text-muted-foreground">
            <svg
              className="h-10 w-10 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm font-medium">
              {dragActive ? "Drop file here" : "Click or drag to upload"}
            </p>
            <p className="text-xs mt-1">
              {accept === "image" && "Images up to "}
              {accept === "video" && "Videos up to "}
              {accept === "both" && "Images/videos up to "}
              {maxSizeMB}MB
            </p>
            {accept === "video" || accept === "both" ? (
              <p className="text-xs text-muted-foreground/70 mt-1">
                Videos are optimized via Cloudflare Stream
              </p>
            ) : null}
          </div>
        )}
      </div>

      {uploadState.status === "error" && (
        <p className="text-sm text-destructive">{uploadState.error}</p>
      )}

      {uploadState.status === "complete" && (
        <p className="text-sm text-green-600">Upload complete</p>
      )}
    </div>
  );
}
