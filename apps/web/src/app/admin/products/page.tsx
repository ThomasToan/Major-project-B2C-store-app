import { getAllProductsForAdmin } from "@repo/db/store";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppLayout } from "@/components/Layout/AppLayout";
import { getCurrentUser, requireAdmin } from "@/functions/customerSession";

const currencyFormatter = new Intl.NumberFormat("en-AU", {
  currency: "AUD",
  style: "currency",
});

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const admin = await requireAdmin();

  if (!admin) {
    const user = await getCurrentUser();

    if (!user) {
      redirect("/login?redirect=/admin/products");
    }

    return (
      <AppLayout>
        <main className="px-4 py-10 md:px-10 md:py-12">
          <section
            className="mx-auto max-w-3xl rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface-muted)] p-8"
            data-test-id="admin-products-access-denied"
          >
            <p className="text-wsu text-sm font-semibold uppercase">
              Admin Area
            </p>
            <h1 className="text-primary mt-2 text-4xl font-bold">
              Access Denied
            </h1>
            <p className="text-secondary mt-4 leading-7">
              Product management is only available to Thomas Store admin users.
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

  const products = await getAllProductsForAdmin();

  return (
    <AppLayout>
      <main className="px-4 py-10 md:px-10 md:py-12">
        <section
          className="mx-auto w-full max-w-7xl"
          data-test-id="admin-products-page"
        >
          <div className="flex flex-col gap-4 border-b border-[color:var(--border-color)] pb-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-wsu text-sm font-semibold uppercase">
                Admin Area
              </p>
              <h1 className="text-primary mt-2 text-4xl font-bold">
                Product Management
              </h1>
              <p className="text-secondary mt-3 max-w-2xl leading-7">
                View every product in the database, including inactive products
                hidden from the public store.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                className="text-primary rounded-md border border-[color:var(--border-color)] px-4 py-2 text-sm font-semibold"
                href="/admin"
              >
                Back to Admin Dashboard
              </Link>
              <Link
                className="bg-wsu hover:bg-wsu-light rounded-md px-4 py-2 text-sm font-semibold text-white"
                href="/admin/products/create"
              >
                Add Product
              </Link>
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface-muted)]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[color:var(--border-color)] text-left text-sm">
                <thead className="text-secondary bg-[color:var(--surface-raised)]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">ID</th>
                    <th className="px-4 py-3 font-semibold">Image</th>
                    <th className="px-4 py-3 font-semibold">Product</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 font-semibold">Price</th>
                    <th className="px-4 py-3 font-semibold">Stock</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[color:var(--border-color)]">
                  {products.map((product) => (
                    <tr data-test-id="admin-product-row" key={product.id}>
                      <td className="text-secondary px-4 py-4 font-mono text-xs">
                        {product.id}
                      </td>
                      <td className="px-4 py-4">
                        <img
                          alt={product.name}
                          className="h-14 w-14 rounded-md object-cover"
                          src={product.imageUrl}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-primary font-semibold">
                          {product.name}
                        </p>
                        <p className="text-secondary mt-1 max-w-sm truncate text-xs">
                          {product.imageUrl}
                        </p>
                      </td>
                      <td className="text-primary px-4 py-4">
                        {product.category}
                      </td>
                      <td className="text-primary px-4 py-4">
                        {currencyFormatter.format(product.price)}
                      </td>
                      <td className="text-primary px-4 py-4">
                        {product.stock}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={
                            product.active
                              ? "inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"
                              : "inline-flex rounded-full bg-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-700"
                          }
                        >
                          {product.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            className="text-primary rounded-md border border-[color:var(--border-color)] px-3 py-2 text-xs font-semibold"
                            href={`/admin/products/${product.id}/edit`}
                          >
                            Edit
                          </Link>
                          <button
                            className="text-secondary cursor-not-allowed rounded-md border border-[color:var(--border-color)] px-3 py-2 text-xs font-semibold opacity-70"
                            disabled
                            type="button"
                          >
                            Future action
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </AppLayout>
  );
}
