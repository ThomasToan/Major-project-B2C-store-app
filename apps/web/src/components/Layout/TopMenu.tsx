"use client"; // run on the client side

import {
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline"; // import icons for search, clear/close
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid"; // import icons for dark and light mode
import { Button } from "@repo/ui/button";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";// there are Reack hooks: useState = store current input text, useEffect = react to prop changes, startTransition = perform navigations as a non-urgent UI update
import { useTheme } from "../Themes/ThemeContext"; // This imports your custom theme hook

function getProductsSearchUrl(search: string) {
  const trimmedSearch = search.trim();
  return trimmedSearch
    ? `/products?search=${encodeURIComponent(trimmedSearch)}`
    : "/products";
}

function debounce(fn: (search: string) => void, delay = 300) {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (search: string) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(search), delay);
  };
}

export function TopMenu({ query }: { query?: string }) { // This defines the TopMenu component
  const router = useRouter();
  const [value, setValue] = useState(query ?? ""); // create local state for the search input, value = current text in the input box, setvalue = function to change that text
  // if query exists, use it
  const { theme, toggleTheme } = useTheme();
// theme = current theme, probably "light" or "dark", toggleTheme = function to switch between themes
  const handleSearch = useMemo(
    () =>
      debounce((search: string) => {
        startTransition(() => {
          router.push(getProductsSearchUrl(search));
        });
      }),
    [router],
  );

  useEffect(() => {
    setValue(query ?? "");
  }, [query]); // whenever the query prop changes, update the input value too.

  return (
    <header className="sticky top-0 z-10 border-b border-[color:var(--border-color)] bg-[color:var(--surface-raised)]/95 px-4 py-3 backdrop-blur md:px-8">
      <div className="flex flex-col gap-3 lg:h-10 lg:flex-row lg:items-center">
        <form
          action="/products"
          className="grid flex-1 grid-cols-1"
          method="GET"
          onSubmit={(event) => {
            event.preventDefault();
            router.push(getProductsSearchUrl(value));
          }}
        >
          <div className="relative">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-secondary" />
            <input
              className="h-10 w-full rounded-none border-0 bg-transparent py-2 pl-11 pr-12 text-base text-primary outline-none transition placeholder:text-secondary focus:ring-0"
              onChange={(event) => {
                const search = event.target.value;
                setValue(search);
                handleSearch(search);
              }}
              name="search"
              placeholder="Search products"
              type="search"
              value={value}
            />
            {value ? (
              <button
                aria-label="Clear search"
                className="absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-secondary transition hover:bg-[color:var(--surface-subtle)] hover:text-primary"
                onClick={() => {
                  setValue("");
                  handleSearch("");
                }}
                type="button"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </form>
        <Button
          className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[color:var(--border-color)] bg-[color:var(--surface-raised)] px-4 text-sm font-semibold text-primary shadow-sm transition hover:bg-[color:var(--surface-muted)]"
          onClick={toggleTheme}
          type="button"
        >
          {theme === "light" ? (
            <MoonIcon className="h-4 w-4 text-amber-500" />
          ) : (
            <SunIcon className="h-4 w-4 text-amber-400" />
          )}
          {theme === "light" ? "Dark Mode" : "Light Mode"}
        </Button>
      </div>
    </header>
  );
}
