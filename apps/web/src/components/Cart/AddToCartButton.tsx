"use client";

import { useState } from "react";
import Link from "next/link";

type AddState = "idle" | "adding" | "added" | "error";

export function AddToCartButton({ productId }: { productId: number }) {
  const [state, setState] = useState<AddState>("idle");

  async function handleAddToCart() {
    setState("adding");

    const response = await fetch("/api/cart/items", {
      body: JSON.stringify({ productId }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    setState(response.ok ? "added" : "error");
  }

  return (
    <div className="space-y-3">
      <button
        className="w-full rounded-md bg-wsu px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-wsu-light disabled:cursor-wait disabled:opacity-70 sm:w-auto"
        data-test-id="add-to-cart-button"
        disabled={state === "adding"}
        onClick={handleAddToCart}
        type="button"
      >
        {state === "adding" ? "Adding..." : "Add to Cart"}
      </button>

      {state === "added" ? (
        <p className="text-secondary text-sm" data-test-id="add-to-cart-status">
          Added to cart.{" "}
          <Link className="font-semibold text-primary" href="/cart">
            View cart
          </Link>
        </p>
      ) : null}

      {state === "error" ? (
        <p className="text-sm text-red-600" data-test-id="add-to-cart-status">
          Could not add this product to the cart.
        </p>
      ) : null}
    </div>
  );
}
