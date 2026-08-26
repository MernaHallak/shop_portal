"use client";

import {useQuery} from "@tanstack/react-query";

import {getCategories} from "@/api/categories";
import {queryKeys} from "@/api/query-keys";

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: getCategories,
  });
}

// useCategories()
// ↓
// GET /api/store/categories
// ↓
// Next Route
// ↓
// GET /api/categories/get من الباك

// وممكن نعمل useCategories() → GET /api/categories/get من الباك مباشرة بما انو مافي توكين بدنا نحميه بطبقة وسيطة لكن أنا بفضّل تضل مارق عبر /api/store/categories إذا بدنا نحافظ على نفس architecture بالمشروع