import {
  readActiveProductCategoriesFromDatabase,
  readActiveProductByIdFromDatabase,
  readActiveProductsFromDatabase,
  type ProductFilters,
} from "@repo/db/store";

export async function getActiveProducts(filters: ProductFilters = {}) {
  return readActiveProductsFromDatabase(filters);
}

export async function getActiveProductById(id: number) {
  return readActiveProductByIdFromDatabase(id);
}

export async function getActiveProductCategories() {
  return readActiveProductCategoriesFromDatabase();
}
