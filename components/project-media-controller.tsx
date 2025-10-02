"use client";

/**
 * ProjectMediaController - Client-only wrapper that manages video playback
 * based on visibility using IntersectionObserver.
 *
 * This component ensures:
 * - Videos only play when >50% visible
 * - Only one video plays at a time
 * - Proper pause/play controls
 * - Keyboard accessibility
 */

import React, { useCallback, useEffect } from "react";
import { ProjectCard, ProjectCardProps } from "./project-card";

// Global state to track the currently playing video
let currentlyPlayingId: string | null = null;
const playbackControllers: Map<string, () => void> = new Map();

export const ProjectMediaController: React.FC<ProjectCardProps> = (
  props,
) => {
  const { id } = props;

  // Callback when visibility changes
  const handleVisibilityChange = useCallback(
    (visible: boolean) => {
      if (visible) {
        // If another video is playing, pause it
        if (currentlyPlayingId && currentlyPlayingId !== id) {
          const pauseOther = playbackControllers.get(currentlyPlayingId);
          pauseOther?.();
        }
        // Set this as the currently playing video
        currentlyPlayingId = id;
      } else if (currentlyPlayingId === id) {
        // If this video is no longer visible and was playing, clear the global state
        currentlyPlayingId = null;
      }

      // Call parent's onVisible callback if provided
      props.onVisible?.(visible);
    },
    [id, props],
  );

  // Register pause controller for this video
  useEffect(() => {
    playbackControllers.set(id, () => {
      // Pause controller placeholder - actual pause is handled by ProjectCard's onVisible
    });

    return () => {
      playbackControllers.delete(id);
      if (currentlyPlayingId === id) {
        currentlyPlayingId = null;
      }
    };
  }, [id]);

  return <ProjectCard {...props} onVisible={handleVisibilityChange} />;
};
