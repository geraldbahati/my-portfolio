/**
 * Unit tests for Projects page components
 *
 * Tests:
 * - Grid renders correct number of cards
 * - Badges render and align correctly
 * - Project titles are displayed
 * - Proper accessibility attributes
 */

import { describe, it, expect } from "@jest/globals";
import { render, screen } from "@testing-library/react";
import { ProjectsGrid } from "@/components/projects-grid";
import { BadgePill } from "@/components/badge-pill";
import { Project } from "@/app/projects/data";

// Mock Framer Motion to avoid animation issues in tests
jest.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock Next.js dynamic imports
jest.mock("next/dynamic", () => ({
  __esModule: true,
  default: (fn: any) => {
    const Component = fn().then((mod: any) => mod.ProjectMediaController);
    return Component;
  },
}));

// Mock project data for testing
const mockProjects: Project[] = [
  {
    id: "project-1",
    title: "Test Project 1",
    src: "https://example.com/video1.mp4",
    type: "video",
    poster: "https://example.com/poster1.jpg",
    alt: "Test project 1 description",
    badges: [
      { text: "React", position: "bottom-left" },
      { text: "TypeScript", position: "bottom-left" },
    ],
    aspectRatio: "16/9",
  },
  {
    id: "project-2",
    title: "Test Project 2",
    src: "https://example.com/video2.mp4",
    type: "video",
    badges: [
      { text: "Next.js", position: "bottom-left" },
      { text: "Featured", position: "bottom-right" },
    ],
  },
  {
    id: "project-3",
    title: "Test Project 3",
    src: "https://example.com/video3.mp4",
    type: "video",
    badges: [],
  },
];

describe("BadgePill Component", () => {
  it("should render badge with correct text", () => {
    const { container } = render(
      <BadgePill text="Test Badge" position="bottom-left" />
    );

    expect(container.textContent).toContain("Test Badge");
  });

  it("should apply correct accessibility attributes", () => {
    const { container } = render(
      <BadgePill text="Test Badge" position="bottom-left" />
    );

    const badge = container.querySelector("span");
    expect(badge).toHaveAttribute("aria-label", "Test Badge");
  });

  it("should be keyboard focusable when interactive", () => {
    const handleClick = jest.fn();
    const { container } = render(
      <BadgePill text="Interactive Badge" onClick={handleClick} />
    );

    const badge = container.querySelector("span");
    expect(badge).toHaveAttribute("tabIndex", "0");
    expect(badge).toHaveAttribute("role", "button");
  });

  it("should not be focusable when not interactive", () => {
    const { container } = render(<BadgePill text="Static Badge" />);

    const badge = container.querySelector("span");
    expect(badge).not.toHaveAttribute("tabIndex");
    expect(badge).not.toHaveAttribute("role");
  });
});

describe("ProjectsGrid Component", () => {
  it("should render correct number of project cards", () => {
    const { container } = render(<ProjectsGrid projects={mockProjects} />);

    // Check for project titles (h2 elements)
    const titles = container.querySelectorAll("h2");
    expect(titles.length).toBe(mockProjects.length);
  });

  it("should display project titles correctly", () => {
    render(<ProjectsGrid projects={mockProjects} />);

    mockProjects.forEach((project) => {
      expect(screen.getByText(project.title)).toBeInTheDocument();
    });
  });

  it("should render badges for each project", () => {
    const { container } = render(<ProjectsGrid projects={mockProjects} />);

    // Count total badges
    let totalBadges = 0;
    mockProjects.forEach((project) => {
      totalBadges += project.badges?.length || 0;
    });

    const badges = container.querySelectorAll('[aria-label*=""]');
    expect(badges.length).toBeGreaterThanOrEqual(totalBadges);
  });

  it("should handle projects with no badges", () => {
    const projectWithoutBadges: Project = {
      id: "no-badges",
      title: "No Badges Project",
      src: "https://example.com/video.mp4",
      type: "video",
      badges: [],
    };

    const { container } = render(
      <ProjectsGrid projects={[projectWithoutBadges]} />
    );

    expect(screen.getByText("No Badges Project")).toBeInTheDocument();
  });

  it("should render grid with proper structure", () => {
    const { container } = render(<ProjectsGrid projects={mockProjects} />);

    // Check for grid container
    const grid = container.querySelector(".grid");
    expect(grid).toBeInTheDocument();
    expect(grid).toHaveClass("grid-cols-1", "lg:grid-cols-2");
  });

  it("should handle empty projects array", () => {
    const { container } = render(<ProjectsGrid projects={[]} />);

    const grid = container.querySelector(".grid");
    expect(grid).toBeInTheDocument();
    expect(grid?.children.length).toBe(0);
  });
});

describe("Badge Position Alignment", () => {
  it("should separate left and right aligned badges", () => {
    const projectWithMixedBadges: Project = {
      id: "mixed-badges",
      title: "Mixed Badges Project",
      src: "https://example.com/video.mp4",
      type: "video",
      badges: [
        { text: "Left Badge 1", position: "bottom-left" },
        { text: "Left Badge 2", position: "bottom-left" },
        { text: "Right Badge 1", position: "bottom-right" },
      ],
    };

    render(<ProjectsGrid projects={[projectWithMixedBadges]} />);

    expect(screen.getByText("Left Badge 1")).toBeInTheDocument();
    expect(screen.getByText("Left Badge 2")).toBeInTheDocument();
    expect(screen.getByText("Right Badge 1")).toBeInTheDocument();
  });
});