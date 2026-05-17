import Link from "next/link";
import { AppLayout } from "@/components/Layout/AppLayout";
import { LogoutButton } from "@/components/CustomerAuth/LogoutButton";
import { RegisterForm } from "@/components/CustomerAuth/RegisterForm";
import { getCurrentCustomer } from "@/functions/customerSession";

type AuthSearchParams = {
  redirect?: string;
};

function getSafeRedirect(redirect?: string) {
  return redirect?.startsWith("/") ? redirect : "/";
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<AuthSearchParams>;
}) {
  const customer = await getCurrentCustomer();
  const { redirect } = await searchParams;
  const redirectTo = getSafeRedirect(redirect);

  return (
    <AppLayout>
      <main className="px-4 py-10 md:px-10 md:py-12">
        <div className="mx-auto w-full max-w-3xl rounded-lg border border-[color:var(--border-color)] bg-[color:var(--surface-muted)] p-8">
          <p className="text-wsu text-sm font-semibold uppercase">Account</p>
          <h1 className="text-primary mt-2 text-4xl font-bold">Register</h1>
          {customer ? (
            <div className="mt-6 space-y-4" data-test-id="account-status">
              <p className="text-secondary">
                Welcome{" "}
                <span className="font-semibold text-primary">{customer.name}</span>
              </p>
              <p className="text-secondary text-sm">{customer.email}</p>
              <LogoutButton />
            </div>
          ) : (
            <>
              <p className="text-secondary mt-4 leading-7">
                Create a customer account to keep your cart and future order
                history together.
              </p>
              <RegisterForm redirectTo={redirectTo} />
              <p className="text-secondary mt-6 text-sm">
                Already registered?{" "}
                <Link
                  className="font-semibold text-primary"
                  href={`/login?redirect=${encodeURIComponent(redirectTo)}`}
                >
                  Login
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
    </AppLayout>
  );
}
