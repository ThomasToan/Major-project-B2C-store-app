"use client";

import type { ChangeEvent, FormEvent } from "react";

function getProductsUrl(form: HTMLFormElement) {
  const formData = new FormData(form);
  const search = formData.get("search")?.toString().trim() || "";
  const category = formData.get("category")?.toString().trim() || "";
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  if (category) {
    params.set("category", category);
  }

  const query = params.toString();
  return query ? `/products?${query}` : "/products";
}

export function ProductFilterForm({
  categories,
  category,
  search,
}: {
  categories: string[];
  category: string;
  search: string;
}) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.location.assign(getProductsUrl(event.currentTarget));
  }

  function handleCategoryChange(event: ChangeEvent<HTMLSelectElement>) {
    const form = event.currentTarget.form;

    if (form) {
      window.location.assign(getProductsUrl(form));
    }
  }

  return (
    <form
      action="/products"
      className="mt-8 grid gap-4 rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface-muted)] p-4 md:grid-cols-[minmax(0,1fr)_16rem_auto_auto] md:items-end"
      method="get"
      onSubmit={handleSubmit}
    >
      <div>
        <label
          className="text-primary text-sm font-semibold"
          htmlFor="product-search"
        >
          Search products
        </label>
        <input
          className="mt-2 w-full rounded-md border border-[color:var(--border-color)] bg-[color:var(--surface-raised)] px-3 py-2 text-sm text-primary outline-none focus:border-[color:var(--link)]"
          defaultValue={search}
          id="product-search"
          name="search"
          placeholder="Search by product name"
          type="search"
        />
      </div>
      <div>
        <label
          className="text-primary text-sm font-semibold"
          htmlFor="product-category"
        >
          Category
        </label>
        <select
          className="mt-2 w-full rounded-md border border-[color:var(--border-color)] bg-[color:var(--surface-raised)] px-3 py-2 text-sm text-primary outline-none focus:border-[color:var(--link)]"
          defaultValue={category}
          id="product-category"
          name="category"
          onChange={handleCategoryChange}
        >
          <option value="">All</option>
          {categories.map((productCategory) => (
            <option key={productCategory} value={productCategory}>
              {productCategory}
            </option>
          ))}
        </select>
      </div>
      <button
        className="rounded-md bg-[color:var(--text-primary)] px-4 py-2 text-sm font-semibold text-[color:var(--surface-raised)]"
        type="submit"
      >
        Apply
      </button>
      <a
        className="rounded-md border border-[color:var(--border-color)] px-4 py-2 text-center text-sm font-semibold text-primary"
        href="/products"
      >
        Clear
      </a>
    </form>
  );
}
