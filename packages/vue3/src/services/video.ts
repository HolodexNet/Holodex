import { useLangStore } from "@/stores";
import { useSettingsStore } from "@/stores/settings";
import { useSiteStore } from "@/stores/site";
import backendApi, { axiosInstance } from "@/utils/backend-api";
import { MaybeRef } from "@vueuse/core";
import dayjs from "dayjs";
import { Ref } from "vue";
import { useQuery, UseQueryOptions, useInfiniteQuery } from "vue-query";

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
      const { data } = await axiosInstance.get(
        `/videos?${stringifyQuery(query.value)}`
      );
      return data.filter(filterDeadStreams);
    },
    config
  );
}

export function usePaginatedVideos(
  query: Ref<Partial<VideoApiQuery> & { paginated: true }>,
  config: QueryConfig<{ items: Video[]; total: number }>
) {
  return useQuery<{ items: Video[]; total: number }>(
    ["videos", query],
    async () => {
      const { data } = await axiosInstance.get(
        `/videos?${stringifyQuery(query.value)}`
      );
      return data;
    },
    config
  );
}

export function useVideosInfinite(
  query: Ref<Partial<VideoApiQuery>>,
  config: QueryConfig<Video[]>
) {
  return useInfiniteQuery<Video[]>(
    ["videos", query],
    async ({ pageParam }) => {
      const q = {
        ...query.value,
        offset: pageParam,
      };
      const { data } = await axiosInstance.get(`/videos?${stringifyQuery(q)}`);
      return data.filter(filterDeadStreams);
    },
    {
      getNextPageParam: (lastPage, pages) =>
        pages.reduce((prev, curr) => prev + curr.length, 0),
      enabled: config.enabled,
      keepPreviousData: false,
      refetchOnMount: false,
    }
  );
}
interface VideoByIdApiQuery {
  lang: string; // which langs to pull for clips, comma separated string.
  c: string; // provide comments.
}
export function useVideoById(
  id: MaybeRef<string>,
  query: Ref<Partial<VideoByIdApiQuery>>,
  config: QueryConfig<Video>
) {
  return useQuery<Video>(
    ["video", id, query],
    async (e) => {
      const { data } = await axiosInstance.get(
        `/videos/${id}?${stringifyQuery(query.value)}`
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

export function useLive(
  query: Ref<Partial<VideoApiQuery>>,
  config: QueryConfig<Video[]>
) {
  return useQuery<Video[]>(
    ["live", query],
    async () => {
      const { data } = await axiosInstance.get(
        `/live?${stringifyQuery(query.value)}`
      );
      return data.filter(filterDeadStreams);
    },
    config
  );
}

export function useFavoritesLive(config: QueryConfig<Video[]>) {
  // const {AxiosInstance, token} = useClient()
  const site = useSiteStore();
  const jwt = site.jwtToken;
  const settings = useSettingsStore();
  return useQuery<Video[]>(
    ["favorites", settings.hidePlaceholder],
    async () => {
      return backendApi.favoritesLive(
        { includePlaceholder: !settings.hidePlaceholder },
        jwt
      );
    },
    config
  );
}

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

/**
 * Type of Tab: clip is 'clips only', stream_schedule is all upcoming and live, archive is what it is, and videos just gets all videos.
 */
type TabType = "clip" | "stream_schedule" | "archive" | "videos";
interface OrgLookup {
  favorites: never;
  channelId: never;
  org: string;
}
interface FavLookup {
  favorites: boolean;
  channelId: never;
  org: never;
}
interface ChaLookup {
  favorites: never;
  channelId: string;
  org: never;
}

interface VideoListLookup<M extends TabType | VIDEO_TYPES[]> {
  flavor: OrgLookup | FavLookup | ChaLookup;
  // type & status for tab selection.
  // Usually selection has a tab between live and archives. Use this to control that aspect.
  type: M;
  // optional if using a TabType, if custom type, then must provide custom statuses.
  statuses: M extends TabType ? VIDEO_STATUSES[] | undefined : VIDEO_STATUSES[];

  // Overrides default behavior on showing placeholder or not.
  showPlaceholderOverride: boolean | undefined;

  // and regular pagination
  pagination?: {
    offset: number;
    pageSize: number;
  };

  // filtering options:
  filter?: {
    to?: number;
    from?: number;
  };
}

export function useVideoListDatasource<T extends TabType | VIDEO_TYPES[]>(
  q: Ref<VideoListLookup<T>>,
  config: QueryConfig<{ items: Video[]; total?: number }>
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

    const overrideStatus = q.value.statuses
      ? q.value.statuses.join(",")
      : undefined;

    switch (q.value.type) {
      case "archive":
        fq.type = "stream";
        fq.status = overrideStatus ?? "past,missing";
        fq.paginated = true;
        fq.org = q.value.flavor.org;
        fq.channel_id = q.value.flavor.channelId;
        break;

      case "clip":
        fq.type = "clip";
        fq.status = overrideStatus ?? "past";
        fq.paginated = true;
        fq.org = q.value.flavor.org;
        fq.mentioned_channel_id = q.value.flavor.channelId;
        fq.lang = langs.clipLangsCSV;
        break;

      case "stream_schedule":
        fq.type =
          q.value.showPlaceholderOverride ?? !settings.hidePlaceholder
            ? "stream,placeholder"
            : "stream";
        fq.org = q.value.flavor.org;
        if (overrideStatus) fq.status = overrideStatus;
        // if(q.value.flavor.org) { // the live api already has this, so no need to redefine it.
        //   fq.max_upcoming_hours = 48;
        // }
        fq.channel_id = q.value.flavor.channelId;
        break;

      case "videos":
        // all statuses is okay.
        fq.channel_id = q.value.flavor.channelId;
        fq.org = q.value.flavor.org;
        fq.status = overrideStatus;
        fq.type = "clip,stream";
        fq.paginated = true;
        break;

      default: // all other cases:
        fq.channel_id = q.value.flavor.channelId;
        fq.org = q.value.flavor.org;
        fq.type = q.value.type.join(",");
        fq.status = overrideStatus;
        break;
    }

    return fq;
  });

  return useQuery<{ items: Video[]; total?: number }>(
    [urlTarget, query, computed(() => site.jwtToken)],
    async (h) => {
      const path = h.queryKey[0] as string;
      const query = h.queryKey[1] as any;
      const jwt = h.queryKey[2] as string;
      console.log("Querying", path, "?>>>", query, "auth", jwt);
      const { data } = await axiosInstance.get(path, {
        params: query,
        headers: jwt ? { Authorization: `BEARER ${jwt}` } : {},
      });
      const out = { items: [], total: undefined };
      if ("items" in data && "total" in data) {
        out.items =
          q.value.type === "stream_schedule"
            ? data.items.filter(filterDeadStreams)
            : data.items;
        out.total = data.total;
      } else if (typeof data === "object") {
        out.items = data;
      }
      return out;
    },
    config
  );
}
