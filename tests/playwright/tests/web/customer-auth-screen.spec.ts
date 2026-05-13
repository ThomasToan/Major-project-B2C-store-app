import { client } from "@repo/db/client";
import { seed } from "@repo/db/seed";
import { expect, test, type Page } from "./fixtures";

const password = "customer123";

function uniqueEmail(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}@example.com`;
}

async function registerCustomer(page: Page, email: string, name = "Test User") {
  await page.goto("/register");
  await page.getByLabel("Name").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Register" }).click();
  await expect(page.getByTestId("account-status")).toContainText(name);
  await expect(page.getByTestId("account-status")).toContainText(email);
}

async function loginCustomer(page: Page, email: string, name = "Test User") {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page.getByTestId("account-status")).toContainText(name);
  await expect(page.getByTestId("account-status")).toContainText(email);
}

async function logoutCustomer(page: Page) {
  const accountNav = page.getByTestId("customer-account-nav");

  await accountNav.getByTestId("logout-button").click();
  await expect(accountNav.getByRole("link", { name: "Login" })).toBeVisible();
}

async function addWatchToCart(page: Page) {
  const product = await client.db.product.findFirstOrThrow({
    where: {
      active: true,
      name: "Smart Fitness Watch",
    },
  });

  await page.goto(`/products/${product.id}`);
  await page.getByTestId("add-to-cart-button").click();
  await expect(page.getByTestId("add-to-cart-status")).toContainText(
    "Added to cart.",
  );

  return product;
}

test.beforeEach(async () => {
  await seed();
});

test.describe("B2C CUSTOMER AUTH", () => {
  test("user can register", async ({ page }) => {
    const email = uniqueEmail("register");
    const name = "Registered Customer";

    await registerCustomer(page, email, name);

    await expect(page.getByTestId("account-status")).toContainText(name);
    await expect(page.getByTestId("account-status")).toContainText(email);
  });

  test("duplicate email is rejected", async ({ page }) => {
    const email = uniqueEmail("duplicate");

    await registerCustomer(page, email);
    await logoutCustomer(page);

    await page.goto("/register");
    await page.getByLabel("Name").fill("Duplicate User");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Register" }).click();

    await expect(page.getByTestId("auth-message")).toContainText(
      "already exists",
    );
  });

  test("user can log in and log out", async ({ page }) => {
    const email = uniqueEmail("login");

    await registerCustomer(page, email);
    await logoutCustomer(page);
    await loginCustomer(page, email);
    await logoutCustomer(page);
  });

  test("login redirects back to the requested page", async ({ page }) => {
    const email = uniqueEmail("redirect-login");

    await registerCustomer(page, email);
    await logoutCustomer(page);

    await page.goto("/login?redirect=/products");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: "Login" }).click();

    await expect(page).toHaveURL("/products");
  });

  test("user cart does not appear after logout and another user login", async ({
    page,
  }) => {
    const userAEmail = uniqueEmail("user-a");
    const userBEmail = uniqueEmail("user-b");

    await registerCustomer(page, userAEmail);
    const product = await addWatchToCart(page);
    await page.goto("/cart");
    await expect(
      page.getByTestId("cart-item").filter({ hasText: product.name }),
    ).toBeVisible();

    await logoutCustomer(page);
    await registerCustomer(page, userBEmail);
    await page.goto("/cart");

    await expect(page.getByTestId("cart-empty")).toBeVisible();
    await expect(page.getByText(product.name)).not.toBeVisible();
  });
});
