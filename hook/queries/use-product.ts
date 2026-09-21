"use client";

import {useQuery} from "@tanstack/react-query";

import {getProductById} from "@/api/products";
import {queryKeys} from "@/api/query-keys";

export function useProduct(productId: string) { 
  return useQuery({
    queryKey: queryKeys.product(productId),
    queryFn: () => getProductById(productId),
    enabled: Boolean(productId), //معناها ما يعمل request إذا الـ id فاضي لأي سبب
  });
}

// productId هون جاي من رابط صفحة التعديل، يعني من:
// /products/[id]/edit
// والـ page بتقرأ:
// const {id} = await params;
// وبعدين بتمرره:
// <ProductEditForm productId={id} />
// وجوا الفورم:
// useProduct(productId)
// وبالـ hook:
// queryFn: () => getProductById(productId),