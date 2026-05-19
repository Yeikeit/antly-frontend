import { apiRequest } from "./client";

export type CategoryType = "EXPENSE" | "INCOME" | "SAVING";

export interface Subcategory {
  id: string;
  name: string;
  type: CategoryType;
  sourceType: string;
  sortOrder: number;
}

export interface CategoryTree {
  id: string;
  name: string;
  type: CategoryType;
  sourceType: string;
  sortOrder: number;
  subcategories: Subcategory[];
}

export async function getCategories(): Promise<CategoryTree[]> {
  return apiRequest<CategoryTree[]>("/categories");
}
