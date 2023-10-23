import { useClient } from "@/hooks/useClient";
import {
  UseInfiniteQueryOptions,
  UseQueryOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from "@tanstack/react-query";

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
  config?: CommonQueryConfig,
) {
  const client = useClient();

  return useInfiniteQuery({
    queryKey: ["videos", params],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) =>
      (
        await client<{ items: VideoBase[]; total: string }>("/api/v2/videos", {
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
  config?: UseQueryOptions<T>,
) {
  const client = useClient();

  return useQuery<T>({
    queryKey: ["video", videoId],
    queryFn: async () => await client<T>(`/api/v2/videos/${videoId}`),
    ...config,
  });
}

export function usePlaceholderMutation() {
  const client = useClient();

  return useMutation<PlaceholderVideo[], Error, PlaceholderRequestBody>({
    mutationFn: async (body) => client.post("/api/v2/videos/placeholder", body),
  });
}
