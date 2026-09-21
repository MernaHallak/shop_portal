import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { hideProduct } from "@/api/products";
import { queryKeys } from "@/api/query-keys";

export function useHideProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) =>
      hideProduct(productId),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.storeProducts,
      });
    },
  });
}