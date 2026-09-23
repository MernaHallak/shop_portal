import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { deleteProductImage } from "@/api/products";
import { queryKeys } from "@/api/query-keys";

interface DeleteProductImageVariables {
  productId: string;
  publicId: string;
}

export function useDeleteProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      publicId,
    }: DeleteProductImageVariables) =>
      deleteProductImage(productId, {
        public_id: publicId,
      }),

    //القيم اللي بتمريها لـ mutateAsync(...) هي نفسها الـ variables؛ React Query بتمررها أولًا لـ mutationFn، وإذا نجحت العملية بتمرر نفس variables لـ onSuccess كـ parameter ثاني.
    onSuccess: async (_, variables) => {
      await Promise.all([ //Promise.all([...]) معناها: شغّل العمليتين مع بعض واستنى الاثنين يخلصوا. يعني عم نحدّث بنفس الوقت بدل ما نعملهم واحد ورا الثاني
        // Promise.all بيشغّلهم بالتوازي، فبيكون أسرع شوي. 
        // تحديث صفحة المنتج، وتحديث قائمة المنتجات حتى إذا كانت الصورة المحذوفة هي الصورة الرئيسية.
        queryClient.invalidateQueries({
          queryKey: queryKeys.product(
            variables.productId,
          ),
        }),

        queryClient.invalidateQueries({
          queryKey: queryKeys.storeProducts(),
        }),
      ]);
    },
  });
}