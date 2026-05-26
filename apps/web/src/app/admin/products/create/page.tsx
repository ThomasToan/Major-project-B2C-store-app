import Link from "next/link";
import { redirect } from "next/navigation";
import { CreateProductForm } from "@/components/Admin/CreateProductForm";
import { AppLayout } from "@/components/Layout/AppLayout";
import { getCurrentUser, requireAdmin } from "@/functions/customerSession";

export const dynamic = "force-dynamic";

export default async function CreateAdminProductPage() {
  const admin = await requireAdmin();

  if (!admin) {
    const user = await getCurrentUser();

    if (!user) {
      redirect("/login?redirect=/admin/products/create");
    }

    return (
      <AppLayout>
        <main className="px-4 py-10 md:px-10 md:py-12">
          <section
            className="mx-auto max-w-3xl rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface-muted)] p-8"
            data-test-id="admin-product-create-access-denied"
          >
            <p className="text-wsu text-sm font-semibold uppercase">
              Admin Area
            </p>
            <h1 className="text-primary mt-2 text-4xl font-bold">
              Access Denied
            </h1>
            <p className="text-secondary mt-4 leading-7">
              Creating products is only available to Thomas Store admin users.
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

  return (
    <AppLayout>
      <main className="px-4 py-10 md:px-10 md:py-12">
        <section
          className="mx-auto w-full max-w-4xl"
          data-test-id="admin-product-create-page"
        >
          <div className="border-b border-[color:var(--border-color)] pb-8">
            <p className="text-wsu text-sm font-semibold uppercase">
              Product Management
            </p>
            <h1 className="text-primary mt-2 text-4xl font-bold">
              Add Product
            </h1>
            <p className="text-secondary mt-3 max-w-2xl leading-7">
              Create a new product row in the Prisma Product table.
            </p>
            <Link
              className="text-primary mt-5 inline-flex rounded-md border border-[color:var(--border-color)] px-4 py-2 text-sm font-semibold"
              href="/admin/products"
            >
              Back to Product Management
            </Link>
          </div>

          <CreateProductForm />
        </section>
      </main>
    </AppLayout>
  );
}
