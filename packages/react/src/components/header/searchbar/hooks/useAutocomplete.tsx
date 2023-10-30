import { atom, useAtomValue } from "jotai";
import { splitAtom } from "jotai/utils";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { splitSearchClassTerms } from "../helper";
import { JSON_SCHEMA, QueryItem } from "../types";
import { useClientAutocomplete } from "./useClientAutocomplete";
import { useServerAutocomplete } from "./useServerAutocomplete";

export const queryAtom = atom([] as QueryItem[]);

export const splitQueryAtom = splitAtom(queryAtom);

export function useAutocomplete() {
  const { t } = useTranslation();

  const query = useAtomValue(queryAtom);
  // query: (what's in the search bar) <-- this is an atom.

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

  // server autocomplete: (async response fetched from serverside autocomplete depending on search)
  const { data: serverAC, ...queryState } = useServerAutocomplete(
    searchCategory,
    searchString,
  );

  const clientAC = useClientAutocomplete(searchCategory, searchString, t);

  // client autocomplete: (sync response from client autocomplete depending on search and inverted_lang_index)
  const autocomplete = useMemo(() => {
    const out = { ...serverAC, ...clientAC };

    // order them by category:
    const categoryOrder: Array<keyof typeof out> = [
      "org",
      "vtuber",
      "topic",
      "type",
      "lang",
      "from",
      "to",
      "search",
      "description",
      "has_song",
      "other",
    ];

    console.log(out);

    const autocompleteList = categoryOrder
      .flatMap((x) => out[x])
      .map((x) => {
        if (!x) return null;
        const ok = JSON_SCHEMA[x.type].suggestionOK?.(query);
        if (ok === undefined || ok == "ok") return x;
        else if (ok == "replace") return { ...x, replace: true };
        else if (ok === false) return null;
      })
      .filter((x): x is QueryItem => !!x);

    return autocompleteList;
  }, [clientAC, query, serverAC]);
  // autocomplete_items: (merged autocomplete options, but grouped by category, also depending on query to remove selected items from dropdown)

  return { search, updateSearch, queryState, autocomplete };
}
