import { client } from "@repo/db/client";
import { seed } from "@repo/db/seed";
import { expect, test, type Page } from "./fixtures";

const currencyFormatter = new Intl.NumberFormat("en-AU", {
  currency: "AUD",
  style: "currency",
});
const password = "customer123";
const addToCartTimeout = 15_000;

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

async function getTestProduct() {
  return client.db.product.findFirstOrThrow({
    where: {
      active: true,
      name: "Smart Fitness Watch",
    },
  });
}

async function addProductToCart(page: Page, productId: number) {
  await page.goto(`/products/${productId}`);
  await page.getByTestId("add-to-cart-button").click();
  await expect(page.getByTestId("add-to-cart-status")).toContainText(
    "Added to cart.",
    {
      timeout: addToCartTimeout,
    },
  );
}

async function registerCustomer(page: Page) {
  const email = uniqueEmail("cart");
  const name = "Cart Customer";

  await page.goto("/register");
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page.getByTestId("account-status")).toContainText(name);
  await expect(page.getByTestId("account-status")).toContainText(email);

  return email;
}

test.beforeEach(async () => {
  await seed();
});

test.describe("B2C CART SCREEN", () => {
  test("guest cart page asks for login", async ({ page }) => {
    await page.goto("/cart");

    const loginRequired = page.getByTestId("cart-login-required");

    await expect(loginRequired).toBeVisible();
    await expect(
      loginRequired.getByRole("link", { name: "Login" }),
    ).toHaveAttribute("href", "/login?redirect=/cart");
  });

  test("guest clicking Add to Cart redirects to login", async ({ page }) => {
    const product = await getTestProduct();

    await page.goto(`/products/${product.id}`);
    await page.getByTestId("add-to-cart-button").click();

    await expect(page).toHaveURL(`/login?redirect=%2Fproducts%2F${product.id}`);
  });

  test("shows empty cart message for logged-in customer", async ({ page }) => {
    await registerCustomer(page);
    await page.goto("/cart");

    await expect(page.getByTestId("cart-empty")).toBeVisible();
    await expect(page.getByText("Your cart is empty.")).toBeVisible();
  });

  test("adds a product to cart from product detail page", async ({ page }) => {
    const product = await getTestProduct();

    await registerCustomer(page);
    await addProductToCart(page, product.id);
    await page.getByRole("link", { name: "View cart" }).click();

    await expect(
      page.getByTestId("cart-item").filter({ hasText: product.name }),
    ).toBeVisible();
    await expect(page.getByTestId(`cart-item-quantity-${product.id}`)).toHaveText(
      "1",
    );
  });

  test("adding the same product again increases quantity", async ({ page }) => {
    const product = await getTestProduct();

    await registerCustomer(page);
    await addProductToCart(page, product.id);
    await page.getByTestId("add-to-cart-button").click();
    await page.goto("/cart");

    await expect(page.getByTestId(`cart-item-quantity-${product.id}`)).toHaveText(
      "2",
    );
  });

  test("quantity can be increased and decreased and total updates", async ({
    page,
  }) => {
    const product = await getTestProduct();

    await registerCustomer(page);
    await addProductToCart(page, product.id);
    await page.goto("/cart");

    await expect(page.getByTestId("cart-total")).toHaveText(
      currencyFormatter.format(product.price),
    );

    await page.getByRole("button", { name: `Increase ${product.name}` }).click();

    await expect(page.getByTestId(`cart-item-quantity-${product.id}`)).toHaveText(
      "2",
    );
    await expect(page.getByTestId("cart-total")).toHaveText(
      currencyFormatter.format(product.price * 2),
    );

    await page.getByRole("button", { name: `Decrease ${product.name}` }).click();

    await expect(page.getByTestId(`cart-item-quantity-${product.id}`)).toHaveText(
      "1",
    );
    await expect(page.getByTestId("cart-total")).toHaveText(
      currencyFormatter.format(product.price),
    );
  });

  test("item can be removed", async ({ page }) => {
    const product = await getTestProduct();

    await registerCustomer(page);
    await addProductToCart(page, product.id);
    await page.goto("/cart");

    await page.getByRole("button", { name: `Remove ${product.name}` }).click();

    await expect(page.getByTestId("cart-empty")).toBeVisible();
    await expect(page.getByText(product.name)).not.toBeVisible();
  });

  test("cart persists after reload using the session cookie", async ({
    page,
  }) => {
    const product = await getTestProduct();

    await registerCustomer(page);
    await addProductToCart(page, product.id);
    await page.goto("/cart");
    await page.reload();

    await expect(
      page.getByTestId("cart-item").filter({ hasText: product.name }),
    ).toBeVisible();
    await expect(page.getByTestId(`cart-item-quantity-${product.id}`)).toHaveText(
      "1",
    );
  });
});
