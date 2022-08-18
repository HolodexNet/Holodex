import backendApi from "@/utils/backend-api";
import { Ref } from "vue";
import { useInfiniteQuery } from "vue-query";
import { MaybeRef } from "vue-query/lib/vue/types";

export function useChannels(query: Ref<object>, enabled: MaybeRef<boolean>) {
  return useInfiniteQuery(
    ["channels", query] as const,
    async (a) => {
      const res = await backendApi.channels({
        ...a.pageParam,
        ...a.queryKey[1],
        limit: 100,
      });
      return res.data;
    },
    {
      enabled,
      getNextPageParam(d, dh) {
        if (d.length < 100) return undefined;
        return { offset: dh.length * 100, limit: 100 };
      },
    }
  );
}
