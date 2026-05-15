"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";

type CheckoutCartItem = {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product: {
    name: string;
    imageUrl: string;
    category: string;
  };
};

type CheckoutCart = {
  items: CheckoutCartItem[];
  itemCount: number;
  total: number;
};

type CheckoutCustomer = {
  name: string;
  email: string;
};

type CheckoutState = "idle" | "submitting" | "error";

const currencyFormatter = new Intl.NumberFormat("en-AU", {
  currency: "AUD",
  style: "currency",
});

export function CheckoutForm({
  cart,
  customer,
}: {
  cart: CheckoutCart;
  customer: CheckoutCustomer;
}) {
  const [message, setMessage] = useState("");
  const [state, setState] = useState<CheckoutState>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setState("submitting");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/checkout", {
      body: JSON.stringify({
        cardNumber: formData.get("cardNumber"),
        cvv: formData.get("cvv"),
        email: formData.get("email"),
        expiry: formData.get("expiry"),
        name: formData.get("name"),
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    const body = (await response.json().catch(() => ({}))) as {
      message?: string;
      purchaseId?: number;
    };

    if (!response.ok || !body.purchaseId) {
      setState("error");
      setMessage(body.message || "Checkout could not be completed.");
      return;
    }

    window.location.assign(`/purchase-success?purchaseId=${body.purchaseId}`);
  }

  if (cart.items.length === 0) {
    return (
      <div
        className="rounded-lg border border-dashed border-[color:var(--border-color)] bg-[color:var(--surface-muted)] p-8 text-center"
        data-test-id="checkout-empty"
      >
        <h2 className="text-primary text-2xl font-bold">Your cart is empty.</h2>
        <p className="text-secondary mt-3">
          Add products to your cart before starting checkout.
        </p>
        <Link
          className="mt-6 inline-flex rounded-md bg-wsu px-5 py-3 text-sm font-semibold text-white hover:bg-wsu-light"
          href="/products"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <form
        className="rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface-muted)] p-6"
        data-test-id="checkout-form"
        onSubmit={handleSubmit}
      >
        <div>
          <h2 className="text-primary text-2xl font-bold">Payment details</h2>
          <p className="text-secondary mt-2 text-sm">
            This is a mock payment. Use 4242 4242 4242 4242 for a successful
            mock payment.
          </p>
        </div>

        <div className="mt-6 grid gap-4">
          <div>
            <label className="text-primary text-sm font-semibold" htmlFor="name">
              Name
            </label>
            <input
              className="mt-2 w-full rounded-md border border-[color:var(--border-color)] bg-[color:var(--surface-raised)] px-3 py-2 text-sm text-primary outline-none focus:border-[color:var(--link)]"
              defaultValue={customer.name}
              id="name"
              name="name"
              required
              type="text"
            />
          </div>

          <div>
            <label className="text-primary text-sm font-semibold" htmlFor="email">
              Email
            </label>
            <input
              className="mt-2 w-full rounded-md border border-[color:var(--border-color)] bg-[color:var(--surface-raised)] px-3 py-2 text-sm text-primary outline-none focus:border-[color:var(--link)]"
              defaultValue={customer.email}
              id="email"
              name="email"
              required
              type="email"
            />
          </div>

          <div>
            <label
              className="text-primary text-sm font-semibold"
              htmlFor="cardNumber"
            >
              Card number
            </label>
            <input
              className="mt-2 w-full rounded-md border border-[color:var(--border-color)] bg-[color:var(--surface-raised)] px-3 py-2 text-sm text-primary outline-none focus:border-[color:var(--link)]"
              id="cardNumber"
              inputMode="numeric"
              name="cardNumber"
              placeholder="4242 4242 4242 4242"
              required
              type="text"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                className="text-primary text-sm font-semibold"
                htmlFor="expiry"
              >
                Expiry
              </label>
              <input
                className="mt-2 w-full rounded-md border border-[color:var(--border-color)] bg-[color:var(--surface-raised)] px-3 py-2 text-sm text-primary outline-none focus:border-[color:var(--link)]"
                id="expiry"
                name="expiry"
                placeholder="12/30"
                required
                type="text"
              />
            </div>

            <div>
              <label className="text-primary text-sm font-semibold" htmlFor="cvv">
                CVV
              </label>
              <input
                className="mt-2 w-full rounded-md border border-[color:var(--border-color)] bg-[color:var(--surface-raised)] px-3 py-2 text-sm text-primary outline-none focus:border-[color:var(--link)]"
                id="cvv"
                inputMode="numeric"
                name="cvv"
                required
                type="text"
              />
            </div>
          </div>
        </div>

        {message ? (
          <p className="mt-5 text-sm text-red-600" data-test-id="checkout-error">
            {message}
          </p>
        ) : null}

        <button
          className="mt-6 w-full rounded-md bg-wsu px-5 py-3 text-sm font-semibold text-white hover:bg-wsu-light disabled:cursor-wait disabled:opacity-70"
          disabled={state === "submitting"}
          type="submit"
        >
          {state === "submitting" ? "Processing..." : "Pay now"}
        </button>
      </form>

      <aside className="h-fit rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface-muted)] p-5">
        <h2 className="text-primary text-lg font-semibold">Order summary</h2>
        <div className="mt-5 space-y-4">
          {cart.items.map((item) => (
            <div
              className="grid grid-cols-[4rem_minmax(0,1fr)] gap-3 border-b border-[color:var(--border-color)] pb-4 last:border-b-0 last:pb-0"
              data-test-id="checkout-cart-item"
              key={item.id}
            >
              <img
                alt={item.product.name}
                className="aspect-square rounded-md object-cover"
                src={item.product.imageUrl}
              />
              <div>
                <p className="text-primary text-sm font-semibold">
                  {item.product.name}
                </p>
                <p className="text-secondary mt-1 text-xs">
                  Qty {item.quantity} - {item.product.category}
                </p>
                <p className="text-primary mt-2 text-sm font-semibold">
                  {currencyFormatter.format(item.subtotal)}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between border-t border-[color:var(--border-color)] pt-5">
          <span className="text-secondary font-medium">Total</span>
          <span
            className="text-primary text-xl font-bold"
            data-test-id="checkout-total"
          >
            {currencyFormatter.format(cart.total)}
          </span>
        </div>
      </aside>
    </div>
  );
}
