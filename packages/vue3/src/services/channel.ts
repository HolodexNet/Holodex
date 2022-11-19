import backendApi from "@/utils/backend-api";
import { Ref } from "vue";
import { useQuery, useInfiniteQuery } from "@tanstack/vue-query";
import { MaybeRef } from "@tanstack/vue-query/build/lib/types";

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

export function useChannel(
  id: Ref<undefined | string>,
  enabled: MaybeRef<boolean>
) {
  return useQuery(
    ["channel", id] as const,
    async (a) => {
      if (!a.queryKey[1]) return undefined;
      const res = await backendApi.channel(a.queryKey[1]);
      return res.data as FullChannel;
    },
    {
      enabled,
      staleTime: 2 * 60 * 60 * 1000, // 2 hours.
      cacheTime: 24 * 60 * 60 * 1000, // 24 hours.
      refetchOnMount: false,
      refetchInterval: false,
      refetchOnWindowFocus: false,
    }
  );
}
