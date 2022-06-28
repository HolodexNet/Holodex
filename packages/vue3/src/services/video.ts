import { axiosInstance } from "@/utils/backend-api";
import { MaybeRef } from "@vueuse/core";
import dayjs from "dayjs";
import { Ref } from "vue";
import { useQuery, UseQueryOptions } from "vue-query";

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
  return useQuery<Video[]>(
    ["videos", query],
    async (e) => {
      const { data } = await axiosInstance.get(
        `/videos?${stringifyQuery(query.value)}`
      );
      return data.filter(filterDeadStreams);
    },
    config
  );
}

interface VideoByIdApiQuery {
  lang: string; // which langs to pull for clips, comma separated string.
  c: string; // provide comments.
}
export function useVideoById(
  id: string,
  query: Ref<Partial<VideoByIdApiQuery>>,
  config: QueryConfig<Video[]>
) {
  return useQuery<Video[]>(
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
