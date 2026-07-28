import { defineConfig, devices } from "@playwright/test";

const port = 3_100;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    // No --hostname: binding to 127.0.0.1 makes Next's internal proxy dial
    // `localhost`, which resolves to ::1 where nothing is listening, so every
    // request dies with "Failed to proxy ... ECONNRESET" and the health check
    // times out. Default binding covers both stacks.
    command: process.env.CI
      ? `npm run start -- --port ${port}`
      : `npm run dev:frontend -- --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
