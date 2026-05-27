import { client } from "@repo/db/client";
import { seed } from "@repo/db/seed";
import { expect, test, type Page } from "./fixtures";

const customerPassword = "customer123";
const adminEmail = "admin@thomasstore.com";
const adminPassword = "admin123";

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

async function registerCustomer(page: Page) {
  const customer = {
    email: uniqueEmail("admin-access-customer"),
    name: "Normal Customer",
  };

  await page.goto("/register");
  await page.getByLabel("Name").fill(customer.name);
  await page.getByLabel("Email").fill(customer.email);
  await page.getByLabel("Password").fill(customerPassword);
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page.getByTestId("account-status")).toContainText(customer.name);

  return customer;
}

async function loginAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(adminEmail);
  await page.getByLabel("Password").fill(adminPassword);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByTestId("account-status")).toContainText(
    "Thomas Store Admin",
  );
}

test.beforeEach(async () => {
  await seed();
});

test.describe("B2C ADMIN ACCESS", () => {
  test("guest visiting admin is redirected to login", async ({ page }) => {
    await page.goto("/admin");

    await expect(page).toHaveURL("/login?redirect=/admin");
  });

  test("normal customer visiting admin sees Access Denied", async ({
    page,
  }) => {
    await registerCustomer(page);
    await page.goto("/admin");

    await expect(page.getByTestId("admin-access-denied")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Access Denied" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Admin Dashboard" }),
    ).not.toBeVisible();
  });

  test("normal customer does not see Admin Dashboard link", async ({
    page,
  }) => {
    const customer = await registerCustomer(page);
    const user = await client.db.user.findUniqueOrThrow({
      where: {
        email: customer.email,
      },
    });

    expect(user.role).toBe("CUSTOMER");

    await page.goto("/");

    await expect(page.getByTestId("customer-account-nav")).toContainText(
      customer.name,
    );
    await expect(page.getByTestId("admin-dashboard-link")).toHaveCount(0);
    await expect(page.getByTestId("store-account-admin-dashboard")).toHaveCount(
      0,
    );
  });

  test("admin can log in with seeded admin account", async ({ page }) => {
    const admin = await client.db.user.findUniqueOrThrow({
      where: {
        email: adminEmail,
      },
    });

    expect(admin.role).toBe("ADMIN");
    expect(admin.passwordHash).not.toBe(adminPassword);

    await loginAdmin(page);

    await expect(page.getByTestId("account-status")).toContainText(
      "Thomas Store Admin",
    );
  });

  test("admin visiting admin sees Admin Dashboard", async ({ page }) => {
    await loginAdmin(page);
    await page.goto("/admin");

    await expect(page.getByTestId("admin-dashboard")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Admin Dashboard" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Manage Products" }),
    ).toHaveAttribute("href", "/admin/products");
    await expect(
      page.getByRole("link", { name: "View Orders" }),
    ).toHaveAttribute("href", "/admin/purchases");
  });

  test("admin sees Admin Dashboard link in account navigation", async ({
    page,
  }) => {
    await loginAdmin(page);

    await expect(page.getByTestId("admin-dashboard-link")).toHaveAttribute(
      "href",
      "/admin",
    );
    await expect(
      page.getByTestId("store-account-admin-dashboard"),
    ).toHaveAttribute("href", "/admin");
  });
});
