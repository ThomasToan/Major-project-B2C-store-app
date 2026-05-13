import { AppLayout } from "@/components/Layout/AppLayout";
import { AddToCartButton } from "@/components/Cart/AddToCartButton";
import { CustomerAccountNav } from "@/components/CustomerAuth/CustomerAccountNav";
import { getActiveProductById } from "@/functions/products";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

const currencyFormatter = new Intl.NumberFormat("en-AU", {
  currency: "AUD",
  style: "currency",
});

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId < 1) {
    notFound();
  }

  const product = await getActiveProductById(productId);

  if (!product) {
    notFound();
  }

  const inStock = product.stock > 0;

  return (
    <AppLayout>
      <main className="px-4 py-10 md:px-10 md:py-12">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <a
              className="text-secondary text-sm font-semibold hover:text-primary"
              href="/products"
            >
              Back to products
            </a>
            <CustomerAccountNav className="w-full sm:w-80" />
          </div>

          <article
            className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(22rem,0.95fr)] lg:items-start"
            data-test-id="product-detail"
          >
            <div className="overflow-hidden rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface-subtle)]">
              <img
                alt={product.name}
                className="aspect-[4/3] h-full w-full object-cover"
                data-test-id="product-detail-image"
                src={product.imageUrl}
              />
            </div>

            <div className="space-y-6">
              <div className="border-b border-[color:var(--border-color)] pb-6">
                <p className="text-wsu text-sm font-semibold uppercase">
                  {product.category}
                </p>
                <h1 className="text-primary mt-3 text-4xl font-bold leading-tight">
                  {product.name}
                </h1>
                <p
                  className="text-primary mt-4 text-3xl font-bold"
                  data-test-id="product-detail-price"
                >
                  {currencyFormatter.format(product.price)}
                </p>
              </div>

              <p className="text-secondary text-base leading-7">
                {product.description}
              </p>

              <dl className="grid gap-4 rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface-muted)] p-5 sm:grid-cols-2">
                <div>
                  <dt className="text-secondary text-sm font-medium">
                    Category
                  </dt>
                  <dd
                    className="text-primary mt-1 font-semibold"
                    data-test-id="product-detail-category"
                  >
                    {product.category}
                  </dd>
                </div>
                <div>
                  <dt className="text-secondary text-sm font-medium">
                    Stock quantity
                  </dt>
                  <dd
                    className="text-primary mt-1 font-semibold"
                    data-test-id="product-detail-stock"
                  >
                    {product.stock} available
                  </dd>
                </div>
                <div>
                  <dt className="text-secondary text-sm font-medium">
                    Availability
                  </dt>
                  <dd className="text-primary mt-1 font-semibold">
                    {inStock ? "In stock" : "Out of stock"}
                  </dd>
                </div>
              </dl>

              <div
                className="rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface-muted)] p-5"
                data-test-id="product-detail-actions"
              >
                <AddToCartButton productId={product.id} />
              </div>
            </div>
          </article>
        </div>
      </main>
    </AppLayout>
  );
}
