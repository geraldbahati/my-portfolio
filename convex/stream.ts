/**
 * Cloudflare Stream Integration for Video Uploads
 *
 * Handles video uploads to Cloudflare Stream for optimal delivery
 * with HLS/DASH adaptive bitrate streaming.
 *
 * Required environment variables:
 * - CLOUDFLARE_ACCOUNT_ID: Your Cloudflare account ID
 * - CLOUDFLARE_API_TOKEN: API token with Stream:Edit permission
 */

import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { requireAdmin } from "./auth";

const STREAM_CUSTOMER_SUBDOMAIN =
  "customer-pdxnd9di8ybc2kur.cloudflarestream.com";

/**
 * Generate a direct upload URL for Cloudflare Stream
 * This allows clients to upload videos directly to Stream
 */
export const generateStreamUploadUrl = action({
  args: {
    maxDurationSeconds: v.optional(v.number()),
  },
  returns: v.object({
    uploadUrl: v.string(),
    uid: v.string(),
  }),
  handler: async (ctx, args): Promise<{ uploadUrl: string; uid: string }> => {
    await requireAdmin(ctx);

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      throw new Error(
        "Cloudflare Stream configuration missing. Set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN",
      );
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          maxDurationSeconds: args.maxDurationSeconds || 3600, // Default 1 hour max
          // Stream API requires origins without protocol
          allowedOrigins: [
            "geraldbahati.dev",
            "www.geraldbahati.dev",
            "localhost:3000",
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Stream] Failed to generate upload URL:", errorText);
      throw new Error("Failed to generate Stream upload URL");
    }

    const data = await response.json();

    if (!data.success) {
      console.error("[Stream] API error:", data.errors);
      throw new Error(data.errors?.[0]?.message || "Stream API error");
    }

    return {
      uploadUrl: data.result.uploadURL,
      uid: data.result.uid,
    };
  },
});

/**
 * Get the status of a video upload/processing
 */
export const getVideoStatus = action({
  args: {
    uid: v.string(),
  },
  returns: v.object({
    ready: v.boolean(),
    status: v.string(),
    duration: v.optional(v.number()),
    thumbnail: v.optional(v.string()),
    playbackUrl: v.optional(v.string()),
    dashUrl: v.optional(v.string()),
    hlsUrl: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      throw new Error("Cloudflare Stream configuration missing");
    }

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${args.uid}`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to get video status");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.errors?.[0]?.message || "Stream API error");
    }

    const video = data.result;
    const isReady = video.status?.state === "ready";

    return {
      ready: isReady,
      status: video.status?.state || "unknown",
      duration: video.duration,
      thumbnail: isReady
        ? `https://${STREAM_CUSTOMER_SUBDOMAIN}/${args.uid}/thumbnails/thumbnail.jpg`
        : undefined,
      playbackUrl: isReady
        ? `https://${STREAM_CUSTOMER_SUBDOMAIN}/${args.uid}/iframe`
        : undefined,
      dashUrl: isReady
        ? `https://${STREAM_CUSTOMER_SUBDOMAIN}/${args.uid}/manifest/video.mpd`
        : undefined,
      hlsUrl: isReady
        ? `https://${STREAM_CUSTOMER_SUBDOMAIN}/${args.uid}/manifest/video.m3u8`
        : undefined,
    };
  },
});

/**
 * Delete a video from Cloudflare Stream
 */
export const deleteVideo = action({
  args: {
    uid: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    await requireAdmin(ctx);
    return await deleteStreamVideo(args.uid);
  },
});

/**
 * Internal action to delete a video (called from other actions)
 */
export const deleteVideoInternal = internalAction({
  args: {
    uid: v.string(),
  },
  returns: v.null(),
  handler: async (_ctx, args): Promise<null> => {
    return await deleteStreamVideo(args.uid);
  },
});

/**
 * Shared function to delete a Stream video
 */
async function deleteStreamVideo(uid: string): Promise<null> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error("Cloudflare Stream configuration missing");
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${uid}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[Stream] Failed to delete video:", errorText);
    throw new Error("Failed to delete video");
  }

  return null;
}

/**
 * Get the optimized playback URL for a Stream video
 */
export function getStreamPlaybackUrl(uid: string): string {
  return `https://${STREAM_CUSTOMER_SUBDOMAIN}/${uid}/manifest/video.m3u8`;
}

/**
 * Get the thumbnail URL for a Stream video
 */
export function getStreamThumbnailUrl(
  uid: string,
  options?: {
    time?: string; // e.g., "1s", "50%"
    width?: number;
    height?: number;
  },
): string {
  const params = new URLSearchParams();
  if (options?.time) params.set("time", options.time);
  if (options?.width) params.set("width", options.width.toString());
  if (options?.height) params.set("height", options.height.toString());

  const queryString = params.toString();
  return `https://${STREAM_CUSTOMER_SUBDOMAIN}/${uid}/thumbnails/thumbnail.jpg${queryString ? `?${queryString}` : ""}`;
}
