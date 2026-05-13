import type { StoredProduct } from "@repo/db/store";

const currencyFormatter = new Intl.NumberFormat("en-AU", {
  currency: "AUD",
  style: "currency",
});

export function ProductCatalog({ products }: { products: StoredProduct[] }) {
  const productCount = products.length;

  return (
    <main className="px-4 py-10 md:px-10 md:py-12">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-4 border-b border-[color:var(--border-color)] pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-wsu text-sm font-semibold uppercase">
              B2C Store
            </p>
            <h1 className="text-primary mt-2 text-4xl font-bold">Products</h1>
            <p className="text-secondary mt-3 max-w-2xl text-base leading-7">
              Browse the active products currently available in the store.
            </p>
          </div>
          <p className="text-secondary text-sm font-medium">
            {productCount} {productCount === 1 ? "product" : "products"}
          </p>
        </div>

        {productCount === 0 ? (
          <div className="mt-10 border border-dashed border-[color:var(--border-color)] bg-[color:var(--surface-muted)] p-8 text-center">
            <h2 className="text-primary text-xl font-semibold">
              No active products
            </h2>
            <p className="text-secondary mt-2 text-sm">
              Seed or activate products before showing them in the storefront.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <article
                className="overflow-hidden rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface-raised)] shadow-sm"
                data-test-id="product-card"
                key={product.id}
              >
                <div className="aspect-[4/3] overflow-hidden bg-[color:var(--surface-subtle)]">
                  <img
                    alt={product.name}
                    className="h-full w-full object-cover"
                    src={product.imageUrl}
                  />
                </div>
                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-wsu text-xs font-semibold uppercase">
                        {product.category}
                      </p>
                      <h2 className="text-primary mt-2 text-lg font-semibold leading-6">
                        {product.name}
                      </h2>
                    </div>
                    <p className="text-primary shrink-0 text-lg font-bold">
                      {currencyFormatter.format(product.price)}
                    </p>
                  </div>
                  <p className="text-secondary line-clamp-3 text-sm leading-6">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between border-t border-[color:var(--border-color)] pt-4 text-sm">
                    <span className="text-secondary font-medium">Stock</span>
                    <span className="text-primary font-semibold">
                      {product.stock > 0
                        ? `${product.stock} available`
                        : "Out of stock"}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
