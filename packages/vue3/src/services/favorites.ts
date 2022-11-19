import { queryClient } from "@/setup/setupQueryPlugin";
import { useSiteStore } from "@/stores";
import backendApi from "@/utils/backend-api";
import { useMutation, useQuery } from "@tanstack/vue-query";
import debounce from "lodash-es/debounce";
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
    console.log("computed fav list as set");
    const ids = list.data?.value?.map((x) => x.id);
    return ids !== undefined ? new Set(ids) : undefined;
  });
  return computedList;
}

const _debounced_invalidateFavorites = debounce(() => {
  console.log("evicting queries");
  queryClient.invalidateQueries(["favorites"]);
}, 5000);

export function useFavoritesPatcher() {
  const user = useSiteStore();

  return useMutation(
    (
      operations: {
        op: "add" | "remove";
        channel_id: string;
        channelTemp?: ShortChannel;
      }[]
    ) => {
      return backendApi.patchFavorites(user.jwtToken, operations);
    },
    {
      onSettled: (data, error, variables, context) => {
        console.log(data, error, variables, context);
        const canOptimize = variables.every(
          (v) => v.op === "remove" || v.channelTemp
        );
        if (canOptimize) {
          queryClient.setQueriesData(["favorites"], (currentFaves) => {
            // console.log(currentFaves);
            const newFaves = [
              ...(currentFaves as FullChannel[]),
            ] as FullChannel[];
            variables.map((x) => {
              if (x.op === "add") {
                // add temp to list
                newFaves.push({ ...x.channelTemp } as FullChannel);
              } else {
                newFaves.splice(
                  // delete 1
                  newFaves.findIndex((o) => o.id === x.channel_id),
                  1
                );
              }
            });
            // console.log(newFaves);
            return newFaves;
          });
          _debounced_invalidateFavorites();
        } else {
          queryClient.invalidateQueries(["favorites"]);
        }
      },
    }
  );
}
