import { describe, expect, it } from "vitest";
import { SITE_URL } from "./constants";
import { canonicalUrl, toAbsoluteSiteUrl } from "./urls";

describe("toAbsoluteSiteUrl", () => {
  it("resolves root-relative and path-relative assets against the canonical site", () => {
    expect(toAbsoluteSiteUrl("/images/project.webp")).toBe(
      `${SITE_URL}/images/project.webp`,
    );
    expect(toAbsoluteSiteUrl("images/project.webp")).toBe(
      `${SITE_URL}/images/project.webp`,
    );
  });

  it("preserves already absolute asset URLs", () => {
    expect(toAbsoluteSiteUrl("https://media.example.com/project.webp")).toBe(
      "https://media.example.com/project.webp",
    );
  });
});

describe("canonicalUrl", () => {
  it("does not append a trailing slash to the site root", () => {
    expect(canonicalUrl("/")).toBe(SITE_URL);
    expect(canonicalUrl("/projects")).toBe(`${SITE_URL}/projects`);
  });
});
