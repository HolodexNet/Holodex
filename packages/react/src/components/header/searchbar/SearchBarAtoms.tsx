import { atom } from "jotai";
import { QueryItem, SearchableCategory } from "./types";
import { atomWithDefault, atomWithReset, splitAtom } from "jotai/utils";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

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

// const query = atomWithReset([] as QueryItem[]);

// const useAutocomplete(query: string) {
//     const { t } = useTranslation();

// }

function useServerAutocomplete(search: string) {
  const out = useQuery({
    queryKey: ["autocomplete", search],
    queryFn: async (
      ctx,
    ): Promise<Record<"vtuber" | "topic" | "org", QueryItem[]>> => {
      return {
        vtuber: [],
        topic: [],
        org: [],
      };
    },
  });
}

export function useAutocomplete() {
  // query: (what's in the search bar)
  // search: (the content typed into the input bar)
  const [search, updateSearch] = useState("");
  // inverted_lang_index: useMemo(, [t, constants])

  // server_autocomplete: (async response fetched from serverside autocomplete depending on search)
  // client_autocomplete: (sync response from client autocomplete depending on search and inverted_lang_index)

  // autocomplete_items: (merged autocomplete options, but grouped by category, also depending on query to remove selected items from dropdown)

  return { search, updateSearch };
}
