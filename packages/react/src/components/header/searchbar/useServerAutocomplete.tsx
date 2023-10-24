import { AC_Response, QueryItem, VideoQueryModel } from "./types";
import { useQuery } from "@tanstack/react-query";
import { useClient } from "@/hooks/useClient";

/**
 * Executes a server-side autocomplete search based on the provided search category and search string.
 *
 * @param {keyof VideoQueryModel | undefined} searchCategory - The category of the search, which can be one of the keys in VideoQueryModel or undefined.
 * @param {string} searchString - The string to search for.
 * @return The result of the autocomplete search.
 */
export function useServerAutocomplete(
  searchCategory: keyof VideoQueryModel | undefined,
  searchString: string,
) {
  const client = useClient();
  return useQuery({
    queryKey: ["autocomplete", searchCategory, searchString] as const,
    queryFn: async ({
      queryKey: [_, searchCat, query],
    }): Promise<Record<"vtuber" | "topic", QueryItem[]>> => {
      if (
        !searchCategory ||
        searchCategory == "topic" ||
        searchCategory == "vtuber"
      ) {
        const acr = await client.get<AC_Response>(
          `/api/v3/search/autocomplete`,
          {
            params: {
              q: query,
              ...(searchCat && { t: searchCat }),
              ...(searchCat && { n: 10 }),
            },
          },
        );

        return {
          vtuber:
            acr.vtuber?.map((x) => ({
              type: "vtuber",
              value: x.id,
              text: /*langPrefs.preferredLocaleFn(x.english_name, x.name) || */ x.name,
              _raw: x,
            })) || [],
          topic:
            acr.topic?.map((x) => ({
              type: "topic",
              value: x.id,
              text: x.id,
            })) || [],
        };
      }
      return {
        vtuber: [],
        topic: [],
      };
    },
    staleTime: 30000,
  });
}
