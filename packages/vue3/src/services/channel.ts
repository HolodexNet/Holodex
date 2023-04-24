import backendApi from "@/utils/backend-api";
import { Ref } from "vue";
import { useQuery, useInfiniteQuery } from "@tanstack/vue-query";
import { MaybeRef } from "@tanstack/vue-query/build/lib/types";
import { useSiteStore } from "@/stores";
import { useSettingsStore } from "@/stores/settings";
import { useFavoritesIDSet, useFavoritesPatcher } from "./favorites";

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
        if (!d || d.length < 100) return undefined;
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

/**
 * Unifies a bunch of logic to do with whether you've favorited or blocked a channel.
 * @param id
 */
export function useChannelFunctions(id: Ref<undefined | string>) {
  // const favList = useFavoritesIDSet();
  const favList = useFavoritesIDSet();

  const isFav = computed(() => !!id.value && favList.value?.has(id.value));
  const canFav = computed(() => !!useSiteStore().user);

  const settings = useSettingsStore();
  const isBlocked = computed(
    () => !!id.value && settings.blockedSet.has(id.value)
  );

  const favPatcher = useFavoritesPatcher();

  /**
   * Toggles the favorited status of the channel.
   * @param channelData provide a channel data optionally to avoid expensive Favorites Query refetch by 5s. If not provided, Favorites query will immediately refetch.
   */
  async function toggleFav(channelData?: ShortChannel) {
    return (
      !!id.value &&
      canFav.value &&
      favPatcher.mutateAsync([
        {
          op: isFav.value ? "remove" : "add",
          channel_id: id.value,
          channelTemp: channelData,
        },
      ])
    );
  }

  return { isFav, canFav, toggleFav, settings, isBlocked };
}
