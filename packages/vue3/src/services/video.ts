import { useLangStore } from "@/stores";
import { useSettingsStore } from "@/stores/settings";
import { useSiteStore } from "@/stores/site";
import backendApi, { axiosInstance_v2 } from "@/utils/backend-api";
import { MaybeRef, toReactive } from "@vueuse/core";
import dayjs, { isDayjs } from "dayjs";
import { Ref } from "vue";
import {
  useQuery,
  UseQueryOptions,
  useInfiniteQuery,
} from "@tanstack/vue-query";
import { useFavoritesIDSet } from "./favorites";

type QueryConfig<TReturn> = Omit<
  UseQueryOptions<TReturn, unknown, TReturn, any>,
  "queryKey" | "queryFn"
> & {
  enabled: MaybeRef<boolean>;
};
interface VideoApiQuery {
  status: string;
  type: string;
  include: string;
  lang: string;
  paginated: boolean;
  to: string | number;
  from: string | number;
  max_upcoming_hours: number;
  org: string;
  sort: string;
  order: string;
  channel_id: string;
  mentioned_channel_id: string;
}

export function useVideos(
  query: Ref<Partial<VideoApiQuery>>,
  config: QueryConfig<Video[]>
) {
  return useQuery(
    ["videos", query],
    async () => {
      const { data } = await axiosInstance_v2.get(
        `/videos?${stringifyQuery(query.value)}`
      );
      return data.filter(filterDeadStreams);
    },
    config
  );
}

// export function usePaginatedVideos(
//   query: Ref<Partial<VideoApiQuery> & { paginated: true }>,
//   config: QueryConfig<{ items: Video[]; total: number }>
// ) {
//   return useQuery<{ items: Video[]; total: number }>(
//     ["videos", query],
//     async () => {
//       const { data } = await axiosInstance.get(
//         `/videos?${stringifyQuery(query.value)}`
//       );
//       return data;
//     },
//     config
//   );
// }

// export function useVideosInfinite(
//   query: Ref<Partial<VideoApiQuery>>,
//   config: QueryConfig<Video[]>
// ) {
//   return useInfiniteQuery<Video[]>(
//     ["videos", query],
//     async ({ pageParam }) => {
//       const q = {
//         ...query.value,
//         offset: pageParam,
//       };
//       const { data } = await axiosInstance.get(`/videos?${stringifyQuery(q)}`);
//       return data.filter(filterDeadStreams);
//     },
//     {
//       getNextPageParam: (lastPage, pages) =>
//         pages.reduce((prev, curr) => prev + curr.length, 0),
//       enabled: config.enabled,
//       keepPreviousData: false,
//       refetchOnMount: false,
//     }
//   );
// }
interface VideoByIdApiQuery {
  lang: string; // which langs to pull for clips, comma separated string.
  c: string; // provide comments.
}
export function useVideoById(
  id: MaybeRef<string>,
  query: Ref<Partial<VideoByIdApiQuery>>,
  config: QueryConfig<Video>
) {
  return useQuery<ExtendedVideo>(
    ["video", id, query],
    async (e) => {
      const { data } = await axiosInstance_v2.get(
        `/videos/${unref(id)}?${stringifyQuery(query.value)}`
      );
      return data;
    },
    config
  );
}
// export function useVideosInfinite(
//   query: Ref<Partial<VideoApiQuery>>,
//   config: QueryConfig<Video[]>
// ) {
//   return useInfiniteQuery<Video[]>(
//     ["videos", query],
//     async () => {
//       const { data } = await axiosInstance.get(
//         `/videos?${stringifyQuery(query.value)}`
//       );
//       return data.filter(filterDeadStreams);
//     },
//     {
//       getNextPageParam: (lastPage, pages) =>
//         pages.reduce((a, c) => a + c.length, 0),
//       enabled: config.enabled,
//     }
//   );
// }

// export function useLive(
//   query: Ref<Partial<VideoApiQuery>>,
//   config: QueryConfig<Video[]>
// ) {
//   return useQuery<Video[]>(
//     ["live", query],
//     async () => {
//       const { data } = await axiosInstance.get(
//         `/live?${stringifyQuery(query.value)}`
//       );
//       return data.filter(filterDeadStreams);
//     },
//     config
//   );
// }

// export function useFavoritesLive(config: QueryConfig<Video[]>) {
//   // const {AxiosInstance, token} = useClient()
//   const site = useSiteStore();
//   const jwt = site.jwtToken;
//   const settings = useSettingsStore();
//   return useQuery<Video[]>(
//     ["favorites", settings.hidePlaceholder],
//     async () => {
//       return backendApi.favoritesLive(
//         { includePlaceholder: !settings.hidePlaceholder },
//         jwt
//       );
//     },
//     config
//   );
// }

function stringifyQuery(query: Record<string, any>) {
  return new URLSearchParams(query).toString();
}

function filterDeadStreams(video: Video) {
  return !(
    !video.start_actual &&
    video.start_scheduled &&
    dayjs().isAfter(dayjs(video.start_scheduled).add(2, "h"))
  );
}

export function useVideoListDatasource(
  q: Ref<VideoListLookup>,
  config: Ref<QueryConfig<{ items: Video[]; total?: number }>>
) {
  const langs = useLangStore();
  const settings = useSettingsStore();
  const site = useSiteStore();

  const urlTarget = computed(
    () =>
      q.value.flavor?.favorites
        ? q.value.type === "stream_schedule"
          ? "/users/live"
          : "/users/videos"
        : q.value.type === "stream_schedule"
        ? "/live" // stream schedule goes 'live'
        : "/videos" // all others go into /videos
  );

  // video probe:
  const query = computed(() => {
    // short circuit favorite/live config
    if (q.value.type === "stream_schedule" && q.value.flavor?.favorites) {
      return {
        includePlaceholder:
          q.value.showPlaceholderOverride ?? !settings.hidePlaceholder,
      };
    }

    const fq: Partial<VideoApiQuery> = {
      ...q.value.pagination,
      ...q.value.filter,
    };

    const baseConfig = {
      org: q.value.flavor.org,
      channel_id: q.value.flavor.channelId,
    };
    console.log(baseConfig);

    const overrideStatus = q.value.statuses?.join(",");
    const showPlaceholder =
      q.value.showPlaceholderOverride ?? !settings.hidePlaceholder;

    const configByType = {
      archive: {
        ...baseConfig,
        include: "clips,mentions",
        type: "stream",
        paginated: true,
        status: overrideStatus ?? "past,missing",
        max_upcoming_hours: 1,
      },
      clip: {
        ...baseConfig,
        type: "clip",
        include: "mentions",
        status: overrideStatus ?? "past",
        mentioned_channel_id: q.value.flavor.channelId,
        channel_id: undefined,
        lang: langs.clipLangsCSV,
        paginated: true,
      },
      stream_schedule: {
        ...baseConfig,
        include: "live_info,mentions",
        type: showPlaceholder ? "stream,placeholder" : "stream",
        status: overrideStatus,
      },
      videos: {
        ...baseConfig,
        include: "live_info,mentions",
        type: showPlaceholder ? "clip,stream,placeholder," : "clip,stream",
        status: overrideStatus,
        paginated: true,
      },
      collabs: {
        ...baseConfig,
        channel_id: undefined,
        org: undefined,
        mentioned_channel_id: q.value.flavor.channelId,
        type: showPlaceholder ? "stream,placeholder" : "stream",
        include: "clips,mentions",
        status: overrideStatus,
      },
    } as Record<TabType, Partial<VideoApiQuery>>;
    return {
      ...fq,
      ...(typeof q.value.type === "string"
        ? configByType[q.value.type]
        : {
            ...baseConfig,
            type: q.value.type.join(","),
            status: overrideStatus,
          }),
    };
  });

  const queryCfg = reactive({
    refetchInterval: computed(() =>
      q.value.type === "stream_schedule" ? 3 * 60 * 1000 : false
    ),
    // This behavior is really bad, sends a lot of requests if it errors
    // refetchOnWindowFocus: computed(() =>
    //   q.value.type === "stream_schedule" ? true : false
    // ),
    staleTime: computed(
      () =>
        q.value.type === "stream_schedule" ? 2.5 * 60 * 1000 : 5 * 60 * 1000 // only Live needs 2.5 min invalidation.
    ),
    enabled: computed(() => unref(config.value.enabled)),
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    keepPreviousData: computed(() => q.value.type !== "stream_schedule"),
  } satisfies UseQueryOptions);

  const response = useQuery<{ items: Video[]; total?: number }>({
    queryKey: [urlTarget, query, computed(() => site.jwtToken)],
    queryFn: async (h) => {
      const path = h.queryKey[0] as string;
      const query = h.queryKey[1] as any;
      const jwt = h.queryKey[2] as string;
      const out = { items: [] as Video[], total: undefined };
      // console.log("Querying", path, "?>>>", query, "auth", jwt.slice(0, 10));
      console.time("Query Time:" + path);
      if (q.value.flavor?.favorites && !jwt) return out;
      const { data } = await axiosInstance_v2.get(path, {
        params: query,
        headers:
          q.value.flavor?.favorites && jwt
            ? { Authorization: `BEARER ${jwt}` }
            : {},
      });
      if ("items" in data && "total" in data) {
        out.items = data.items;
        // out.items = q.value.type === "stream_schedule"
        //   ? data.items.filter(filterDeadStreams)
        //   : data.items;
        out.total = data.total;
      } else if (typeof data === "object") {
        out.items = data;
      }

      // out.items = out.items.sort(
      //   (a, b) =>
      //     dayjs(a.available_at).valueOf() - dayjs(b.available_at).valueOf()
      // );

      return out;
    },
    ...toRefs(queryCfg),
  });

  /* const newData: Ref<undefined> | Ref<{ items: Video[]; total?: number | undefined; }> =*/
  const resp = computed(() => {
    // this block is to satisfy various client side filters
    // console.log("recalc video response", response.isSuccess.value);
    if (response.data.value === undefined) return undefined;

    const mnew = {
      total: response.data.value.total,
      items: response.data.value.items,
    };

    // (response as any).data.value = videoResp;
    return mnew;
  });

  return { ...response, data: resp };
}
