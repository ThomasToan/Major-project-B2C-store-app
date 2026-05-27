import { expect, test } from "./fixtures";

test.describe("B2C HOME SCREEN", () => {
  test("shows the B2C homepage", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("b2c-homepage")).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Thomas Store" }),
    ).toBeVisible();
    await expect(page.getByText("Welcome to the storefront.")).toBeVisible();
  });

  test("opens products from the homepage", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Browse Products" }).first().click();

    await expect(page).toHaveURL("/products");
    await expect(
      page.getByRole("heading", { name: "Products" }),
    ).toBeVisible();
  });

  test("has cart login and register links", async ({ page }) => {
    await page.goto("/");

    const sidebar = page.getByRole("complementary");

    await expect(sidebar.getByText("Thomas Store")).toBeVisible();
    await expect(sidebar.getByTestId("store-nav-cart")).toHaveAttribute(
      "href",
      "/cart",
    );
    await expect(sidebar.getByTestId("store-account-login")).toHaveAttribute(
      "href",
      "/login",
    );
    await expect(sidebar.getByTestId("store-account-register")).toHaveAttribute(
      "href",
      "/register",
    );
  });
});
