import { atom } from "jotai";
import {
  JSON_SCHEMA,
  QueryItem,
  SearchableCategory,
  VideoQueryModel,
} from "./types";
import { atomWithDefault, atomWithReset, splitAtom } from "jotai/utils";
import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { splitSearchClassTerms } from "./helper";

// const searchAutocompleteOptions = atomWithReset({
//   vtuber: [],
//   topic: [],
//   org: [],
//   has_song: [],
//   type: [],
//   lang: [],
//   from: [],
//   to: [],
//   search: [],
//   description: [],
// } as Record<SearchableCategory, QueryItem[]>);

const queryAtom = atom([] as QueryItem[]);
const splitQueryAtom = splitAtom(queryAtom);
// how the fuck do you work with this ^ lmao

// const query = atomWithReset([] as QueryItem[]);

// const useAutocomplete(query: string) {
//     const { t } = useTranslation();

// }

function useServerAutocomplete(
  searchCategory: keyof VideoQueryModel | undefined,
  searchString: string,
) {
  return useQuery({
    queryKey: ["autocomplete", searchCategory, searchString],
    queryFn: async (
      ctx,
    ): Promise<Record<"vtuber" | "topic" | "org", QueryItem[]>> => {
      if (
        !searchCategory ||
        searchCategory == "org" ||
        searchCategory == "topic" ||
        searchCategory == "vtuber"
      ) {
        return {
          vtuber: [],
          topic: [],
          org: [],
        };
      } else {
        return {
          vtuber: [],
          topic: [],
          org: [],
        };
      }
    },
    staleTime: 30000,
  });
}

export function useAutocomplete() {
  const { t } = useTranslation();

  // query: (what's in the search bar)
  // search: (the content typed into the input bar)
  const [search, updateSearch] = useState("");

  const langCategoryReversemapClass = useMemo(() => {
    const out = {} as Record<string, keyof typeof JSON_SCHEMA>;
    let x: keyof typeof JSON_SCHEMA;
    for (x in JSON_SCHEMA) {
      out[t("search.class." + x)] = x;
    }
    return out;
  }, [t]);

  // [lang, Eng...]
  const [searchCategory, searchString] = useMemo(
    () => splitSearchClassTerms(search, langCategoryReversemapClass),
    [search, langCategoryReversemapClass],
  );

  // server_autocomplete: (async response fetched from serverside autocomplete depending on search)
  // client_autocomplete: (sync response from client autocomplete depending on search and inverted_lang_index)

  // autocomplete_items: (merged autocomplete options, but grouped by category, also depending on query to remove selected items from dropdown)

  return { search, updateSearch };
}
