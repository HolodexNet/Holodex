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

interface UseVideosV3Params {
  limit?: number;
  // offset?: number; <-- no longer using offset.
  sort?: keyof VideoBase;
  order?: "desc" | "asc";
  nextPage?: string;
  status?: VideoStatus[] | string;
  type?: VideoType[] | string;
  id?: string;
  lang?: string[];
  include?: string | Array<string>;
  analyzed?: boolean;
  channel_id?: string;
  topic?: string | string[];
  mentioned_channel_id?: string;
  max_upcoming_hours?: number;
  from?: string | Date;
  to?: string | Date;
  org?: string;
}

function arrayToCommaSeparatedString(arr: string[] | string | undefined) {
  return Array.isArray(arr) ? arr.join(",") : arr;
}

function removeUndefinedProps<T extends object>(obj: T): Partial<T> {
  for (const prop in obj) {
    if (
      Object.prototype.hasOwnProperty.call(obj, prop) &&
      obj[prop] === undefined
    ) {
      delete obj[prop];
    }
  }
  return obj;
}
export function useVideosV3(
  params?: Omit<UseVideosV3Params, "nextPage">,
  config?: CommonQueryConfig,
) {
  const client = useClient();

  return useInfiniteQuery({
    queryKey: ["v3videos", params],
    initialPageParam: undefined as undefined | string,
    queryFn: async ({ pageParam }) =>
      await client<{
        items: VideoBase[];
        approximateTotal: number;
        nextPage?: string;
      }>("/api/v3/videos", {
        params: removeUndefinedProps({
          ...params,
          status: arrayToCommaSeparatedString(params?.status),
          type: arrayToCommaSeparatedString(params?.type),
          lang: arrayToCommaSeparatedString(params?.lang),
          include: arrayToCommaSeparatedString(params?.include),
          nextPage: pageParam,
        }),
      }),
    getNextPageParam: (lastPage, _) => lastPage.nextPage,
    ...config,
  });
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