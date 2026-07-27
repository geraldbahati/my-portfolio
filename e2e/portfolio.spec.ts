import { expect, test } from "@playwright/test";

test("homepage renders its primary content", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Gerald Bahati/i);
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
});

test("project and contact routes remain navigable", async ({ page }) => {
  // These routes pull posters and video from Cloudflare and stream their
  // content through Suspense. Waiting for the full `load` event makes the test
  // hostage to third-party media, so we wait for the document and let the
  // assertions auto-wait for what actually matters — a stronger check than
  // "every asset finished downloading".
  //
  // The wider budget is measured, not guessed: driving this page directly in
  // Playwright's chromium resolves the heading to a single 1216x36 element in
  // roughly four seconds. The default 30s is only tight because two browser
  // projects run in parallel.
  test.setTimeout(60_000);

  await page.goto("/projects", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible({
    timeout: 15_000,
  });

  await page.goto("/contact", { waitUntil: "domcontentloaded" });
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

test("production keeps the development admin dashboard unavailable", async ({
  request,
}) => {
  test.skip(!process.env.CI, "The admin dashboard is available in development.");

  const response = await request.get("/admin", { maxRedirects: 0 });
  const location = response.headers().location;

  expect([307, 308]).toContain(response.status());
  expect(location).toBeDefined();
  expect(new URL(location!, "http://127.0.0.1:3100").pathname).toBe("/");
});
