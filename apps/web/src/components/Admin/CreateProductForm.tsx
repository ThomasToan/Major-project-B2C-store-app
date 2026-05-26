"use client";

import { useState } from "react";
import type { FormEvent } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

export function CreateProductForm() {
  const [message, setMessage] = useState("");
  const [state, setState] = useState<FormState>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/products", {
      body: JSON.stringify({
        active: formData.get("active") === "on",
        category: formData.get("category"),
        description: formData.get("description"),
        imageUrl: formData.get("imageUrl"),
        name: formData.get("name"),
        price: formData.get("price"),
        stock: formData.get("stock"),
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as {
        message?: string;
      };
      setState("error");
      setMessage(body.message || "Product could not be created.");
      return;
    }

    setState("success");
    setMessage("Product created.");
    window.location.assign("/admin/products");
  }

  return (
    <form
      className="mt-8 grid gap-5 rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface-muted)] p-6"
      data-test-id="create-product-form"
      onSubmit={handleSubmit}
    >
      <div>
        <label className="text-primary text-sm font-semibold" htmlFor="name">
          Name
        </label>
        <input
          className="text-primary mt-2 w-full rounded-md border border-[color:var(--border-color)] bg-[color:var(--surface-raised)] px-3 py-2 text-sm outline-none focus:border-[color:var(--accent-strong)]"
          id="name"
          name="name"
          required
          type="text"
        />
      </div>

      <div>
        <label
          className="text-primary text-sm font-semibold"
          htmlFor="description"
        >
          Description
        </label>
        <textarea
          className="text-primary mt-2 min-h-28 w-full rounded-md border border-[color:var(--border-color)] bg-[color:var(--surface-raised)] px-3 py-2 text-sm outline-none focus:border-[color:var(--accent-strong)]"
          id="description"
          name="description"
          required
        />
      </div>

      <div>
        <label
          className="text-primary text-sm font-semibold"
          htmlFor="imageUrl"
        >
          Image URL
        </label>
        <input
          className="text-primary mt-2 w-full rounded-md border border-[color:var(--border-color)] bg-[color:var(--surface-raised)] px-3 py-2 text-sm outline-none focus:border-[color:var(--accent-strong)]"
          id="imageUrl"
          name="imageUrl"
          required
          type="url"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div>
          <label
            className="text-primary text-sm font-semibold"
            htmlFor="category"
          >
            Category
          </label>
          <input
            className="text-primary mt-2 w-full rounded-md border border-[color:var(--border-color)] bg-[color:var(--surface-raised)] px-3 py-2 text-sm outline-none focus:border-[color:var(--accent-strong)]"
            id="category"
            name="category"
            required
            type="text"
          />
        </div>

        <div>
          <label className="text-primary text-sm font-semibold" htmlFor="price">
            Price
          </label>
          <input
            className="text-primary mt-2 w-full rounded-md border border-[color:var(--border-color)] bg-[color:var(--surface-raised)] px-3 py-2 text-sm outline-none focus:border-[color:var(--accent-strong)]"
            id="price"
            name="price"
            required
            step="0.01"
            type="number"
          />
        </div>

        <div>
          <label className="text-primary text-sm font-semibold" htmlFor="stock">
            Stock
          </label>
          <input
            className="text-primary mt-2 w-full rounded-md border border-[color:var(--border-color)] bg-[color:var(--surface-raised)] px-3 py-2 text-sm outline-none focus:border-[color:var(--accent-strong)]"
            id="stock"
            name="stock"
            required
            step="1"
            type="number"
          />
        </div>
      </div>

      <label
        className="text-primary flex items-center gap-3 text-sm font-semibold"
        htmlFor="active"
      >
        <input
          className="h-4 w-4"
          defaultChecked
          id="active"
          name="active"
          type="checkbox"
        />
        Active
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <button
          className="bg-wsu hover:bg-wsu-light rounded-md px-5 py-3 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-70"
          disabled={state === "submitting"}
          type="submit"
        >
          {state === "submitting" ? "Creating product..." : "Create Product"}
        </button>
        {message ? (
          <p
            className={
              state === "error"
                ? "text-sm text-red-600"
                : "text-secondary text-sm"
            }
            data-test-id="product-form-message"
          >
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
