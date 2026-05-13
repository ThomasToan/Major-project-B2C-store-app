import Link from "next/link";
import { AppLayout } from "../components/Layout/AppLayout";

const features = [
  {
    description: "Search and filter active products from the store database.",
    title: "Browse products",
  },
  {
    description: "A guided payment flow will be added in the checkout step.",
    title: "Secure mock checkout coming soon",
  },
  {
    description: "Registered customers will be able to review past orders.",
    title: "Track purchase history coming soon",
  },
];

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <AppLayout>
      <main className="px-4 py-10 md:px-10 md:py-12">
        <div className="mx-auto w-full max-w-6xl">
          <section
            className="grid gap-8 border-b border-[color:var(--border-color)] pb-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end"
            data-test-id="b2c-homepage"
          >
            <div>
              <p className="text-wsu text-sm font-semibold uppercase">
                Applied Project Option 2
              </p>
              <h1 className="text-primary mt-3 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
                B2C Store
              </h1>
              <p className="text-secondary mt-4 max-w-2xl text-base leading-7">
                Welcome to the storefront. Browse products, manage your cart,
                and prepare for checkout features coming next.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <Link
                className="rounded-md bg-wsu px-5 py-3 text-center text-sm font-semibold text-white hover:bg-wsu-light"
                href="/products"
              >
                Browse Products
              </Link>
              <Link
                className="rounded-md border border-[color:var(--border-color)] px-5 py-3 text-center text-sm font-semibold text-primary"
                href="/cart"
              >
                Cart
              </Link>
              <div className="grid grid-cols-2 gap-3 sm:col-span-2 lg:col-span-1">
                <Link
                  className="rounded-md border border-[color:var(--border-color)] px-5 py-3 text-center text-sm font-semibold text-primary"
                  href="/login"
                >
                  Login
                </Link>
                <Link
                  className="rounded-md border border-[color:var(--border-color)] px-5 py-3 text-center text-sm font-semibold text-primary"
                  href="/register"
                >
                  Register
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-10 grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <article
                className="rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface-muted)] p-5"
                key={feature.title}
              >
                <h2 className="text-primary text-lg font-semibold">
                  {feature.title}
                </h2>
                <p className="text-secondary mt-2 text-sm leading-6">
                  {feature.description}
                </p>
              </article>
            ))}
          </section>
        </div>
      </main>
    </AppLayout>
  );
}
