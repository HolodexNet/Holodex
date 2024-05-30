import { useClient } from "@/hooks/useClient";
import { HTTPError } from "@/lib/fetch";
import {
  UseQueryOptions,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";

interface UseChannelsParams {
  limit?: number;
  offset?: number;
  sort?: string;
  order?: "asc" | "desc";
  type?: ChannelType;
  org?: string;
  suborg?: string;
  lang?: string;
}

interface UseChannelVideosParams {
  lang?: string[];
  include?: VideoIncludeParam[];
  limit?: number;
  offset?: number;
}

export function useChannels(
  params: UseChannelsParams,
  // config: infer
) {
  const client = useClient();

  return useInfiniteQuery({
    queryKey: ["channels", params],
    queryFn: async ({ pageParam }) =>
      await client<Channel[]>("/api/v2/channels", {
        params: { ...params, offset: pageParam },
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage?.length === 0) {
        return undefined;
      }
      return lastPageParam + lastPage.length;
    },
    getPreviousPageParam: (_firstPage, _allPages, firstPageParam) => {
      if (!firstPageParam) {
        return undefined;
      }
      return firstPageParam - _firstPage.length;
    },
    // ...config,
  });
}

export function useChannel(
  channelId: string,
  config?: Omit<UseQueryOptions<Channel, HTTPError>, "queryFn" | "queryKey">,
) {
  const client = useClient();

  return useQuery({
    queryKey: ["channel", channelId],
    queryFn: async () => await client<Channel>(`/api/v2/channels/${channelId}`),
    ...config,
  });
}

export function useChannelVideos(
  channelId: string,
  type: "videos" | "collabs" | "clips",
  params?: UseChannelVideosParams,
) {
  const client = useClient();

  return useInfiniteQuery<VideoBase[], HTTPError>({
    queryKey: ["channel", channelId, "videos"],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) =>
      await client(`/api/v2/channels/${channelId}/${type}`, {
        params: { ...params, pagenated: true, offset: pageParam },
      }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length ? allPages.flat().length : undefined,
  });
}
