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

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

async function getProduct(name: string) {
  return client.db.product.findFirstOrThrow({
    where: {
      active: true,
      name,
    },
  });
}

async function registerCustomer(
  page: Page,
  {
    name,
    prefix,
  }: {
    name: string;
    prefix: string;
  },
) {
  const customer = {
    email: uniqueEmail(prefix),
    name,
  };

  await page.goto("/register");
  await page.getByLabel("Name").fill(customer.name);
  await page.getByLabel("Email").fill(customer.email);
  await page.getByLabel("Password").fill(customerPassword);
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page.getByTestId("account-status")).toContainText(customer.name);
  await expect(page.getByTestId("account-status")).toContainText(
    customer.email,
  );

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

async function logoutFromHome(page: Page) {
  await page.goto("/");
  const accountNav = page.getByTestId("customer-account-nav");

  await expect(accountNav.getByTestId("logout-button")).toBeVisible();
  await accountNav.getByTestId("logout-button").click();
  await expect(accountNav.getByRole("link", { name: "Login" })).toBeVisible();
}

async function checkoutProductForCustomer(
  page: Page,
  {
    customerName,
    emailPrefix,
    productName,
  }: {
    customerName: string;
    emailPrefix: string;
    productName: string;
  },
) {
  const customer = await registerCustomer(page, {
    name: customerName,
    prefix: emailPrefix,
  });
  const product = await getProduct(productName);

  await page.goto(`/products/${product.id}`);
  await page.getByTestId("add-to-cart-button").click();
  await expect(page.getByTestId("add-to-cart-status")).toContainText(
    "Added to cart.",
  );
  await page.goto("/checkout");
  await page.getByLabel("Card number").fill("4242 4242 4242 4242");
  await page.getByLabel("Expiry").fill("12/30");
  await page.getByLabel("CVV").fill("123");
  await page.getByRole("button", { name: "Pay now" }).click();
  await expect(page.getByTestId("purchase-success")).toBeVisible();

  return {
    customer,
    product,
  };
}

test.beforeEach(async () => {
  await seed();
});

test.describe("B2C ADMIN PURCHASE RECORDS", () => {
  test("guest visiting admin purchases is redirected to login", async ({
    page,
  }) => {
    await page.goto("/admin/purchases");

    await expect(page).toHaveURL("/login?redirect=/admin/purchases");
  });

  test("normal customer visiting admin purchases sees Access Denied", async ({
    page,
  }) => {
    await registerCustomer(page, {
      name: "Admin Purchases Customer",
      prefix: "admin-purchases-customer",
    });
    await page.goto("/admin/purchases");

    await expect(
      page.getByTestId("admin-purchases-access-denied"),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Access Denied" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 1, name: "Purchase Records" }),
    ).not.toBeVisible();
  });

  test("admin can open purchase records and sees empty state", async ({
    page,
  }) => {
    await loginAdmin(page);
    await page.goto("/admin/purchases");

    await expect(page.getByTestId("admin-purchases-page")).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 1, name: "Purchase Records" }),
    ).toBeVisible();
    await expect(page.getByTestId("admin-purchases-empty")).toBeVisible();
    await expect(
      page.getByTestId("store-account-purchase-records"),
    ).toHaveAttribute("href", "/admin/purchases");
  });

  test("after customer checkout admin can see the purchase details", async ({
    page,
  }) => {
    const { customer, product } = await checkoutProductForCustomer(page, {
      customerName: "Admin Visible Customer",
      emailPrefix: "admin-visible",
      productName: "Smart Fitness Watch",
    });

    await logoutFromHome(page);
    await loginAdmin(page);
    await page.goto("/admin/purchases");

    const card = page.getByTestId("admin-purchase-card").filter({
      hasText: customer.email,
    });

    await expect(card).toBeVisible();
    await expect(
      card.getByTestId("admin-purchase-customer-name"),
    ).toContainText(customer.name);
    await expect(
      card.getByTestId("admin-purchase-customer-email"),
    ).toContainText(customer.email);
    await expect(card.getByTestId("admin-purchase-item-name")).toContainText(
      product.name,
    );
    await expect(card.getByText("Qty 1")).toBeVisible();
    await expect(card.getByTestId("admin-purchase-total")).toHaveText(
      currencyFormatter.format(product.price),
    );
    await expect(card.getByTestId("admin-purchase-date")).toContainText(/\d/);
  });

  test("customer purchases remains scoped to the logged-in customer", async ({
    page,
  }) => {
    const userA = await checkoutProductForCustomer(page, {
      customerName: "Orders User A",
      emailPrefix: "admin-orders-user-a",
      productName: "Smart Fitness Watch",
    });

    await logoutFromHome(page);

    const userB = await checkoutProductForCustomer(page, {
      customerName: "Orders User B",
      emailPrefix: "admin-orders-user-b",
      productName: "Wireless Noise Cancelling Headphones",
    });

    await page.goto("/purchases");

    await expect(page.getByText(userB.product.name)).toBeVisible();
    await expect(page.getByText(userA.product.name)).not.toBeVisible();
    await expect(page.getByText(userA.customer.email)).not.toBeVisible();
  });

  test("admin purchases shows purchases from multiple customers", async ({
    page,
  }) => {
    const userA = await checkoutProductForCustomer(page, {
      customerName: "Multi Customer A",
      emailPrefix: "admin-multi-a",
      productName: "Smart Fitness Watch",
    });

    await logoutFromHome(page);

    const userB = await checkoutProductForCustomer(page, {
      customerName: "Multi Customer B",
      emailPrefix: "admin-multi-b",
      productName: "Wireless Noise Cancelling Headphones",
    });

    await logoutFromHome(page);
    await loginAdmin(page);
    await page.goto("/admin/purchases");

    await expect(page.getByText(userA.customer.email)).toBeVisible();
    await expect(page.getByText(userB.customer.email)).toBeVisible();
    await expect(page.getByText(userA.product.name)).toBeVisible();
    await expect(page.getByText(userB.product.name)).toBeVisible();
  });

  test("admin can navigate from dashboard to purchase records", async ({
    page,
  }) => {
    await loginAdmin(page);
    await page.goto("/admin");
    await page.getByRole("link", { name: "View Orders" }).click();

    await expect(page).toHaveURL("/admin/purchases");
    await expect(
      page.getByRole("heading", { level: 1, name: "Purchase Records" }),
    ).toBeVisible();
  });
});
