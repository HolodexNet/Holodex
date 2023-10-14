import { useClient } from "@/hooks/useClient";
import {
  UseInfiniteQueryOptions,
  UseQueryOptions,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import { AxiosError } from "axios";

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
  config?: UseInfiniteQueryOptions<Channel[], AxiosError>,
) {
  const client = useClient();

  return useInfiniteQuery<Channel[], AxiosError>({
    queryKey: ["channels", params],
    queryFn: async ({ pageParam = 0 }) =>
      (
        await client<Channel[]>("/channels", {
          params: { ...params, offset: pageParam },
        })
      ).data,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length ? allPages.flat().length : undefined,
    ...config,
  });
}

export function useChannel(
  channelId: string,
  config?: UseQueryOptions<Channel, AxiosError>,
) {
  const client = useClient();

  return useQuery<Channel, AxiosError>(
    ["channel", channelId],
    async () => (await client<Channel>(`/channels/${channelId}`)).data,
    config,
  );
}
