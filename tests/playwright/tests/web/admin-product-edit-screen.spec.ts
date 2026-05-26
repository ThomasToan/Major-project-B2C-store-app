import { client } from "@repo/db/client";
import { seed } from "@repo/db/seed";
import { expect, test, type Page } from "./fixtures";

const customerPassword = "customer123";
const adminEmail = "admin@thomasstore.com";
const adminPassword = "admin123";
const currencyFormatter = new Intl.NumberFormat("en-AU", {
  currency: "AUD",
  style: "currency",
});

function uniqueName(prefix: string) {
  return `${prefix} ${Date.now()} ${Math.random().toString(16).slice(2)}`;
}

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

async function getSeedProduct(name = "Smart Fitness Watch") {
  return client.db.product.findFirstOrThrow({
    where: {
      name,
    },
  });
}

async function registerCustomer(page: Page) {
  await page.goto("/register");
  await page.getByLabel("Name").fill("Product Edit Customer");
  await page.getByLabel("Email").fill(uniqueEmail("product-edit-customer"));
  await page.getByLabel("Password").fill(customerPassword);
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page.getByTestId("account-status")).toContainText(
    "Product Edit Customer",
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

test.describe("B2C ADMIN PRODUCT EDIT", () => {
  test("guest visiting product edit is redirected to login", async ({
    page,
  }) => {
    const product = await getSeedProduct();

    await page.goto(`/admin/products/${product.id}/edit`);

    await expect(page).toHaveURL(
      `/login?redirect=/admin/products/${product.id}/edit`,
    );
  });

  test("normal customer visiting product edit sees Access Denied", async ({
    page,
  }) => {
    const product = await getSeedProduct();

    await registerCustomer(page);
    await page.goto(`/admin/products/${product.id}/edit`);

    await expect(
      page.getByTestId("admin-product-edit-access-denied"),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Access Denied" }),
    ).toBeVisible();
    await expect(page.getByTestId("edit-product-form")).toHaveCount(0);
  });

  test("admin can open seeded product edit page with prefilled form", async ({
    page,
  }) => {
    const product = await getSeedProduct();

    await loginAdmin(page);
    await page.goto(`/admin/products/${product.id}/edit`);

    await expect(page.getByTestId("admin-product-edit-page")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Edit Product" }),
    ).toBeVisible();
    await expect(page.getByTestId("edit-product-form")).toBeVisible();
    await expect(page.getByLabel("Name")).toHaveValue(product.name);
    await expect(page.getByLabel("Description")).toHaveValue(
      product.description,
    );
    await expect(page.getByLabel("Image URL")).toHaveValue(product.imageUrl);
    await expect(page.getByLabel("Category")).toHaveValue(product.category);
    await expect(page.getByLabel("Price")).toHaveValue(String(product.price));
    await expect(page.getByLabel("Stock")).toHaveValue(String(product.stock));
    await expect(page.getByLabel("Active")).toBeChecked();
  });

  test("admin can update product name price and stock", async ({ page }) => {
    const product = await getSeedProduct();
    const updatedName = uniqueName("Updated Smart Watch");
    const updatedPrice = 139.95;
    const updatedStock = 33;

    await loginAdmin(page);
    await page.goto(`/admin/products/${product.id}/edit`);
    await page.getByLabel("Name").fill(updatedName);
    await page.getByLabel("Price").fill(String(updatedPrice));
    await page.getByLabel("Stock").fill(String(updatedStock));
    await page.getByRole("button", { name: "Save Changes" }).click();

    await expect(page).toHaveURL("/admin/products");

    const row = page.getByTestId("admin-product-row").filter({
      hasText: updatedName,
    });

    await expect(row).toBeVisible();
    await expect(row).toContainText(currencyFormatter.format(updatedPrice));
    await expect(row).toContainText(String(updatedStock));

    const updatedProduct = await client.db.product.findUniqueOrThrow({
      where: {
        id: product.id,
      },
    });

    expect(updatedProduct.name).toBe(updatedName);
    expect(updatedProduct.price).toBe(updatedPrice);
    expect(updatedProduct.stock).toBe(updatedStock);
  });

  test("admin can set product inactive and hide it from public products", async ({
    page,
  }) => {
    const product = await getSeedProduct();

    await loginAdmin(page);
    await page.goto(`/admin/products/${product.id}/edit`);
    await page.getByLabel("Active").uncheck();
    await page.getByRole("button", { name: "Save Changes" }).click();

    await expect(page).toHaveURL("/admin/products");

    const adminRow = page.getByTestId("admin-product-row").filter({
      hasText: product.name,
    });

    await expect(adminRow).toBeVisible();
    await expect(adminRow).toContainText("Inactive");

    await page.goto("/products");
    await expect(page.getByText(product.name)).not.toBeVisible();
  });

  test("admin can set inactive product active and show it publicly", async ({
    page,
  }) => {
    const product = await getSeedProduct("Scented Soy Candle");

    await loginAdmin(page);
    await page.goto("/products");
    await expect(page.getByText(product.name)).not.toBeVisible();

    await page.goto(`/admin/products/${product.id}/edit`);
    await expect(page.getByLabel("Active")).not.toBeChecked();
    await page.getByLabel("Active").check();
    await page.getByRole("button", { name: "Save Changes" }).click();

    await expect(page).toHaveURL("/admin/products");

    const adminRow = page.getByTestId("admin-product-row").filter({
      hasText: product.name,
    });

    await expect(adminRow).toBeVisible();
    await expect(adminRow).toContainText("Active");

    await page.goto("/products");
    await expect(page.getByText(product.name)).toBeVisible();
  });

  test("invalid form input shows validation error and does not update product", async ({
    page,
  }) => {
    const product = await getSeedProduct();
    const invalidName = uniqueName("Invalid Updated Product");

    await loginAdmin(page);
    await page.goto(`/admin/products/${product.id}/edit`);
    await page.getByLabel("Name").fill(invalidName);
    await page.getByLabel("Price").fill("0");
    await page.getByRole("button", { name: "Save Changes" }).click();

    await expect(page).toHaveURL(`/admin/products/${product.id}/edit`);
    await expect(page.getByTestId("product-form-message")).toContainText(
      "Price must be greater than 0.",
    );

    const unchangedProduct = await client.db.product.findUniqueOrThrow({
      where: {
        id: product.id,
      },
    });

    expect(unchangedProduct.name).toBe(product.name);
    expect(unchangedProduct.price).toBe(product.price);
  });
});
