import { axiosInstance } from "@/utils/backend-api";
import dayjs from "dayjs";
import { useQuery } from "vue-query";

interface VideoApiQuery {
  status: string;
  type: VIDEO_TYPES;
  include: string;
  lang: string;
  paginated: boolean;
  to: string;
  max_upcoming_hours: number;
  org: string;
  sort: string;
  order: string;
}
export function useVideos(query: Partial<VideoApiQuery>) {
  return useQuery<Video[]>(["videos", query], async (e) => {
    const { data } = await axiosInstance.get(
      `/videos?${stringifyQuery(query)}`
    );
    return data.filter(filterDeadStreams);
  });
}

export function useLive(query: Partial<VideoApiQuery>) {
  return useQuery<Video[]>(["videos", query], async () => {
    const { data } = await axiosInstance.get(`/live?${stringifyQuery(query)}`);
    return data.filter(filterDeadStreams);
  });
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
