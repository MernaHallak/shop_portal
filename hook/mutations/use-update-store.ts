import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { updateStore } from "@/api/store";

import type { UpdateStoreRequest } from "@/types/store";
import { queryKeys } from "@/api/query-keys";

export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      updateData: UpdateStoreRequest,
    ) => updateStore(updateData),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.store,
      });
    },
  });
}