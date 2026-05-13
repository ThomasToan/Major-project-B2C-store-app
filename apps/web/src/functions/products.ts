import { readActiveProductsFromDatabase } from "@repo/db/store";

export async function getActiveProducts() {
  return readActiveProductsFromDatabase();
}
