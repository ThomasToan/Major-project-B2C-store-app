import { AppLayout } from "@/components/Layout/AppLayout";
import { CartView } from "@/components/Cart/CartView";

export const dynamic = "force-dynamic";

export default function CartPage() {
  return (
    <AppLayout>
      <CartView />
    </AppLayout>
  );
}
