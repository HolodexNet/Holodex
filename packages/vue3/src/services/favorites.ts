import { queryClient } from "@/setup/setupQueryPlugin";
import { useSiteStore } from "@/stores";
import backendApi from "@/utils/backend-api";
import { useMutation, useQuery } from "vue-query";

export function useFavoritesList() {
  const user = useSiteStore();
  return useQuery(
    ["favorites", user.jwtToken],
    async () => {
      if (!user.jwtToken) throw new Error("User is not logged in");
      return await (
        await backendApi.favorites(user.jwtToken)
      ).data;
    },
    {
      enabled: true,
      staleTime: 8 * 60 * 60 * 1000, // 8 hours.
      cacheTime: 24 * 60 * 60 * 1000, // 1 day.
    }
  );
}

export function useFavoritesListByID() {
  const list = useFavoritesList();
  const computedList = computed(() => {
    const ids = list.data?.value?.map((x) => x.id);
    return ids !== undefined ? new Set(ids) : undefined;
  });
  return computedList;
}

export function useFavoritesPatcher() {
  const user = useSiteStore();

  return useMutation(
    (operations: { op: "add" | "remove"; channel_id: string }[]) => {
      return backendApi.patchFavorites(user.jwtToken, operations);
    },
    {
      onSettled: (data, error, variables, context) => {
        console.log(data, error, variables, context);
        queryClient.invalidateQueries(["favorites"]);
        // Error or success... doesn't matter!
      },
    }
  );
}
