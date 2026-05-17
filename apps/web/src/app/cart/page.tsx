import { AppLayout } from "@/components/Layout/AppLayout";
import { CartView } from "@/components/Cart/CartView";
import { CustomerAccountNav } from "@/components/CustomerAuth/CustomerAccountNav";

export const dynamic = "force-dynamic";

export default function CartPage() {
  return (
    <AppLayout>
      <section className="px-4 pt-10 md:px-10 md:pt-12">
        <div className="mx-auto flex w-full max-w-5xl justify-end">
          <CustomerAccountNav className="w-full sm:w-96" />
        </div>
      </section>
      <CartView />
    </AppLayout>
  );
}
