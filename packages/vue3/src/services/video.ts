import { axiosInstance } from "@/utils/backend-api";
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
  to: string;
  max_upcoming_hours: number;
  org: string;
  sort: string;
  order: string;
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
