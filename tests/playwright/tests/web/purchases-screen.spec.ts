import { client } from "@repo/db/client";
import { seed } from "@repo/db/seed";
import { expect, test, type Page } from "./fixtures";

const password = "customer123";
const currencyFormatter = new Intl.NumberFormat("en-AU", {
  currency: "AUD",
  style: "currency",
});

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

async function registerCustomer(page: Page, prefix = "purchases") {
  const customer = {
    email: uniqueEmail(prefix),
    name: "Orders Customer",
  };

  await page.goto("/register");
  await page.getByLabel("Name").fill(customer.name);
  await page.getByLabel("Email").fill(customer.email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page.getByTestId("account-status")).toContainText(customer.name);
  await expect(page.getByTestId("account-status")).toContainText(customer.email);

  return customer;
}

async function logoutCustomer(page: Page) {
  const accountNav = page.getByTestId("customer-account-nav");

  await accountNav.getByTestId("logout-button").click();
  await expect(page).toHaveURL("/login?redirect=/purchases");
}

async function addProductToCart(page: Page, productId: number) {
  await page.goto(`/products/${productId}`);
  await page.getByTestId("add-to-cart-button").click();
  await expect(page.getByTestId("add-to-cart-status")).toContainText(
    "Added to cart.",
  );
}

async function checkoutProduct(page: Page) {
  const product = await getTestProduct();

  await addProductToCart(page, product.id);
  await page.goto("/checkout");
  await page.getByLabel("Card number").fill("4242 4242 4242 4242");
  await page.getByLabel("Expiry").fill("12/30");
  await page.getByLabel("CVV").fill("123");
  await page.getByRole("button", { name: "Pay now" }).click();
  await expect(page.getByTestId("purchase-success")).toBeVisible();

  return product;
}

test.beforeEach(async () => {
  await seed();
});

test.describe("B2C PURCHASE HISTORY SCREEN", () => {
  test("guest visiting purchases is redirected to login", async ({ page }) => {
    await page.goto("/purchases");

    await expect(page).toHaveURL("/login?redirect=/purchases");
  });

  test("logged-in user with no purchases sees empty history", async ({
    page,
  }) => {
    await registerCustomer(page);
    await page.goto("/purchases");

    await expect(page.getByRole("heading", { name: "My Orders" })).toBeVisible();
    await expect(page.getByTestId("purchases-empty")).toBeVisible();
    await expect(page.getByText("No orders yet.")).toBeVisible();
  });

  test("after successful checkout purchase appears in purchases", async ({
    page,
  }) => {
    const product = await getTestProduct();

    await registerCustomer(page);
    await addProductToCart(page, product.id);
    await page.goto("/checkout");
    await page.getByLabel("Card number").fill("4242 4242 4242 4242");
    await page.getByLabel("Expiry").fill("12/30");
    await page.getByLabel("CVV").fill("123");
    await page.getByRole("button", { name: "Pay now" }).click();
    await page.getByRole("link", { name: "View My Orders" }).click();

    const card = page.getByTestId("purchase-card").filter({
      hasText: product.name,
    });

    await expect(page).toHaveURL("/purchases");
    await expect(card).toBeVisible();
    await expect(card.getByTestId("purchase-item-name")).toContainText(
      product.name,
    );
  });

  test("purchase history shows product quantity total and order date", async ({
    page,
  }) => {
    const product = await getTestProduct();

    await registerCustomer(page);
    await checkoutProduct(page);
    await page.goto("/purchases");

    const card = page.getByTestId("purchase-card").filter({
      hasText: product.name,
    });

    await expect(card.getByTestId("purchase-date")).toContainText(/\d/);
    await expect(card.getByText("Qty 1")).toBeVisible();
    await expect(card.getByTestId("purchase-total")).toHaveText(
      currencyFormatter.format(product.price),
    );
    await expect(card.getByTestId("purchase-item-subtotal")).toHaveText(
      currencyFormatter.format(product.price),
    );
  });

  test("User A cannot see User B purchases", async ({ page }) => {
    const userAProduct = await getTestProduct();

    await registerCustomer(page, "orders-user-a");
    await checkoutProduct(page);
    await page.goto("/purchases");
    await expect(
      page.getByTestId("purchase-card").filter({ hasText: userAProduct.name }),
    ).toBeVisible();

    await logoutCustomer(page);
    await registerCustomer(page, "orders-user-b");
    await page.goto("/purchases");

    await expect(page.getByTestId("purchases-empty")).toBeVisible();
    await expect(page.getByText(userAProduct.name)).not.toBeVisible();
  });
});
