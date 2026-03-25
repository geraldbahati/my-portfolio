"use client";

import { memo, useRef, useEffect, useState, useCallback } from "react";
import type Hls from "hls.js";
import {
  extractStreamUid,
  getStreamThumbnail,
  parseAspectRatio,
} from "@/lib/media-utils";
import Image from "next/image";
import { useMediaQuery } from "@/hooks/use-media-query";

export interface StreamVideoProps {
  src: string;
  poster?: string;
  alt?: string;
  aspectRatio?: string | number;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
  onError?: () => void;
  onLoad?: () => void;
}

async function initHlsPlayer(
  video: HTMLVideoElement,
  hlsUrl: string,
  isMobileDevice: boolean,
  autoPlayRef: { current: boolean },
  callbacks: {
    onLoaded: () => void;
    onError: () => void;
  },
): Promise<Hls | null> {
  if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = hlsUrl;
    video.addEventListener(
      "canplay",
      () => {
        callbacks.onLoaded();
        if (autoPlayRef.current) {
          video.play().catch(() => {});
        }
      },
      { once: true },
    );
    return null;
  }

  try {
    const HlsModule = (await import("hls.js")).default;

    if (HlsModule.isSupported()) {
      const hls = new HlsModule({
        enableWorker: true,
        lowLatencyMode: false,
        // Start at lowest quality on mobile for faster first frame, auto on desktop
        startLevel: isMobileDevice ? 0 : -1,
        maxBufferLength: isMobileDevice ? 15 : 30,
        maxMaxBufferLength: isMobileDevice ? 30 : 60,
      });

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(HlsModule.Events.MANIFEST_PARSED, () => {
        callbacks.onLoaded();
        if (autoPlayRef.current) {
          video.play().catch(() => {});
        }
      });

      hls.on(HlsModule.Events.ERROR, (_, data) => {
        if (data.fatal) {
          callbacks.onError();
        }
      });

      return hls;
    }
  } catch (error) {
    console.error("[StreamVideo] Failed to load HLS.js:", error);
    callbacks.onError();
  }
  return null;
}

/**
 * Optimized video player for Cloudflare Stream videos
 * Uses HLS for adaptive bitrate streaming with mobile support
 */
function StreamVideoComponent({
  src,
  poster,
  alt = "Video preview",
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
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Keep ref in sync so the init effect can read current value without re-running
  useEffect(() => {
    autoPlayRef.current = autoPlay;
  });

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

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hlsUrl) return;

    const isMobileDevice = window.matchMedia("(max-width: 768px)").matches;

    initHlsPlayer(video, hlsUrl, isMobileDevice, autoPlayRef, {
      onLoaded: () => {
        setIsLoaded(true);
        onLoad?.();
      },
      onError: () => {
        setHasError(true);
        onError?.();
      },
    }).then((instance) => {
      hlsRef.current = instance;
    });

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
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
      {/* Poster: shown while loading OR when video is paused (not in view) */}
      {(!isLoaded || !autoPlay) && posterUrl && (
        <Image
          src={posterUrl}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          className="object-cover z-[1]"
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
