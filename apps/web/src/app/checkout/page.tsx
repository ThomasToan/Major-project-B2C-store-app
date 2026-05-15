import { getCartByUserId, getOrCreateCartByUserId } from "@repo/db/store";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/Checkout/CheckoutForm";
import { CustomerAccountNav } from "@/components/CustomerAuth/CustomerAccountNav";
import { AppLayout } from "@/components/Layout/AppLayout";
import { getCurrentCustomer } from "@/functions/customerSession";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect("/login?redirect=/checkout");
  }

  await getOrCreateCartByUserId(customer.id);
  const cart = await getCartByUserId(customer.id);
  const checkoutCart = {
    itemCount: cart.itemCount,
    items: cart.items.map((item) => ({
      id: item.id,
      product: {
        category: item.product.category,
        imageUrl: item.product.imageUrl,
        name: item.product.name,
      },
      productId: item.productId,
      quantity: item.quantity,
      subtotal: item.subtotal,
      unitPrice: item.unitPrice,
    })),
    total: cart.total,
  };

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
                Checkout
              </h1>
              <p className="text-secondary mt-3 max-w-2xl text-base leading-7">
                Review your cart and complete the order with the mock payment
                gateway.
              </p>
            </div>
            <CustomerAccountNav className="w-full md:w-96" />
          </div>

          <div className="mt-10">
            <CheckoutForm
              cart={checkoutCart}
              customer={{
                email: customer.email,
                name: customer.name,
              }}
            />
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
