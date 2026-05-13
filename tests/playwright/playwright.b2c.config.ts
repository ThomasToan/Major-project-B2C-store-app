import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

export default defineConfig({
  testDir: "./tests/web",
  testMatch: [
    "**/products-screen.spec.ts",
    "**/cart-screen.spec.ts",
    "**/checkout-screen.spec.ts",
  ],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3001",
    screenshot: "only-on-failure",
    testIdAttribute: "data-test-id",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "b2c-chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  webServer: process.env.CI
    ? {
        command: "pnpm --filter @repo/web start:e2e",
        reuseExistingServer: true,
        url: "http://localhost:3001",
      }
    : undefined,
});
