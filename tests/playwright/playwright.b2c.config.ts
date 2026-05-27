import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const testDirectUrl = process.env.TEST_DIRECT_URL;

if (!testDatabaseUrl || !testDirectUrl) {
  throw new Error("TEST_DATABASE_URL and TEST_DIRECT_URL are required.");
}

process.env.DATABASE_URL = testDatabaseUrl;
process.env.DIRECT_URL = testDirectUrl;
process.env.TEST_DATABASE_URL = testDatabaseUrl;
process.env.TEST_DIRECT_URL = testDirectUrl;
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
  reporter: process.env.CI
    ? [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]]
    : [["list"]],
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
      DIRECT_URL: testDirectUrl,
      E2E: "yes",
      TEST_DATABASE_URL: testDatabaseUrl,
      TEST_DIRECT_URL: testDirectUrl,
    },
    reuseExistingServer: false,
    timeout: 120_000,
    url: "http://localhost:3001",
  },
});
