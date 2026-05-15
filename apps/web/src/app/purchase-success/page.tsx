import Link from "next/link";
import { AppLayout } from "@/components/Layout/AppLayout";

type PurchaseSuccessSearchParams = {
  purchaseId?: string;
};

export const dynamic = "force-dynamic";

export default async function PurchaseSuccessPage({
  searchParams,
}: {
  searchParams: Promise<PurchaseSuccessSearchParams>;
}) {
  const { purchaseId } = await searchParams;

  return (
    <AppLayout>
      <main className="px-4 py-10 md:px-10 md:py-12">
        <div className="mx-auto w-full max-w-3xl">
          <section
            className="rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface-muted)] p-8 text-center"
            data-test-id="purchase-success"
          >
            <p className="text-wsu text-sm font-semibold uppercase">
              Thomas Store
            </p>
            <h1 className="text-primary mt-3 text-4xl font-bold">
              Purchase complete
            </h1>
            <p className="text-secondary mt-4 leading-7">
              Your mock payment was approved and your order has been recorded.
            </p>
            {purchaseId ? (
              <p
                className="text-primary mt-4 font-semibold"
                data-test-id="purchase-id"
              >
                Purchase #{purchaseId}
              </p>
            ) : null}
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                className="rounded-md bg-wsu px-5 py-3 text-sm font-semibold text-white hover:bg-wsu-light"
                href="/products"
              >
                Continue shopping
              </Link>
              <Link
                className="rounded-md border border-[color:var(--border-color)] px-5 py-3 text-sm font-semibold text-primary"
                href="/cart"
              >
                View cart
              </Link>
            </div>
          </section>
        </div>
      </main>
    </AppLayout>
  );
}
