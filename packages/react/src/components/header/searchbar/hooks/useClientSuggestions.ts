import { useMemo } from "react";
import type { TFunction } from "i18next";
import { useOrgs } from "@/services/orgs.service";
import { FIRST_SEARCH } from "../helper";
import { QueryItem, SearchableCategory } from "../types";
import { CLIPPER_LANGS } from "@/lib/consts";

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

// Client Autocomplete Logic
export function useClientSuggestions(
  searchCategory: SearchableCategory | undefined,
  searchString: string,
  t: TFunction<"translation", undefined>,
): QueryItem[] {
  console.log(
    "client suggestions",
    "searchCategory",
    searchCategory,
    "searchString",
    searchString,
  );
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
    else if (searchCategory && STATIC_SUGGESTIONS[searchCategory]) {
      suggestions.push(...STATIC_SUGGESTIONS[searchCategory]);
    } else if (searchCategory) {
      suggestions.push({
        type: searchCategory,
        value: searchString,
        text: searchString,
      });
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
          t(`search.class.${x.type}`, { defaultValue: x.type }).startsWith(
            searchString,
          ),
      );
      suggestions.push(...categoryAutofill);
    }

    return suggestions;
  }, [orgs, searchCategory, searchString, t]);
}
