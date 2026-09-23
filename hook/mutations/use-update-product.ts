"use client";

import {useMutation, useQueryClient} from "@tanstack/react-query";

import {updateProduct} from "@/api/products";
import {queryKeys} from "@/api/query-keys";
import type {UpdateProductRequest} from "@/types/product";

interface UpdateProductVariables {
  productId: string;
  updateData: UpdateProductRequest;
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({productId,updateData}: UpdateProductVariables) =>updateProduct(productId, updateData),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.storeProducts(),
      });
    },
  });
}