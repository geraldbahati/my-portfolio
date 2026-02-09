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
 * Uses HLS for adaptive bitrate streaming with mobile support
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
  const autoPlayRef = useRef(autoPlay);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Keep ref in sync so the init effect can read current value without re-running
  autoPlayRef.current = autoPlay;

  // Detect mobile for responsive optimizations
  useEffect(() => {
    const query = window.matchMedia("(max-width: 768px)");
    setIsMobile(query.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  const streamUid = extractStreamUid(src);
  const { ratio } = parseAspectRatio(aspectRatio);

  const hlsUrl = streamUid
    ? `https://customer-pdxnd9di8ybc2kur.cloudflarestream.com/${streamUid}/manifest/video.m3u8`
    : src;

  // Responsive poster: smaller on mobile to reduce bandwidth
  const posterWidth = isMobile ? 640 : 1280;
  const posterUrl =
    poster ||
    (streamUid
      ? getStreamThumbnail(streamUid, {
          width: posterWidth,
          height: Math.round(posterWidth / ratio),
          fit: "crop",
        })
      : undefined);

  // Initialize HLS player — does NOT depend on autoPlay to avoid
  // destroying/recreating the HLS instance on every scroll visibility change
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hlsUrl) return;

    let hls: import("hls.js").default | null = null;
    const isMobileDevice = window.matchMedia("(max-width: 768px)").matches;

    const initPlayer = async () => {
      // Safari/iOS: native HLS support
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = hlsUrl;
        video.addEventListener(
          "canplay",
          () => {
            setIsLoaded(true);
            onLoad?.();
            if (autoPlayRef.current) {
              video.play().catch(() => {});
            }
          },
          { once: true },
        );
        return;
      }

      // HLS.js for other browsers (Chrome, Firefox, etc.)
      try {
        const Hls = (await import("hls.js")).default;

        if (Hls.isSupported()) {
          hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
            startLevel: -1,
            // Smaller buffers on mobile for better memory usage
            maxBufferLength: isMobileDevice ? 15 : 30,
            maxMaxBufferLength: isMobileDevice ? 30 : 60,
          });

          hls.loadSource(hlsUrl);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsLoaded(true);
            onLoad?.();
            if (autoPlayRef.current) {
              video.play().catch(() => {});
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
        hlsRef.current = null;
      }
    };
  }, [hlsUrl, onError, onLoad]);

  // Play/pause control — responds to visibility changes without
  // tearing down the HLS instance
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (autoPlay) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [autoPlay]);

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
        autoPlay={autoPlay}
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
