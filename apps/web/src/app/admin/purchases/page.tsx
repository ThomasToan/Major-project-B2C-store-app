import { getAllPurchasesForAdmin } from "@repo/db/store";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppLayout } from "@/components/Layout/AppLayout";
import { getCurrentUser, requireAdmin } from "@/functions/customerSession";

export const dynamic = "force-dynamic";

const currencyFormatter = new Intl.NumberFormat("en-AU", {
  currency: "AUD",
  style: "currency",
});

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function AdminPurchasesPage() {
  const admin = await requireAdmin();

  if (!admin) {
    const user = await getCurrentUser();

    if (!user) {
      redirect("/login?redirect=/admin/purchases");
    }

    return (
      <AppLayout>
        <main className="px-4 py-10 md:px-10 md:py-12">
          <section
            className="mx-auto max-w-3xl rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface-muted)] p-8"
            data-test-id="admin-purchases-access-denied"
          >
            <p className="text-wsu text-sm font-semibold uppercase">
              Admin Area
            </p>
            <h1 className="text-primary mt-2 text-4xl font-bold">
              Access Denied
            </h1>
            <p className="text-secondary mt-4 leading-7">
              Purchase records are only available to Thomas Store admin users.
            </p>
            <Link
              className="bg-wsu hover:bg-wsu-light mt-6 inline-flex rounded-md px-5 py-3 text-sm font-semibold text-white"
              href="/"
            >
              Back to store
            </Link>
          </section>
        </main>
      </AppLayout>
    );
  }

  const purchases = await getAllPurchasesForAdmin();

  return (
    <AppLayout>
      <main className="px-4 py-10 md:px-10 md:py-12">
        <section
          className="mx-auto w-full max-w-6xl"
          data-test-id="admin-purchases-page"
        >
          <div className="flex flex-col gap-4 border-b border-[color:var(--border-color)] pb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-wsu text-sm font-semibold uppercase">
                Admin Area
              </p>
              <h1 className="text-primary mt-2 text-4xl font-bold">
                Purchase Records
              </h1>
              <p className="text-secondary mt-3 max-w-2xl leading-7">
                View completed purchases from all Thomas Store customers.
              </p>
            </div>
            <Link
              className="text-primary rounded-md border border-[color:var(--border-color)] px-4 py-2 text-sm font-semibold"
              href="/admin"
            >
              Back to Admin Dashboard
            </Link>
          </div>

          {purchases.length === 0 ? (
            <div
              className="mt-10 rounded-lg border border-dashed border-[color:var(--border-color)] bg-[color:var(--surface-muted)] p-8 text-center"
              data-test-id="admin-purchases-empty"
            >
              <h2 className="text-primary text-xl font-semibold">
                No purchase records yet.
              </h2>
              <p className="text-secondary mt-2 text-sm">
                Completed customer checkouts will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-10 space-y-5">
              {purchases.map((purchase) => (
                <article
                  className="rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface-raised)] p-5"
                  data-test-id="admin-purchase-card"
                  key={purchase.id}
                >
                  <div className="flex flex-col gap-4 border-b border-[color:var(--border-color)] pb-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h2
                        className="text-primary text-xl font-semibold"
                        data-test-id="admin-purchase-number"
                      >
                        Order #{purchase.id}
                      </h2>
                      <p
                        className="text-secondary mt-1 text-sm"
                        data-test-id="admin-purchase-date"
                      >
                        {dateFormatter.format(purchase.createdAt)}
                      </p>
                      <div className="mt-3 text-sm">
                        <p
                          className="text-primary font-semibold"
                          data-test-id="admin-purchase-customer-name"
                        >
                          {purchase.customerName}
                        </p>
                        <p
                          className="text-secondary mt-1"
                          data-test-id="admin-purchase-customer-email"
                        >
                          {purchase.customerEmail}
                        </p>
                      </div>
                    </div>
                    <p
                      className="text-primary text-xl font-bold"
                      data-test-id="admin-purchase-total"
                    >
                      {currencyFormatter.format(purchase.totalAmount)}
                    </p>
                  </div>

                  <div className="mt-4 space-y-3">
                    {purchase.items.map((item) => (
                      <div
                        className="grid gap-3 rounded-md bg-[color:var(--surface-muted)] p-3 sm:grid-cols-[minmax(0,1fr)_auto]"
                        data-test-id="admin-purchase-item"
                        key={item.id}
                      >
                        <div>
                          <p
                            className="text-primary font-semibold"
                            data-test-id="admin-purchase-item-name"
                          >
                            {item.product.name}
                          </p>
                          <p className="text-secondary mt-1 text-sm">
                            Qty {item.quantity} at{" "}
                            {currencyFormatter.format(item.unitPrice)}
                          </p>
                        </div>
                        <p
                          className="text-primary font-semibold sm:text-right"
                          data-test-id="admin-purchase-item-subtotal"
                        >
                          {currencyFormatter.format(item.subtotal)}
                        </p>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </AppLayout>
  );
}
