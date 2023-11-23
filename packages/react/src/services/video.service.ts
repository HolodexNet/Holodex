import { useClient } from "@/hooks/useClient";
import { HTTPError } from "@/lib/fetch";
import {
  UseQueryOptions,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
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

interface UseVideoParams {
  id: string;
  lang?: string | string[];
  c?: "1" | "0";
}

export function useVideo<T = Video>(
  args: UseVideoParams,
  config?: Omit<UseQueryOptions<T, HTTPError>, "queryKey" | "queryFn">,
) {
  const { id, ...params } = args;
  const client = useClient();

  return useQuery<T, HTTPError>({
    queryKey: ["video", id],
    queryFn: async () => await client<T>(`/api/v2/videos/${id}`, { params }),
    ...config,
  });
}

export function usePlaceholderMutation() {
  const client = useClient();

  return useMutation<PlaceholderVideo[], Error, PlaceholderRequestBody>({
    mutationFn: async (body) => client.post("/api/v2/videos/placeholder", body),
  });
}

export function useVideoTopicMutation() {
  const client = useClient();

  return useMutation<
    unknown,
    HTTPError,
    {
      topicId: string;
      videoId: string;
    }
  >({
    mutationFn: async ({ topicId, videoId }) =>
      client.post("/api/v2/topics/video", { topicId, videoId }),
  });
}

export function useVideoMentionsMutation(videoId: string) {
  const queryClient = useQueryClient();
  const client = useClient();

  return useMutation<
    unknown,
    HTTPError,
    | { action: "add"; channelId: string; channelIds?: never }
    | { action: "del"; channelId?: never; channelIds: string[] }
  >({
    mutationFn: async ({ action, channelId, channelIds }) =>
      client(`/api/v2/videos/${videoId}/mentions`, {
        method: action === "add" ? "POST" : "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel_id: channelId,
          channel_ids: channelIds,
        }),
      }),
    onSuccess: async () => {
      const newMentions = await client.get<ChannelBase[]>(
        `/api/v2/videos/${videoId}/mentions`,
      );
      queryClient.setQueryData<Partial<Video>>(["video", videoId], (data) => ({
        ...data,
        mentions: newMentions,
      }));
    },
  });
}
