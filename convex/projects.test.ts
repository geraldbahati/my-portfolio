/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob(["./**/*.*s", "!./**/*.test.*"]);

async function insertProject(
  published: boolean,
  slug = published ? "published-project" : "draft-project",
) {
  const t = convexTest(schema, modules);
  const now = Date.now();

  await t.run(async (ctx) => {
    await ctx.db.insert("projects", {
      id: slug,
      title: published ? "Published project" : "Draft project",
      src: "/project.webp",
      type: "gif",
      order: 0,
      isPublished: published,
      createdAt: now,
      updatedAt: now,
    });
  });

  return { slug, t };
}

describe("public project reads", () => {
  it("returns published projects by slug", async () => {
    const { slug, t } = await insertProject(true);

    const project = await t.query(api.projects.getProjectById, {
      projectId: slug,
    });

    expect(project?.id).toBe(slug);
    expect(project?.isPublished).toBe(true);
  });

  it("hides unpublished projects from direct reads", async () => {
    const { slug, t } = await insertProject(false);

    const project = await t.query(api.projects.getProjectById, {
      projectId: slug,
    });
    const details = await t.query(api.projects.getFullProjectDetails, {
      projectSlug: slug,
    });

    expect(project).toBeNull();
    expect(details).toBeNull();
  });
});
