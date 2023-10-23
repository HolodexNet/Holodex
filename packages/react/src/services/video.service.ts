import { useClient } from "@/hooks/useClient";
import {
  UseInfiniteQueryOptions,
  UseQueryOptions,
  useInfiniteQuery,
  useMutation,
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
  config?: UseInfiniteQueryOptions<VideoBase[], AxiosError>,
) {
  const client = useClient();

  return useInfiniteQuery<VideoBase[], AxiosError>({
    queryKey: ["videos", params],
    queryFn: async ({ pageParam = 0 }) =>
      (
        await client<{ items: VideoBase[]; total: string }>("/videos", {
          params: { ...params, pagenated: true, offset: pageParam },
        })
      ).items,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length ? allPages.flat().length : undefined,
    ...config,
  });
}

export function useVideo<T = Video>(
  videoId: string,
  config?: UseQueryOptions<T, AxiosError>,
) {
  const client = useClient();

  return useQuery<T, AxiosError>(
    ["video", videoId],
    async () => await client<T>(`/videos/${videoId}`),
    config,
  );
}

export function usePlaceholderMutation() {
  const client = useClient();

  return useMutation<PlaceholderVideo[], Error, PlaceholderRequestBody>({
    mutationFn: async (body) => client.post("/api/v2/videos/placeholder", body),
  });
}
