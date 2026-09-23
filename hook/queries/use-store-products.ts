import { useQuery } from "@tanstack/react-query";
import { getStoreProducts } from "@/api/products";
import {queryKeys} from "@/api/query-keys";
import {normalizeApiError} from "@/lib/api-error";
import { StoreProductsParams } from "@/types/product";

export function useStoreProducts( params?: StoreProductsParams,) {
  return useQuery({
     queryKey: queryKeys.storeProducts(params),
    queryFn: () => getStoreProducts(params),
    // ما حددت ال staleTime لان محددتا من وقت انشاء ال new QueryClient
    retry: (failureCount, error) => { //بيحدد هل يعيد الطلب بعد الفشل أو لا
      const status = normalizeApiError(error).status; //إذا كان status === 401 يعني المستخدم غير مسجّل دخول أو التوكن منتهي، لا تعيد الطلب
      return status !== 401 && failureCount < 2; //أما إذا الخطأ غير 401، جرّب تعيد الطلب بشرط عدد المحاولات الفاشلة أقل من 2
    },
  });
}
