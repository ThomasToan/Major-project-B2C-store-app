import { client } from "@repo/db/client";
import { products } from "@repo/db/data";
import { seed } from "@repo/db/seed";
import { expect, test } from "./fixtures";

const currencyFormatter = new Intl.NumberFormat("en-AU", {
  currency: "AUD",
  style: "currency",
});

test.beforeEach(async () => {
  await seed();
});

test.describe("B2C PRODUCTS SCREEN", () => {
  test("shows active products from the product table", async ({ page }) => {
    await page.goto("/products");

    const activeProducts = products.filter((product) => product.active);
    const inactiveProducts = products.filter((product) => !product.active);

    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();
    await expect(page.getByTestId("product-card")).toHaveCount(
      activeProducts.length,
    );

    await expect(page.getByText(activeProducts[0]!.name)).toBeVisible();

    for (const product of inactiveProducts) {
      await expect(page.getByText(product.name)).not.toBeVisible();
    }
  });

  test("searches products by name from the filter form", async ({ page }) => {
    await page.goto("/products");

    await page.getByLabel("Search products").fill("watch");
    await page.getByRole("button", { name: "Apply" }).click();

    await expect(page).toHaveURL(/\/products\?.*search=watch/);
    await expect(page.getByTestId("product-card")).toHaveCount(1);
    await expect(page.getByText("Smart Fitness Watch")).toBeVisible();
    await expect(
      page.getByText("Wireless Noise Cancelling Headphones"),
    ).not.toBeVisible();
  });

  test("filters products by category from the URL", async ({ page }) => {
    await page.goto("/products?category=Electronics");

    const activeElectronics = products.filter(
      (product) => product.active && product.category === "Electronics",
    );

    await expect(page.getByLabel("Category")).toHaveValue("Electronics");
    await expect(page.getByTestId("product-card")).toHaveCount(
      activeElectronics.length,
    );
    await expect(page.getByText("Smart Fitness Watch")).toBeVisible();
    await expect(page.getByText("Cotton Everyday T-Shirt")).not.toBeVisible();
  });

  test("updates the URL when selecting a category", async ({ page }) => {
    await page.goto("/products");

    await page.getByLabel("Category").selectOption("Electronics");

    await expect(page).toHaveURL("/products?category=Electronics");
    await expect(page.getByLabel("Category")).toHaveValue("Electronics");
  });

  test("preserves search when selecting a category", async ({ page }) => {
    await page.goto("/products?search=watch");

    await page.getByLabel("Category").selectOption("Electronics");

    await expect(page).toHaveURL(
      "/products?search=watch&category=Electronics",
    );
    await expect(page.getByLabel("Search products")).toHaveValue("watch");
    await expect(page.getByLabel("Category")).toHaveValue("Electronics");
  });

  test("removes the category query when selecting All", async ({ page }) => {
    await page.goto("/products?search=watch&category=Electronics");

    await page.getByLabel("Category").selectOption("");

    await expect(page).toHaveURL("/products?search=watch");
    await expect(page.getByLabel("Search products")).toHaveValue("watch");
    await expect(page.getByLabel("Category")).toHaveValue("");
  });

  test("combines search and category filters", async ({ page }) => {
    await page.goto("/products?search=watch&category=Electronics");

    await expect(page.getByLabel("Search products")).toHaveValue("watch");
    await expect(page.getByLabel("Category")).toHaveValue("Electronics");
    await expect(page.getByTestId("product-card")).toHaveCount(1);
    await expect(page.getByText("Smart Fitness Watch")).toBeVisible();
  });

  test("shows no results message when filters do not match", async ({
    page,
  }) => {
    await page.goto("/products?search=does-not-exist");

    await expect(page.getByTestId("product-card")).toHaveCount(0);
    await expect(page.getByText("No products found.")).toBeVisible();
  });

  test("does not show inactive products in filtered results", async ({
    page,
  }) => {
    await page.goto("/products?search=candle&category=Home");

    await expect(page.getByText("Scented Soy Candle")).not.toBeVisible();
    await expect(page.getByTestId("product-card")).toHaveCount(0);
    await expect(page.getByText("No products found.")).toBeVisible();
  });

  test("opens a product detail page from the product list", async ({
    page,
  }) => {
    await page.goto("/products");

    await page
      .getByTestId("product-card")
      .filter({ hasText: "Smart Fitness Watch" })
      .click();

    await expect(page).toHaveURL(/\/products\/\d+$/);
    await expect(page.getByTestId("product-detail")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Smart Fitness Watch" }),
    ).toBeVisible();
  });

  test("shows product details", async ({ page }) => {
    await page.goto("/products");

    await page
      .getByTestId("product-card")
      .filter({ hasText: "Smart Fitness Watch" })
      .click();

    const product = products.find(
      (item) => item.name === "Smart Fitness Watch",
    )!;
    await expect(page.getByTestId("product-detail-category")).toHaveText(
      product.category,
    );
    await expect(page.getByTestId("product-detail-price")).toHaveText(
      currencyFormatter.format(product.price),
    );
    await expect(page.getByTestId("product-detail-stock")).toHaveText(
      `${product.stock} available`,
    );
    await expect(page.getByTestId("product-detail-image")).toHaveAttribute(
      "src",
      product.imageUrl,
    );
  });

  test("shows not found for an invalid product id", async ({ page }) => {
    const response = await page.goto("/products/not-a-number");

    expect(response?.status()).toBe(404);
    await expect(page.getByTestId("product-detail")).not.toBeVisible();
  });

  test("does not allow direct access to inactive product detail pages", async ({
    page,
  }) => {
    const inactiveProduct = await client.db.product.findFirstOrThrow({
      where: {
        name: "Scented Soy Candle",
      },
    });
    const response = await page.goto(`/products/${inactiveProduct.id}`);

    expect(response?.status()).toBe(404);
    await expect(page.getByText(inactiveProduct.name)).not.toBeVisible();
    await expect(page.getByTestId("product-detail")).not.toBeVisible();
  });
});
