import { useClient } from "@/hooks/useClient";
import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";

export function useFavorites(
  config?: UseQueryOptions<FavoriteChannel[], AxiosError>,
) {
  const client = useClient();

  return useQuery<FavoriteChannel[], AxiosError>(
    ["user", "favorites"],
    async () => (await client<FavoriteChannel[]>("/users/favorites")).data,
    config,
  );
}

interface FavoriteMutationPayload {
  op: "add" | "remove";
  channel_id: string;
}

export function useFavoriteMutation(
  config?: UseMutationOptions<
    FavoriteChannel[],
    AxiosError,
    FavoriteMutationPayload[]
  >,
) {
  const queryClient = useQueryClient();
  const client = useClient();

  return useMutation<FavoriteChannel[], AxiosError, FavoriteMutationPayload[]>(
    async (payload) =>
      (
        await client<FavoriteChannel[]>("/users/favorites", {
          method: "PATCH",
          data: payload,
        })
      ).data,
    {
      ...config,
      onSuccess: (res, ...args) => {
        queryClient.setQueryData(["user", "favorites"], res);
        if (config?.onSuccess) config?.onSuccess(res, ...args);
      },
    },
  );
}
