import { products } from "@repo/db/data";
import { seed } from "@repo/db/seed";
import { expect, test } from "./fixtures";

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
});
