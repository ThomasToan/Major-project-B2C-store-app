import { client } from "@repo/db/client";
import { seed } from "@repo/db/seed";
import { expect, test, type Page } from "./fixtures";

const customerPassword = "customer123";
const adminEmail = "admin@thomasstore.com";
const adminPassword = "admin123";
const imageUrl =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80";

function uniqueName(prefix: string) {
  return `${prefix} ${Date.now()} ${Math.random().toString(16).slice(2)}`;
}

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

async function registerCustomer(page: Page) {
  await page.goto("/register");
  await page.getByLabel("Name").fill("Product Create Customer");
  await page.getByLabel("Email").fill(uniqueEmail("product-create-customer"));
  await page.getByLabel("Password").fill(customerPassword);
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page.getByTestId("account-status")).toContainText(
    "Product Create Customer",
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

async function fillProductForm(
  page: Page,
  product: {
    active?: boolean;
    category?: string;
    description?: string;
    imageUrl?: string;
    name: string;
    price?: string;
    stock?: string;
  },
) {
  await page.getByLabel("Name").fill(product.name);
  await page
    .getByLabel("Description")
    .fill(product.description ?? "Created from the admin product form.");
  await page.getByLabel("Image URL").fill(product.imageUrl ?? imageUrl);
  await page.getByLabel("Category").fill(product.category ?? "Electronics");
  await page.getByLabel("Price").fill(product.price ?? "49.95");
  await page.getByLabel("Stock").fill(product.stock ?? "12");

  if (product.active === false) {
    await page.getByLabel("Active").uncheck();
  }
}

async function createProduct(
  page: Page,
  product: Parameters<typeof fillProductForm>[1],
) {
  await page.goto("/admin/products/create");
  await fillProductForm(page, product);
  await page.getByRole("button", { name: "Create Product" }).click();
  await expect(page).toHaveURL("/admin/products");
}

test.beforeEach(async () => {
  await seed();
});

test.describe("B2C ADMIN PRODUCT CREATE", () => {
  test("guest visiting product create is redirected to login", async ({
    page,
  }) => {
    await page.goto("/admin/products/create");

    await expect(page).toHaveURL("/login?redirect=/admin/products/create");
  });

  test("normal customer visiting product create sees Access Denied", async ({
    page,
  }) => {
    await registerCustomer(page);
    await page.goto("/admin/products/create");

    await expect(
      page.getByTestId("admin-product-create-access-denied"),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Access Denied" }),
    ).toBeVisible();
    await expect(page.getByTestId("create-product-form")).toHaveCount(0);
  });

  test("admin can open product create form", async ({ page }) => {
    await loginAdmin(page);
    await page.goto("/admin/products/create");

    await expect(page.getByTestId("admin-product-create-page")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Add Product" }),
    ).toBeVisible();
    await expect(page.getByTestId("create-product-form")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Back to Product Management" }),
    ).toHaveAttribute("href", "/admin/products");
  });

  test("admin can create an active product", async ({ page }) => {
    const productName = uniqueName("Active Admin Product");

    await loginAdmin(page);
    await createProduct(page, {
      category: "Electronics",
      name: productName,
      price: "79.99",
      stock: "7",
    });

    const adminRow = page
      .getByTestId("admin-product-row")
      .filter({ hasText: productName });

    await expect(adminRow).toBeVisible();
    await expect(adminRow).toContainText("Active");

    await page.goto("/products");
    await expect(page.getByText(productName)).toBeVisible();

    const createdProduct = await client.db.product.findFirst({
      where: {
        name: productName,
      },
    });

    expect(createdProduct?.active).toBe(true);
  });

  test("admin can create an inactive product", async ({ page }) => {
    const productName = uniqueName("Inactive Admin Product");

    await loginAdmin(page);
    await createProduct(page, {
      active: false,
      category: "Home",
      name: productName,
      price: "29.99",
      stock: "0",
    });

    const adminRow = page
      .getByTestId("admin-product-row")
      .filter({ hasText: productName });

    await expect(adminRow).toBeVisible();
    await expect(adminRow).toContainText("Inactive");

    await page.goto("/products");
    await expect(page.getByText(productName)).not.toBeVisible();

    const createdProduct = await client.db.product.findFirst({
      where: {
        name: productName,
      },
    });

    expect(createdProduct?.active).toBe(false);
  });

  test("invalid form input shows validation error and does not create a product", async ({
    page,
  }) => {
    const productName = uniqueName("Invalid Admin Product");

    await loginAdmin(page);
    await page.goto("/admin/products/create");
    await fillProductForm(page, {
      name: productName,
      price: "0",
      stock: "5",
    });
    await page.getByRole("button", { name: "Create Product" }).click();

    await expect(page).toHaveURL("/admin/products/create");
    await expect(page.getByTestId("product-form-message")).toContainText(
      "Price must be greater than 0.",
    );

    const createdProduct = await client.db.product.findFirst({
      where: {
        name: productName,
      },
    });

    expect(createdProduct).toBeNull();
  });
});
