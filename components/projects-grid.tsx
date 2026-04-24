"use client";

/**
 * ProjectsGrid - Responsive grid layout for project cards
 *
 * Features:
 * - Two-column layout on desktop, single column on mobile
 * - Fade-in animations when cards enter viewport
 * - Badge rendering below each card
 * - Equal card heights and consistent spacing
 */

import React from "react";
import { m } from "motion/react";
import { Project } from "@/app/(root)/projects/data";
import { BadgePill } from "./badge-pill";
import dynamic from "next/dynamic";
import { AdaptiveLink } from "@/components/AdaptiveLink";

// Dynamically import ProjectMediaController to avoid SSR issues
const ProjectMediaController = dynamic(
  () =>
    import("./project-media-controller").then(
      (mod) => mod.ProjectMediaController,
    ),
  { ssr: false },
);

export interface ProjectsGridProps {
  projects: Project[];
}

export const ProjectsGrid: React.FC<ProjectsGridProps> = ({ projects }) => {
  // Animation variants for fade-in effect
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      {projects.map((project, index) => (
        <m.div
          key={project.id}
          className="flex flex-col"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          transition={{
            duration: 0.5,
            delay: index * 0.1,
            ease: "easeOut",
          }}
          variants={cardVariants}
        >
          {/* Project Title */}
          <h2 className="text-xl lg:text-2xl font-semibold mb-4 text-foreground">
            <AdaptiveLink
              href={`/projects/${project.id}`}
              className="hover:text-primary transition-colors"
              prefetchOnViewport
              prefetchRootMargin="250px"
            >
              {project.title}
            </AdaptiveLink>
          </h2>

          {/* Project Card */}
          <div className="flex-1 mb-4">
            <ProjectMediaController
              id={project.id}
              src={project.src}
              type={project.type}
              poster={project.poster}
              alt={project.alt || project.title}
              url={project.url}
              aspectRatio={project.aspectRatio}
              className="shadow-lg hover:shadow-xl transition-shadow duration-300"
            />
          </div>

          {/* Badges Container */}
          {project.badges && project.badges.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {/* Group badges by position */}
              {(() => {
                const leftBadges = project.badges.filter(
                  (b) => !b.position || b.position === "bottom-left",
                );
                const rightBadges = project.badges.filter(
                  (b) => b.position === "bottom-right",
                );

                return (
                  <>
                    {/* Left-aligned badges */}
                    <div className="flex flex-wrap gap-2 flex-1">
                      {leftBadges.map((badge, badgeIndex) => (
                        <BadgePill
                          key={`${project.id}-badge-left-${badgeIndex}`}
                          text={badge.text}
                          position={badge.position}
                        />
                      ))}
                    </div>

                    {/* Right-aligned badges */}
                    {rightBadges.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-end">
                        {rightBadges.map((badge, badgeIndex) => (
                          <BadgePill
                            key={`${project.id}-badge-right-${badgeIndex}`}
                            text={badge.text}
                            position={badge.position}
                          />
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </m.div>
      ))}
    </div>
  );
};
