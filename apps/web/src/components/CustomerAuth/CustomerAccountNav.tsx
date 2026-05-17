"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Customer = {
  email: string;
  id: number;
  name: string;
};

function getAuthHref(path: string, target: "login" | "register") {
  if (path === "/") {
    return `/${target}`;
  }

  return `/${target}?redirect=${encodeURIComponent(path)}`;
}

export function CustomerAccountNav({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [customer, setCustomer] = useState<Customer | null>();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const currentPath = useMemo(() => {
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    let isMounted = true;

    void fetch("/api/customer-auth/me", { cache: "no-store" })
      .then(async (response) => {
        if (!isMounted) {
          return;
        }

        if (!response.ok) {
          setCustomer(null);
          return;
        }

        const body = (await response.json()) as { user?: Customer | null };
        setCustomer(body.user ?? null);
      })
      .catch(() => {
        if (isMounted) {
          setCustomer(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);
    await fetch("/api/customer-auth/logout", {
      method: "POST",
    });
    window.location.reload();
  }

  if (customer === undefined) {
    return (
      <div
        className={`rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface-muted)] p-4 ${className}`}
        data-test-id="customer-account-nav"
      >
        <p className="text-secondary text-sm">Checking account...</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface-muted)] p-4 ${className}`}
      data-test-id="customer-account-nav"
    >
      {customer ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div data-test-id="account-status">
            <p className="text-secondary text-sm">Welcome</p>
            <p className="text-primary mt-1 font-semibold">{customer.name}</p>
            <p className="text-secondary mt-1 text-xs">{customer.email}</p>
          </div>
          <button
            className="rounded-md border border-[color:var(--border-color)] px-4 py-2 text-sm font-semibold text-primary disabled:cursor-wait disabled:opacity-70"
            data-test-id="logout-button"
            disabled={isLoggingOut}
            onClick={handleLogout}
            type="button"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <Link
            className="rounded-md border border-[color:var(--border-color)] px-4 py-2 text-center text-sm font-semibold text-primary"
            href={getAuthHref(currentPath, "login")}
          >
            Login
          </Link>
          <Link
            className="rounded-md border border-[color:var(--border-color)] px-4 py-2 text-center text-sm font-semibold text-primary"
            href={getAuthHref(currentPath, "register")}
          >
            Register
          </Link>
        </div>
      )}
    </div>
  );
}
