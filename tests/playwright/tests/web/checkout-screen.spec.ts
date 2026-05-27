import { client } from "@repo/db/client";
import { seed } from "@repo/db/seed";
import { expect, test, type Page } from "./fixtures";

const password = "customer123";
const addToCartTimeout = 15_000;
const checkoutSuccessTimeout = 20_000;

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

async function registerCustomer(page: Page) {
  const customer = {
    email: uniqueEmail("checkout"),
    name: "Checkout Customer",
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

async function fillCheckoutForm(page: Page, cardNumber: string) {
  await page.getByLabel("Card number").fill(cardNumber);
  await page.getByLabel("Expiry").fill("12/30");
  await page.getByLabel("CVV").fill("123");
}

async function submitCheckout(page: Page, cardNumber = "4242 4242 4242 4242") {
  await fillCheckoutForm(page, cardNumber);
  await page.getByRole("button", { name: "Pay now" }).click();
}

async function submitSuccessfulCheckout(
  page: Page,
  cardNumber = "4242 4242 4242 4242",
) {
  await fillCheckoutForm(page, cardNumber);
  await Promise.all([
    page.waitForURL(/\/purchase-success\?purchaseId=\d+/, {
      timeout: checkoutSuccessTimeout,
    }),
    page.getByRole("button", { name: "Pay now" }).click(),
  ]);
  await expect(page.getByTestId("purchase-success")).toBeVisible({
    timeout: checkoutSuccessTimeout,
  });
}

async function prepareCheckout(page: Page) {
  const customer = await registerCustomer(page);
  const product = await getTestProduct();

  await addProductToCart(page, product.id);
  await page.goto("/checkout");

  return {
    customer,
    product,
  };
}

test.beforeEach(async () => {
  await seed();
});

test.describe("B2C CHECKOUT SCREEN", () => {
  test.describe.configure({ timeout: 60_000 });

  test("guest visiting checkout is redirected to login", async ({ page }) => {
    await page.goto("/checkout");

    await expect(page).toHaveURL("/login?redirect=/checkout");
  });

  test("logged-in user with cart can open checkout", async ({ page }) => {
    const { product } = await prepareCheckout(page);

    await expect(page.getByRole("heading", { name: "Checkout" })).toBeVisible();
    await expect(page.getByTestId("checkout-form")).toBeVisible();
    await expect(
      page.getByTestId("checkout-cart-item").filter({ hasText: product.name }),
    ).toBeVisible();
    await expect(page.getByText("Use 4242 4242 4242 4242")).toBeVisible();
  });

  test("successful mock payment creates purchase and shows success page", async ({
    page,
  }) => {
    const { customer, product } = await prepareCheckout(page);

    await submitSuccessfulCheckout(page);

    await expect(page).toHaveURL(/\/purchase-success\?purchaseId=\d+/);

    const purchaseId = Number(new URL(page.url()).searchParams.get("purchaseId"));
    const purchase = await client.db.purchase.findUnique({
      include: {
        items: true,
      },
      where: {
        id: purchaseId,
      },
    });

    expect(purchase).not.toBeNull();
    expect(purchase?.customerEmail).toBe(customer.email);
    expect(purchase?.customerName).toBe(customer.name);
    expect(purchase?.items).toHaveLength(1);
    expect(purchase?.items[0]?.productId).toBe(product.id);
    expect(purchase?.items[0]?.quantity).toBe(1);
    expect(purchase?.items[0]?.unitPrice).toBe(product.price);
  });

  test("cart is cleared after successful checkout", async ({ page }) => {
    await prepareCheckout(page);

    await submitSuccessfulCheckout(page);
    await page.goto("/cart");

    await expect(page.getByTestId("cart-empty")).toBeVisible();
  });

  test("product stock is reduced after successful checkout", async ({ page }) => {
    const { product } = await prepareCheckout(page);

    await submitSuccessfulCheckout(page);

    const updatedProduct = await client.db.product.findUniqueOrThrow({
      where: {
        id: product.id,
      },
    });

    expect(updatedProduct.stock).toBe(product.stock - 1);
  });

  test("declined mock payment shows an error and does not clear cart", async ({
    page,
  }) => {
    const { customer, product } = await prepareCheckout(page);

    await submitCheckout(page, "4000 0000 0000 0000");

    await expect(page).toHaveURL("/checkout");
    await expect(page.getByTestId("checkout-error")).toContainText(
      "Payment declined",
    );

    const purchaseCount = await client.db.purchase.count({
      where: {
        customerEmail: customer.email,
      },
    });

    expect(purchaseCount).toBe(0);

    await page.goto("/cart");
    await expect(
      page.getByTestId("cart-item").filter({ hasText: product.name }),
    ).toBeVisible();
  });

  test("empty cart cannot checkout", async ({ page }) => {
    await registerCustomer(page);
    await page.goto("/checkout");

    await expect(page.getByTestId("checkout-empty")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Pay now" }),
    ).not.toBeVisible();
  });
});
