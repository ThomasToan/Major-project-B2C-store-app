import { getPurchasesForUser } from "@repo/db/store";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CustomerAccountNav } from "@/components/CustomerAuth/CustomerAccountNav";
import { AppLayout } from "@/components/Layout/AppLayout";
import { getCurrentCustomer } from "@/functions/customerSession";

export const dynamic = "force-dynamic";

const currencyFormatter = new Intl.NumberFormat("en-AU", {
  currency: "AUD",
  style: "currency",
});

const dateFormatter = new Intl.DateTimeFormat("en-AU", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function PurchasesPage() {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect("/login?redirect=/purchases");
  }

  const purchases = await getPurchasesForUser(customer.id);

  return (
    <AppLayout>
      <main className="px-4 py-10 md:px-10 md:py-12">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-col gap-4 border-b border-[color:var(--border-color)] pb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-wsu text-sm font-semibold uppercase">
                Thomas Store
              </p>
              <h1 className="text-primary mt-2 text-4xl font-bold">
                My Orders
              </h1>
              <p className="text-secondary mt-3 max-w-2xl text-base leading-7">
                Review the purchases linked to your customer account.
              </p>
            </div>
            <CustomerAccountNav className="w-full md:w-96" />
          </div>

          {purchases.length === 0 ? (
            <div
              className="mt-10 rounded-lg border border-dashed border-[color:var(--border-color)] bg-[color:var(--surface-muted)] p-8 text-center"
              data-test-id="purchases-empty"
            >
              <h2 className="text-primary text-xl font-semibold">
                No orders yet.
              </h2>
              <p className="text-secondary mt-2 text-sm">
                Completed purchases will appear here.
              </p>
              <Link
                className="mt-6 inline-flex rounded-md bg-wsu px-5 py-3 text-sm font-semibold text-white hover:bg-wsu-light"
                href="/products"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="mt-10 space-y-5">
              {purchases.map((purchase) => (
                <article
                  className="rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface-raised)] p-5"
                  data-test-id="purchase-card"
                  key={purchase.id}
                >
                  <div className="flex flex-col gap-3 border-b border-[color:var(--border-color)] pb-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <h2
                        className="text-primary text-xl font-semibold"
                        data-test-id="purchase-number"
                      >
                        Order #{purchase.id}
                      </h2>
                      <p
                        className="text-secondary mt-1 text-sm"
                        data-test-id="purchase-date"
                      >
                        {dateFormatter.format(purchase.createdAt)}
                      </p>
                    </div>
                    <p
                      className="text-primary text-xl font-bold"
                      data-test-id="purchase-total"
                    >
                      {currencyFormatter.format(purchase.totalAmount)}
                    </p>
                  </div>

                  <div className="mt-4 space-y-3">
                    {purchase.items.map((item) => (
                      <div
                        className="grid gap-3 rounded-md bg-[color:var(--surface-muted)] p-3 sm:grid-cols-[4rem_minmax(0,1fr)_auto]"
                        data-test-id="purchase-item"
                        key={item.id}
                      >
                        <img
                          alt={item.product.name}
                          className="aspect-square rounded-md object-cover"
                          src={item.product.imageUrl}
                        />
                        <div>
                          <p
                            className="text-primary font-semibold"
                            data-test-id="purchase-item-name"
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
                          data-test-id="purchase-item-subtotal"
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
        </div>
      </main>
    </AppLayout>
  );
}
