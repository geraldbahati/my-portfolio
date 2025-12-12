/**
 * R2 Storage Integration for Portfolio Projects
 *
 * Handles file uploads to Cloudflare R2 with metadata syncing.
 * Files are served via custom domain: media.geraldbahati.dev
 */

import { R2, type R2Callbacks } from "@convex-dev/r2";
import { internalAction } from "./_generated/server";
import { components, internal } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { requireAdmin } from "./auth";
import { v } from "convex/values";

export const r2 = new R2(components.r2);

const callbacks: R2Callbacks = internal.r2;

/**
 * Client API for R2 operations
 * - generateUploadUrl: Creates presigned URL for direct upload
 * - syncMetadata: Syncs file metadata after upload
 * - getMetadata: Retrieves metadata for a file
 * - deleteObject: Deletes a file from R2
 */
export const {
  generateUploadUrl,
  syncMetadata,
  getMetadata,
  deleteObject,
  onSyncMetadata,
} = r2.clientApi<DataModel>({
  // Only admins can upload files
  checkUpload: async (ctx) => {
    await requireAdmin(ctx);
  },

  // Only admins can delete files
  checkDelete: async (ctx) => {
    await requireAdmin(ctx);
  },

  // Called after metadata is synced (upload complete)
  onSyncMetadata: async (ctx, args) => {
    const metadata = await r2.getMetadata(ctx, args.key);
    console.log(
      `[R2] File synced: ${args.key}`,
      metadata?.contentType,
      `${Math.round((metadata?.size ?? 0) / 1024)}KB`,
    );
  },

  callbacks,
});

/**
 * Get the public URL for a file stored in R2
 * Uses the custom domain for production delivery
 */
export function getPublicUrl(key: string): string {
  return `https://media.geraldbahati.dev/${key}`;
}

/**
 * Generate a unique key for uploaded files
 * Format: projects/{type}/{timestamp}-{random}.{extension}
 */
export function generateFileKey(
  filename: string,
  type: "video" | "image",
): string {
  const extension = filename.split(".").pop()?.toLowerCase() || "bin";
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `projects/${type}/${timestamp}-${random}.${extension}`;
}

/**
 * Internal action to delete an object from R2 (called from other actions)
 */
export const deleteObjectInternal = internalAction({
  args: {
    key: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    await r2.deleteObject(ctx, args.key);
    console.log(`[R2] Deleted object: ${args.key}`);
    return null;
  },
});
