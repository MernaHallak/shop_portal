"use client";

import {useMutation, useQueryClient} from "@tanstack/react-query";

import {createProduct} from "@/api/products";
import {queryKeys} from "@/api/query-keys";
import type {CreateProductRequest} from "@/types/product";

export function useCreateProduct() {
  const queryClient = useQueryClient(); //حتى أقدر أتحكم بالـ cache، مثل تحديثه أو إبطاله حتى يعيد جلب البيانات الجديدة.

  return useMutation({
    mutationFn: (product: CreateProductRequest) => createProduct(product),

    onSuccess: async () => {
      // اعتبر بيانات منتجات المتجر الموجودة بالكاش قديمة stale، وارجع حدّثها. React Query يعيد طلب getStoreProducts
      await queryClient.invalidateQueries({ 
        queryKey: queryKeys.storeProducts,
      });
    },
  });
}