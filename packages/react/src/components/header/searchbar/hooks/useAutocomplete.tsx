import { UseQueryResult, useQuery } from "@tanstack/react-query";
import { atom, useAtomValue } from "jotai";
import { splitAtom } from "jotai/utils";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useClient } from "@/hooks/useClient";
import { splitSearchClassTerms } from "../helper";
import { JSON_SCHEMA, QueryItem, SearchableCategory } from "../types";
import { useClientSuggestions } from "./useClientSuggestions";

interface ServerAutocompleteResponse {
  vtuber?: Array<{ id: string; name: string; english_name?: string }>;
  topic?: Array<{ id: string }>;
}

// Constants
const CATEGORY_PRIORITY: Record<SearchableCategory, number> = {
  org: 0,
  vtuber: 1,
  topic: 2,
  type: 3,
  lang: 4,
  from: 5,
  to: 6,
  search: 7,
  description: 8,
  has_song: 9,
};

// Atoms
export const queryAtom = atom<QueryItem[]>([]);
export const splitQueryAtom = splitAtom(queryAtom);

// Server Autocomplete Logic
function useServerSuggestions(
  searchCategory: SearchableCategory | undefined,
  searchString: string,
) {
  const client = useClient();

  return useQuery({
    queryKey: ["autocomplete", searchCategory, searchString] as const,
    queryFn: async ({
      queryKey: [_, searchCat, query],
    }): Promise<QueryItem[]> => {
      if (
        !searchCategory ||
        searchCategory === "topic" ||
        searchCategory === "vtuber"
      ) {
        const response = await client.get<ServerAutocompleteResponse>(
          `/api/v3/search/autocomplete`,
          {
            params: {
              q: query,
              ...(searchCat && { t: searchCat, n: 10 }),
            },
          },
        );

        const vtuberItems =
          response.vtuber?.map<QueryItem>((x) => ({
            type: "vtuber",
            value: x.id,
            text: x.name, // Note: Removed langPrefs handling for simplicity
            _raw: x,
          })) || [];

        const topicItems =
          response.topic?.map<QueryItem>((x) => ({
            type: "topic",
            value: x.id,
            text: x.id,
          })) || [];

        return [...vtuberItems, ...topicItems];
      }
      return [];
    },
    staleTime: 30000,
    enabled: !!searchString,
  });
}

// Main Hook
export interface UseSearchboxAutocompleteResult {
  search: string; // the current searchbox value
  updateSearch: (val: string) => void; // the setter on the search state
  autocompleteQueryState: Omit<UseQueryResult<QueryItem[], unknown>, "data">;
  autocomplete: QueryItem[]; // server-side autocomplete response
}

export function useSearchboxAutocomplete(): UseSearchboxAutocompleteResult {
  const { t } = useTranslation();
  const query = useAtomValue(queryAtom);
  const [search, updateSearch] = useState("");

  // Build category reverse map for translation
  const langCategoryReversemap = useMemo(() => {
    const map: Record<string, SearchableCategory> = {};
    for (const key in JSON_SCHEMA) {
      map[t(`search.class.${key}`)] = key as SearchableCategory;
    }
    return map;
  }, [t]);

  // Split search into category and search string
  const [searchCategory, searchString] = useMemo(
    () => splitSearchClassTerms(search, langCategoryReversemap),
    [search, langCategoryReversemap],
  );

  // Get suggestions from server and client
  const { data: serverSuggestions, ...serverQueryState } = useServerSuggestions(
    searchCategory,
    searchString,
  );
  const clientSuggestions = useClientSuggestions(
    searchCategory,
    searchString ?? "",
    t,
  );

  // Combine and sort suggestions
  const autocomplete = useMemo(() => {
    const allSuggestions = [...(serverSuggestions || []), ...clientSuggestions];

    return allSuggestions
      .sort((a, b) => {
        const aIndex = CATEGORY_PRIORITY[a.type];
        const bIndex = CATEGORY_PRIORITY[b.type];
        return aIndex - bIndex;
      })
      .map((suggestion) => {
        const validationResult =
          JSON_SCHEMA[suggestion.type].suggestionOK?.(query);

        if (validationResult === undefined || validationResult === "ok") {
          return suggestion;
        } else if (validationResult === "replace") {
          return { ...suggestion, replace: true };
        }
        return null;
      })
      .filter((x): x is QueryItem => x !== null);
  }, [serverSuggestions, clientSuggestions, query]);

  // console.log("autocomplete", autocomplete);
  return {
    search,
    updateSearch,
    autocompleteQueryState: serverQueryState,
    autocomplete,
  };
}
