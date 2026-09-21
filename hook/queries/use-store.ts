import { useQuery } from "@tanstack/react-query";

import { getStore } from "@/api/store";
import { queryKeys } from "@/api/query-keys";

export function useStore() {
  return useQuery({
    queryKey: queryKeys.store,
    queryFn: getStore,
  });
}