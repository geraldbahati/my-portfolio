"use client";

import { useRef, useEffect, useState } from "react";
import type Hls from "hls.js";
import {
  extractStreamUid,
  getStreamThumbnail,
  parseAspectRatio,
} from "@/lib/media-utils";
import { streamThumbnailLoader } from "@/lib/stream-thumbnail-loader";
import Image from "next/image";

export interface StreamVideoProps {
  src: string;
  poster?: string;
  alt?: string;
  aspectRatio?: string | number;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  className?: string;
  showPosterWhenPaused?: boolean;
  /**
   * Whether the player should load. When false, only the poster renders and no
   * HLS/manifest/segments are fetched — so off-screen cards stay idle until
   * they scroll into view. Latches on: once activated the instance is kept for
   * fast resume, and playback is gated by `autoPlay`.
   */
  active?: boolean;
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
  showPosterWhenPaused = true,
  active = true,
  onError,
  onLoad,
}: StreamVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const autoPlayRef = useRef(autoPlay);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  // Latch: once the card has been in view, keep the player initialized so
  // scrolling back is instant. Until then, nothing is loaded.
  const [hasActivated, setHasActivated] = useState(active);

  // Keep ref in sync so the init effect can read current value without re-running
  useEffect(() => {
    autoPlayRef.current = autoPlay;
  });

  // The latch only ever flips false -> true, so it can be set during render.
  // An effect would commit the un-activated state first and re-render, which
  // costs a frame on the very scroll where the player should already be warming.
  if (active && !hasActivated) {
    setHasActivated(true);
  }

  const streamUid = extractStreamUid(src);
  const { ratio } = parseAspectRatio(aspectRatio);

  const hlsUrl = streamUid
    ? `https://customer-pdxnd9di8ybc2kur.cloudflarestream.com/${streamUid}/manifest/video.m3u8`
    : src;

  // Poster overlay (<Image>): for generated Stream thumbnails, serve straight
  // from Cloudflare's edge via the custom loader (next/image builds the srcSet),
  // instead of re-optimizing through /_next/image. Explicit posters keep the
  // default optimizer path.
  const useStreamPosterLoader = !poster && !!streamUid;
  const overlayPosterSrc = useStreamPosterLoader
    ? getStreamThumbnail(streamUid!, { time: "1s", fit: "crop" })
    : poster;
  // Native <video poster> attribute can't use a loader, so give it a concrete URL.
  const nativePosterUrl =
    poster ||
    (streamUid
      ? getStreamThumbnail(streamUid, { width: 1280, fit: "crop" })
      : undefined);

  useEffect(() => {
    if (!hasActivated) return;
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
  }, [hasActivated, hlsUrl, onError, onLoad]);

  // Play/pause + buffering control. Pausing out of view also stops HLS loading
  // (frees bandwidth/decoders) without destroying the instance; resuming
  // restarts the load. The instance is torn down only on unmount (above).
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !hasActivated) return;

    if (autoPlay) {
      hlsRef.current?.startLoad();
      video.play().catch(() => {});
    } else {
      video.pause();
      hlsRef.current?.stopLoad();
    }
  }, [autoPlay, hasActivated]);

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

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
      {/* Poster: shown before activation, while loading, and optionally while paused. */}
      {(!hasActivated || !isLoaded || (showPosterWhenPaused && !autoPlay)) &&
        overlayPosterSrc && (
          <Image
            loader={useStreamPosterLoader ? streamThumbnailLoader : undefined}
            src={overlayPosterSrc}
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
        poster={nativePosterUrl}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        preload={hasActivated ? "metadata" : "none"}
        onError={handleError}
        onLoadedData={() => {
          setIsLoaded(true);
          onLoad?.();
        }}
      >
        <track
          default
          kind="captions"
          src="/captions/project-preview.vtt"
          srcLang="en"
          label="English"
        />
      </video>
    </div>
  );
}

export const StreamVideo = StreamVideoComponent;
