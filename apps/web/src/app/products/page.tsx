import { AppLayout } from "../../components/Layout/AppLayout";
import { ProductCatalog } from "../../components/Products/ProductCatalog";
import {
  getActiveProductCategories,
  getActiveProducts,
} from "../../functions/products";

export const dynamic = "force-dynamic";

type ProductSearchParams = {
  search?: string;
  category?: string;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<ProductSearchParams>;
}) {
  const { search = "", category = "" } = await searchParams;
  const filters = {
    category,
    search,
  };
  const [products, categories] = await Promise.all([
    getActiveProducts(filters),
    getActiveProductCategories(),
  ]);

  return (
    <AppLayout>
      <ProductCatalog
        categories={categories}
        category={category}
        products={products}
        search={search}
      />
    </AppLayout>
  );
}
