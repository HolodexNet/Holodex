import { useQuery } from "@tanstack/react-query";
import { atom, useAtomValue } from "jotai";
import { splitAtom } from "jotai/utils";
import { useMemo, useState } from "react";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { useClient } from "@/hooks/useClient";
import { useOrgs } from "@/services/orgs.service";
import { CLIPPER_LANGS } from "@/lib/consts";
import { FIRST_SEARCH, splitSearchClassTerms } from "../helper";
import { JSON_SCHEMA, QueryItem, SearchableCategory } from "../types";

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

const STATIC_SUGGESTIONS: Record<string, QueryItem[]> = {
  has_song: ["none", "non-zero", "one", "many"].map((value) => ({
    type: "has_song",
    value,
    text: "$t",
  })),
  type: ["clip", "stream", "placeholder"].map((value) => ({
    type: "type",
    value,
    text: "$t",
  })),
  lang: CLIPPER_LANGS.map((x) => ({ ...x, type: "lang" })),
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

// Client Autocomplete Logic
function useClientSuggestions(
  searchCategory: SearchableCategory | undefined,
  searchString: string,
  t: TFunction<"translation", undefined>,
): QueryItem[] {
  const { data: orgs } = useOrgs({ enabled: !!searchString });

  return useMemo(() => {
    const suggestions: QueryItem[] = [];
    const searchLower = searchString.toLowerCase();

    // Handle organization suggestions
    if (
      searchCategory === "org" ||
      (searchCategory === undefined && searchString)
    ) {
      const orgSuggestions =
        orgs
          ?.filter(
            (org) =>
              !searchString ||
              org.name.toLowerCase().includes(searchLower) ||
              org.name_jp?.toLowerCase().includes(searchLower),
          )
          ?.slice(0, searchCategory === "org" ? 20 : 5)
          ?.map((org) => ({
            type: "org" as const,
            value: org.name,
            text: org.name,
          })) || [];

      suggestions.push(...orgSuggestions);
    }

    // Handle category-specific static suggestions that only show up when a category is specified
    if (searchCategory && STATIC_SUGGESTIONS[searchCategory]) {
      suggestions.push(...STATIC_SUGGESTIONS[searchCategory]);
    }

    // Handle general search when no category is specified
    if (searchCategory === undefined) {
      if (searchString) {
        suggestions.push({
          type: "search",
          value: searchString,
          text: searchString,
        });
      }

      // Add category suggestions
      const categoryAutofill = FIRST_SEARCH.filter(
        (x) =>
          !searchString ||
          t(`search.class.${x.type}`, x.type).startsWith(searchString),
      );
      suggestions.push(...categoryAutofill);
    }

    return suggestions;
  }, [orgs, searchCategory, searchString, t]);
}

// Main Hook
export function useSearchboxAutocomplete() {
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
    searchString,
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

  return {
    search,
    updateSearch,
    autocompleteQueryState: serverQueryState,
    autocomplete,
  };
}
