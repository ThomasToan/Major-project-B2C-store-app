"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useState } from "react";

function getProductsUrl({
  category,
  search,
}: {
  category: string;
  search: string;
}) {
  const params = new URLSearchParams();
  const trimmedSearch = search.trim();
  const trimmedCategory = category.trim();

  if (trimmedSearch) {
    params.set("search", trimmedSearch);
  }

  if (trimmedCategory) {
    params.set("category", trimmedCategory);
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
  const [searchValue, setSearchValue] = useState(search);
  const [categoryValue, setCategoryValue] = useState(category);

  useEffect(() => {
    setSearchValue(search);
  }, [search]);

  useEffect(() => {
    setCategoryValue(category);
  }, [category]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    window.location.assign(
      getProductsUrl({
        category: categoryValue,
        search: searchValue,
      }),
    );
  }

  function handleCategoryChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextCategory = event.currentTarget.value;

    setCategoryValue(nextCategory);
    window.location.assign(
      getProductsUrl({
        category: nextCategory,
        search: searchValue,
      }),
    );
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
          id="product-search"
          name="search"
          onChange={(event) => setSearchValue(event.currentTarget.value)}
          placeholder="Search by product name"
          type="search"
          value={searchValue}
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
          id="product-category"
          name="category"
          onChange={handleCategoryChange}
          value={categoryValue}
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
