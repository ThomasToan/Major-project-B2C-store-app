import { seed } from "@repo/db/seed";
import { expect, test, type Page } from "./fixtures";

const customerPassword = "customer123";
const adminEmail = "admin@thomasstore.com";
const adminPassword = "admin123";
const inactiveProductName = "Scented Soy Candle";

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

async function registerCustomer(page: Page) {
  await page.goto("/register");
  await page.getByLabel("Name").fill("Admin Products Customer");
  await page.getByLabel("Email").fill(uniqueEmail("admin-products-customer"));
  await page.getByLabel("Password").fill(customerPassword);
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page.getByTestId("account-status")).toContainText(
    "Admin Products Customer",
  );
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

test.describe("B2C ADMIN PRODUCT LIST", () => {
  test("guest visiting admin products is redirected to login", async ({
    page,
  }) => {
    await page.goto("/admin/products");

    await expect(page).toHaveURL("/login?redirect=/admin/products");
  });

  test("normal customer visiting admin products sees Access Denied", async ({
    page,
  }) => {
    await registerCustomer(page);
    await page.goto("/admin/products");

    await expect(
      page.getByTestId("admin-products-access-denied"),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Access Denied" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Product Management" }),
    ).not.toBeVisible();
  });

  test("admin can open product management", async ({ page }) => {
    await loginAdmin(page);
    await page.goto("/admin/products");

    await expect(page.getByTestId("admin-products-page")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Product Management" }),
    ).toBeVisible();
    await expect(
      page.getByTestId("store-account-product-management"),
    ).toHaveAttribute("href", "/admin/products");
    await expect(
      page.getByRole("link", { name: "Back to Admin Dashboard" }),
    ).toHaveAttribute("href", "/admin");
    await expect(
      page.getByRole("link", { name: "Add Product" }),
    ).toHaveAttribute("href", "/admin/products/create");
  });

  test("admin can see seeded active products", async ({ page }) => {
    await loginAdmin(page);
    await page.goto("/admin/products");

    const activeProduct = page
      .getByTestId("admin-product-row")
      .filter({ hasText: "Smart Fitness Watch" });

    await expect(activeProduct).toBeVisible();
    await expect(activeProduct).toContainText("Electronics");
    await expect(activeProduct).toContainText("Active");
    await expect(
      activeProduct.getByRole("link", { name: "Edit" }),
    ).toHaveAttribute("href", /\/admin\/products\/\d+\/edit/);
  });

  test("admin can see inactive products", async ({ page }) => {
    await loginAdmin(page);
    await page.goto("/admin/products");

    const inactiveProduct = page
      .getByTestId("admin-product-row")
      .filter({ hasText: inactiveProductName });

    await expect(inactiveProduct).toBeVisible();
    await expect(inactiveProduct).toContainText("Home");
    await expect(inactiveProduct).toContainText("Inactive");
  });

  test("public products hides inactive product but admin products shows it", async ({
    page,
  }) => {
    await page.goto("/products");
    await expect(page.getByText(inactiveProductName)).not.toBeVisible();

    await loginAdmin(page);
    await page.goto("/admin/products");

    await expect(page.getByText(inactiveProductName)).toBeVisible();
  });

  test("admin can navigate from dashboard to product management", async ({
    page,
  }) => {
    await loginAdmin(page);
    await page.goto("/admin");
    await page.getByRole("link", { name: "Manage Products" }).click();

    await expect(page).toHaveURL("/admin/products");
    await expect(
      page.getByRole("heading", { name: "Product Management" }),
    ).toBeVisible();
  });
});
