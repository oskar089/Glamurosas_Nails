import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./client/tests",
  fullyParallel: true,
  workers: 2,
  retries: 0,
  timeout: 45000,
  expect: { timeout: 10000 },
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    channel: process.env.PLAYWRIGHT_CHANNEL || "msedge",
    timezoneId: "America/Los_Angeles",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    {
      name: "mobile",
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: "pnpm run start",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    timeout: 30000,
  },
});
