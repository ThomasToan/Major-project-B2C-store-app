import type { ReactNode } from "react";
import Link from "next/link";

const shopLinks = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/products",
    label: "All Products",
  },
  {
    href: "/cart",
    label: "Cart",
  },
];

const categoryLinks = ["Electronics", "Clothing", "Accessories", "Home"];

const accountLinks = [
  {
    href: "/purchases",
    label: "My Orders",
  },
  {
    href: "/login",
    label: "Login",
  },
  {
    href: "/register",
    label: "Register",
  },
];

function toTestId(value: string) {
  return value.toLowerCase().replace(/\s+/g, "-");
}

function SidebarSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <section>
      <h2 className="text-secondary text-xs font-semibold uppercase">
        {title}
      </h2>
      <div className="mt-3 grid gap-1">{children}</div>
    </section>
  );
}

function SidebarLink({
  href,
  label,
  testId,
}: {
  href: string;
  label: string;
  testId?: string;
}) {
  return (
    <Link
      className="text-primary rounded-md px-3 py-2 text-sm font-semibold transition hover:bg-[color:var(--surface-raised)]"
      data-test-id={testId}
      href={href}
    >
      {label}
    </Link>
  );
}

type LeftMenuProps = {
  selectedCategory?: string;
  selectedTag?: string;
  selectedYear?: string;
  selectedMonth?: string;
  showAdminLink?: boolean;
};

export function LeftMenu({ showAdminLink = false }: LeftMenuProps) {
  const visibleAccountLinks = showAdminLink
    ? [
        {
          href: "/admin",
          label: "Admin Dashboard",
        },
        {
          href: "/admin/products",
          label: "Product Management",
        },
        ...accountLinks,
      ]
    : accountLinks;

  return (
    <aside className="w-full border-b border-[color:var(--border-color)] bg-[color:var(--surface-muted)] md:sticky md:top-0 md:h-screen md:border-b-0 md:border-r">
      <div className="flex h-full flex-col px-7 py-5 md:overflow-y-auto">
        <Link className="flex items-center gap-3" href="/">
          <img
            alt="Western Sydney University"
            className="h-8 w-8 rounded-lg object-contain"
            src="/wsulogo.png"
          />
          <div>
            <p className="text-primary text-xl font-bold">Thomas Store</p>
            <p className="text-secondary text-xs font-medium">B2C storefront</p>
          </div>
        </Link>
        <nav className="mt-12 flex flex-1 flex-col gap-8">
          <SidebarSection title="Shop">
            {shopLinks.map((item) => (
              <SidebarLink
                href={item.href}
                key={item.href}
                label={item.label}
                testId={`store-nav-${toTestId(item.label)}`}
              />
            ))}
          </SidebarSection>

          <SidebarSection title="Categories">
            {categoryLinks.map((category) => (
              <SidebarLink
                href={`/products?category=${encodeURIComponent(category)}`}
                key={category}
                label={category}
                testId={`store-category-${category.toLowerCase()}`}
              />
            ))}
          </SidebarSection>

          <SidebarSection title="Account">
            {visibleAccountLinks.map((item) => (
              <SidebarLink
                href={item.href}
                key={item.href}
                label={item.label}
                testId={`store-account-${toTestId(item.label)}`}
              />
            ))}
          </SidebarSection>
        </nav>
      </div>
    </aside>
  );
}
