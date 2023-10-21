import { useClient } from "@/hooks/useClient";
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

export function useChannels(
  params: UseChannelsParams,
  // config: infer
) {
  const client = useClient();

  return useInfiniteQuery({
    queryKey: ["channels", params],
    queryFn: async ({ pageParam = 0 }) =>
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

      const prevPageParam =
        firstPageParam - _allPages[_allPages.length - 1].length;

      return prevPageParam >= 0 ? prevPageParam : 0;
    },
    // ...config,
  });
}

export function useChannel(
  channelId: string,
  config?: UseQueryOptions<Channel, Error>,
) {
  const client = useClient();

  return useQuery({
    queryKey: ["channel", channelId],
    queryFn: async () => await client<Channel>(`/api/v2/channels/${channelId}`),
    ...config,
  });
}
