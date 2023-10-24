import { useClient } from "@/hooks/useClient";
import {
  UseMutationOptions,
  UseQueryOptions,
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

// if you're curious: https://tanstack.com/query/latest/docs/react/typescript#typing-query-options
const favoriteQuery = queryOptions<FavoriteChannel[]>({
  queryKey: ["user", "favorites"],
});

export function useFavorites(config?: UseQueryOptions<FavoriteChannel[]>) {
  const client = useClient();

  return useQuery({
    queryKey: favoriteQuery.queryKey,
    queryFn: async () =>
      client.loggedIn
        ? await client<FavoriteChannel[]>("/api/v2/users/favorites")
        : [],

    ...config,
  });
}

interface FavoriteMutationPayload {
  op: "add" | "remove";
  channel_id: string;
}

export function useFavoriteMutation(
  config?: UseMutationOptions<
    FavoriteChannel[],
    Error,
    FavoriteMutationPayload[]
  >,
) {
  const queryClient = useQueryClient();
  const client = useClient();

  return useMutation({
    mutationFn: async (payload) =>
      await client.patch<FavoriteChannel[], FavoriteMutationPayload[]>(
        "/api/v2/users/favorites",
        payload,
      ),

    ...config,
    onSuccess: (res, ...args) => {
      queryClient.setQueryData(favoriteQuery.queryKey, res);
      if (config?.onSuccess) config?.onSuccess(res, ...args);
    },
  });
}
