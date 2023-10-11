import { useClient } from "@/hooks/useClient";
import {
  UseInfiniteQueryOptions,
  UseQueryOptions,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { AxiosError } from "axios";

interface UseVideosParams {
  channel_id?: string;
  status?: VideoStatus[];
  lang?: string[];
  type?: VideoType[];
  topic?: string;
  include?: VideoIncludeParam[];
  org?: string;
  mentioned_channel_id?: string;
  sort?: string;
  order?: "asc" | "desc";
  limit?: number; // less than 50
  offset?: number;
  paginated?: boolean;
  max_upcoming_hours?: number;
  id?: string;
  from?: string; // ISO8601 Date String for minimum available_at
  to?: string; // ISO8601 Date String for maximum available_at
}

export function useVideos(
  params?: Omit<UseVideosParams, "offset">,
  config?: UseInfiniteQueryOptions<Video[], AxiosError>,
) {
  const client = useClient();

  return useInfiniteQuery<Video[], AxiosError>({
    queryKey: ["videos", params],
    queryFn: async ({ pageParam = 0 }) =>
      (
        await client<{ items: Video[]; total: string }>("/videos", {
          params: { ...params, pagenated: true, offset: pageParam },
        })
      ).data.items,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length ? allPages.flat().length : undefined,
    ...config,
  });
}

export function useVideo(
  videoId: string,
  config?: UseQueryOptions<Video, AxiosError>,
) {
  const client = useClient();

  return useQuery<Video, AxiosError>(
    ["video", videoId],
    async () => (await client<Video>(`/videos/${videoId}`)).data,
    config,
  );
}
