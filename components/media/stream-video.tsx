"use client";

import { memo, useRef, useEffect, useState, useCallback } from "react";
import type Hls from "hls.js";
import {
  extractStreamUid,
  getStreamThumbnail,
  parseAspectRatio,
} from "@/lib/media-utils";

export interface StreamVideoProps {
  src: string;
  poster?: string;
  aspectRatio?: string | number;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
  onError?: () => void;
  onLoad?: () => void;
}

/**
 * Optimized video player for Cloudflare Stream videos
 * Uses HLS for adaptive bitrate streaming
 */
function StreamVideoComponent({
  src,
  poster,
  aspectRatio = "16/9",
  autoPlay = true,
  muted = true,
  loop = true,
  className = "",
  onError,
  onLoad,
}: StreamVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Extract Stream UID and generate URLs
  const streamUid = extractStreamUid(src);
  const { ratio } = parseAspectRatio(aspectRatio);

  // Generate HLS URL
  const hlsUrl = streamUid
    ? `https://customer-pdxnd9di8ybc2kur.cloudflarestream.com/${streamUid}/manifest/video.m3u8`
    : src;

  // Generate poster URL with optimal dimensions
  const posterUrl =
    poster ||
    (streamUid
      ? getStreamThumbnail(streamUid, {
          width: 1280,
          height: Math.round(1280 / ratio),
          fit: "crop",
        })
      : undefined);

  // Initialize HLS.js for browsers that don't support HLS natively
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hlsUrl) return;

    let hls: import("hls.js").default | null = null;

    const initPlayer = async () => {
      // Check if browser supports HLS natively (Safari)
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hlsUrl;
        return;
      }

      // Use HLS.js for other browsers
      try {
        const Hls = (await import("hls.js")).default;

        if (Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
            // Start with lower quality for faster initial load
            startLevel: -1, // Auto
            // Limit buffer to save memory
            maxBufferLength: 30,
            maxMaxBufferLength: 60,
          });

          hls.loadSource(hlsUrl);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoaded(true);
            onLoad?.();
            if (autoPlay) {
              video.play().catch(() => {
                // Autoplay blocked, user interaction required
              });
            }
          });

          hls.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal) {
              setHasError(true);
              onError?.();
            }
          });

          hlsRef.current = hls;
        }
      } catch (error) {
        console.error("[StreamVideo] Failed to load HLS.js:", error);
        setHasError(true);
        onError?.();
      }
    };

    initPlayer();

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [hlsUrl, autoPlay, onError, onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  if (hasError) {
    return (
      <div
        className={`bg-gray-800 flex items-center justify-center ${className}`}
        style={{ aspectRatio: `${ratio}` }}
      >
        <span className="text-gray-400 text-sm">Video unavailable</span>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio: `${ratio}` }}
    >
      {/* Poster/Loading state */}
      {!isLoaded && posterUrl && (
        <img
          src={posterUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      )}

      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        poster={posterUrl}
        muted={muted}
        loop={loop}
        playsInline
        preload="metadata"
        onError={handleError}
        onLoadedData={() => {
          setIsLoaded(true);
          onLoad?.();
        }}
      />
    </div>
  );
}

export const StreamVideo = memo(StreamVideoComponent);
