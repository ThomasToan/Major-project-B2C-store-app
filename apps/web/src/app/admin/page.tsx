import Link from "next/link";
import { redirect } from "next/navigation";
import { AppLayout } from "@/components/Layout/AppLayout";
import { getCurrentUser, requireAdmin } from "@/functions/customerSession";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  if (!admin) {
    const user = await getCurrentUser();

    if (!user) {
      redirect("/login?redirect=/admin");
    }

    return (
      <AppLayout>
        <main className="px-4 py-10 md:px-10 md:py-12">
          <section
            className="mx-auto max-w-3xl rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface-muted)] p-8"
            data-test-id="admin-access-denied"
          >
            <p className="text-wsu text-sm font-semibold uppercase">
              Admin Area
            </p>
            <h1 className="text-primary mt-2 text-4xl font-bold">
              Access Denied
            </h1>
            <p className="text-secondary mt-4 leading-7">
              This page is only available to Thomas Store admin users.
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
        <section className="mx-auto max-w-5xl" data-test-id="admin-dashboard">
          <p className="text-wsu text-sm font-semibold uppercase">Admin Area</p>
          <h1 className="text-primary mt-2 text-4xl font-bold">
            Admin Dashboard
          </h1>
          <p className="text-secondary mt-4 max-w-2xl leading-7">
            Welcome, {admin.name}. Use this area to manage future Thomas Store
            admin features.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Link
              className="rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface-muted)] p-6 transition hover:bg-[color:var(--surface-raised)]"
              href="/admin/products"
            >
              <h2 className="text-primary text-xl font-semibold">
                Manage Products
              </h2>
              <p className="text-secondary mt-2 text-sm leading-6">
                Product management will be added in the admin CRUD step.
              </p>
            </Link>
            <Link
              className="rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface-muted)] p-6 transition hover:bg-[color:var(--surface-raised)]"
              href="/admin/purchases"
            >
              <h2 className="text-primary text-xl font-semibold">
                View Orders
              </h2>
              <p className="text-secondary mt-2 text-sm leading-6">
                Admin purchase records will be added in the next admin step.
              </p>
            </Link>
          </div>
        </section>
      </main>
    </AppLayout>
  );
}
