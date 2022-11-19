import { STATIC_QUERY_OPTIONS } from "@/setup/setupQueryPlugin";
import backendApi from "@/utils/backend-api";
import { useQuery, UseQueryOptions } from "@tanstack/vue-query";
import { MaybeRef } from "@tanstack/vue-query/build/lib/types";

type QueryConfig<TReturn> = Omit<
  UseQueryOptions<TReturn, unknown, TReturn, any>,
  "queryKey" | "queryFn"
> & {
  enabled: MaybeRef<boolean>;
};

export function useOrgList(config: QueryConfig<Org[]>) {
  return useQuery<Org[]>(
    ["orgs"],
    async () => {
      return backendApi.orgs();
    },
    { ...(STATIC_QUERY_OPTIONS as any), ...config }
  );
}
