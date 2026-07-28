import { expect, test } from "@playwright/test";

test("homepage renders its primary content", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Gerald Bahati/i);
  await expect(
    page.getByRole("heading", { level: 1, name: "Gerald Bahati" }),
  ).toBeVisible();
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("body")).not.toHaveCSS("overflow-x", "scroll");
});

test("homepage exposes a consistent branded SEO identity", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await expect(page).toHaveTitle(
    "Gerald Bahati | Full-Stack Software Engineer in Nairobi",
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://www.geraldbahati.dev",
  );
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute(
    "content",
    "Gerald Bahati",
  );

  const jsonLd = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  const structuredData = jsonLd.join("\n");

  expect(structuredData).toContain('"@type":"WebSite"');
  expect(structuredData).toContain('"@type":"ProfilePage"');
  expect(structuredData).toContain('"@type":"Person"');
  expect(structuredData).toContain('"name":"Gerald Bahati"');
  expect(structuredData).toContain(
    '"@id":"https://www.geraldbahati.dev/#gerald-bahati"',
  );
});

test("crawl directives only advertise canonical indexable URLs", async ({
  request,
}) => {
  const [robotsResponse, sitemapResponse, privacyResponse] = await Promise.all([
    request.get("/robots.txt"),
    request.get("/sitemap.xml"),
    request.get("/privacy"),
  ]);

  expect(robotsResponse.ok()).toBeTruthy();
  expect(sitemapResponse.ok()).toBeTruthy();
  expect(privacyResponse.ok()).toBeTruthy();

  const robots = await robotsResponse.text();
  const sitemap = await sitemapResponse.text();
  const privacy = await privacyResponse.text();

  expect(robots).toContain(
    "Sitemap: https://www.geraldbahati.dev/sitemap.xml",
  );
  expect(sitemap).toContain("<loc>https://www.geraldbahati.dev</loc>");
  expect(sitemap).not.toContain("<loc>https://geraldbahati.dev");
  expect(sitemap).not.toContain("/privacy</loc>");
  expect(sitemap).not.toContain("/imprint</loc>");
  expect(privacy).toContain('name="robots" content="noindex, follow"');
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
