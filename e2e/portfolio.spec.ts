import { expect, test } from "@playwright/test";

test("homepage renders its primary content", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Gerald Bahati/i);
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
});

test("project and contact routes remain navigable", async ({ page }) => {
  await page.goto("/projects");
  await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();

  await page.goto("/contact");
  await expect(
    page.getByRole("heading", { name: "Request a project" }),
  ).toBeVisible();
  // Role + exact name rather than getByLabel: label matching is a substring
  // match, so "Message" also resolved the WhatsApp link (aria-label "WhatsApp
  // message") and the consent checkbox, tripping strict mode.
  await expect(
    page.getByRole("textbox", { name: "Name", exact: true }),
  ).toBeEditable();
  await expect(
    page.getByRole("textbox", { name: "Email", exact: true }),
  ).toBeEditable();
  await expect(
    page.getByRole("textbox", { name: "Message", exact: true }),
  ).toBeEditable();
});

test("production security headers are present", async ({ request }) => {
  const response = await request.get("/privacy");
  const headers = response.headers();

  expect(response.ok()).toBeTruthy();
  expect(headers["content-security-policy"]).toContain("default-src 'self'");
  expect(headers["content-security-policy"]).toContain("object-src 'none'");
  expect(headers["permissions-policy"]).toContain("camera=()");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
});
