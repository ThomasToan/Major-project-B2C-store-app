import Link from "next/link";
import { AppLayout } from "@/components/Layout/AppLayout";

export default function LoginPage() {
  return (
    <AppLayout>
      <main className="px-4 py-10 md:px-10 md:py-12">
        <div className="mx-auto w-full max-w-3xl rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface-muted)] p-8">
          <p className="text-wsu text-sm font-semibold uppercase">Account</p>
          <h1 className="text-primary mt-2 text-4xl font-bold">Login</h1>
          <p className="text-secondary mt-4 leading-7">
            Customer login is coming soon. Continue browsing products while this
            feature is being prepared.
          </p>
          <Link
            className="mt-6 inline-block rounded-md bg-wsu px-5 py-3 text-sm font-semibold text-white hover:bg-wsu-light"
            href="/products"
          >
            Browse Products
          </Link>
        </div>
      </main>
    </AppLayout>
  );
}
