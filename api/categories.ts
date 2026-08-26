import {apiClient} from "@/api/client";
import type {CategoriesResponse} from "@/types/category";

export async function getCategories(): Promise<CategoriesResponse> {
  const response = await apiClient.get<CategoriesResponse>(
    "/store/categories",
  );

  return response.data;
}