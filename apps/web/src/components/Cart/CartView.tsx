"use client";

import type { CartSummary } from "@repo/db/store";
import { useEffect, useState } from "react";
import Link from "next/link";

const currencyFormatter = new Intl.NumberFormat("en-AU", {
  currency: "AUD",
  style: "currency",
});

async function fetchCart() {
  const response = await fetch("/api/cart", {
    cache: "no-store",
  });

  if (response.status === 401) {
    return "unauthorized" as const;
  }

  if (!response.ok) {
    throw new Error("Could not load cart");
  }

  return (await response.json()) as CartSummary;
}

export function CartView() {
  const [cart, setCart] = useState<CartSummary | "unauthorized" | undefined>();
  const [error, setError] = useState(false);

  useEffect(() => {
    void fetchCart()
      .then(setCart)
      .catch(() => setError(true));
  }, []);

  async function updateQuantity(productId: number, quantity: number) {
    const response = await fetch("/api/cart/items", {
      body: JSON.stringify({ productId, quantity }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "PATCH",
    });

    if (response.ok) {
      setCart((await response.json()) as CartSummary);
    }
  }

  async function removeItem(productId: number) {
    const response = await fetch("/api/cart/items", {
      body: JSON.stringify({ productId }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "DELETE",
    });

    if (response.ok) {
      setCart((await response.json()) as CartSummary);
    }
  }

  if (error) {
    return (
      <main className="px-4 py-10 md:px-10 md:py-12">
        <div className="mx-auto w-full max-w-5xl">
          <p className="text-red-600">Could not load cart.</p>
        </div>
      </main>
    );
  }

  if (cart === "unauthorized") {
    return (
      <main className="px-4 py-10 md:px-10 md:py-12">
        <div className="mx-auto w-full max-w-5xl">
          <div
            className="rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface-muted)] p-8 text-center"
            data-test-id="cart-login-required"
          >
            <h1 className="text-primary text-3xl font-bold">
              Login required
            </h1>
            <p className="text-secondary mt-3">
              Please log in or register before using the cart.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                className="rounded-md bg-wsu px-5 py-3 text-sm font-semibold text-white hover:bg-wsu-light"
                href="/login?redirect=/cart"
              >
                Login
              </Link>
              <Link
                className="rounded-md border border-[color:var(--border-color)] px-5 py-3 text-sm font-semibold text-primary"
                href="/register?redirect=/cart"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!cart) {
    return (
      <main className="px-4 py-10 md:px-10 md:py-12">
        <div className="mx-auto w-full max-w-5xl">
          <p className="text-secondary">Loading cart...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="px-4 py-10 md:px-10 md:py-12">
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-col gap-3 border-b border-[color:var(--border-color)] pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-wsu text-sm font-semibold uppercase">
              Thomas Store
            </p>
            <h1 className="text-primary mt-2 text-4xl font-bold">Cart</h1>
          </div>
          <Link className="text-secondary text-sm font-semibold" href="/products">
            Continue shopping
          </Link>
        </div>

        {cart.items.length === 0 ? (
          <div
            className="mt-10 border border-dashed border-[color:var(--border-color)] bg-[color:var(--surface-muted)] p-8 text-center"
            data-test-id="cart-empty"
          >
            <h2 className="text-primary text-xl font-semibold">
              Your cart is empty.
            </h2>
            <p className="text-secondary mt-2 text-sm">
              Add products before checkout.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <div className="space-y-4">
              {cart.items.map((item) => (
                <article
                  className="grid gap-4 rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface-raised)] p-4 sm:grid-cols-[8rem_minmax(0,1fr)]"
                  data-test-id="cart-item"
                  key={item.id}
                >
                  <img
                    alt={item.product.name}
                    className="aspect-square w-full rounded-md object-cover"
                    src={item.product.imageUrl}
                  />
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2
                          className="text-primary text-lg font-semibold"
                          data-test-id="cart-item-name"
                        >
                          {item.product.name}
                        </h2>
                        <p className="text-secondary mt-1 text-sm">
                          {item.product.category}
                        </p>
                      </div>
                      <p className="text-primary font-semibold">
                        {currencyFormatter.format(item.unitPrice)}
                      </p>
                    </div>

                    <div className="flex flex-col gap-4 border-t border-[color:var(--border-color)] pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          aria-label={`Decrease ${item.product.name}`}
                          className="h-9 w-9 rounded-md border border-[color:var(--border-color)] text-primary disabled:opacity-40"
                          disabled={item.quantity <= 1}
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          type="button"
                        >
                          -
                        </button>
                        <span
                          className="min-w-8 text-center text-primary font-semibold"
                          data-test-id={`cart-item-quantity-${item.productId}`}
                        >
                          {item.quantity}
                        </span>
                        <button
                          aria-label={`Increase ${item.product.name}`}
                          className="h-9 w-9 rounded-md border border-[color:var(--border-color)] text-primary"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          type="button"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:justify-end">
                        <p
                          className="text-primary font-semibold"
                          data-test-id={`cart-item-subtotal-${item.productId}`}
                        >
                          {currencyFormatter.format(item.subtotal)}
                        </p>
                        <button
                          aria-label={`Remove ${item.product.name}`}
                          className="text-secondary text-sm font-semibold hover:text-primary"
                          onClick={() => removeItem(item.productId)}
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="h-fit rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface-muted)] p-5">
              <h2 className="text-primary text-lg font-semibold">Summary</h2>
              <div className="mt-5 flex items-center justify-between border-t border-[color:var(--border-color)] pt-5">
                <span className="text-secondary font-medium">Total</span>
                <span
                  className="text-primary text-xl font-bold"
                  data-test-id="cart-total"
                >
                  {currencyFormatter.format(cart.total)}
                </span>
              </div>
              <Link
                className="mt-5 block rounded-md bg-[color:var(--text-primary)] px-4 py-3 text-center text-sm font-semibold text-[color:var(--surface-raised)]"
                href="/checkout"
              >
                Checkout
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
