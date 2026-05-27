import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

const testDatabaseUrl = process.env.TEST_DATABASE_URL || "file:./test.db";

process.env.DATABASE_URL = testDatabaseUrl;
process.env.TEST_DATABASE_URL = testDatabaseUrl;
process.env.E2E = "yes";

export default defineConfig({
  testDir: "./tests/web",
  testMatch: [
    "**/b2c-home-screen.spec.ts",
    "**/products-screen.spec.ts",
    "**/cart-screen.spec.ts",
    "**/customer-auth-screen.spec.ts",
    "**/checkout-screen.spec.ts",
    "**/purchases-screen.spec.ts",
    "**/admin-access-screen.spec.ts",
    "**/admin-products-screen.spec.ts",
    "**/admin-product-create-screen.spec.ts",
    "**/admin-product-edit-screen.spec.ts",
    "**/admin-purchases-screen.spec.ts",
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
  webServer: {
    command: "pnpm --filter @repo/web dev",
    env: {
      ...process.env,
      DATABASE_URL: testDatabaseUrl,
      E2E: "yes",
      TEST_DATABASE_URL: testDatabaseUrl,
    },
    reuseExistingServer: false,
    timeout: 120_000,
    url: "http://localhost:3001",
  },
});
