import { AppLayout } from "../../components/Layout/AppLayout";
import { ProductCatalog } from "../../components/Products/ProductCatalog";
import { getActiveProducts } from "../../functions/products";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getActiveProducts();

  return (
    <AppLayout>
      <ProductCatalog products={products} />
    </AppLayout>
  );
}
