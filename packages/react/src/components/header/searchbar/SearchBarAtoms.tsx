import { atom } from "jotai";
import { QueryItem, SearchableCategory } from "./types";
import { atomWithReset } from "jotai/utils";
import { useTranslation } from "react-i18next";

const searchAutocompleteOptions = atomWithReset({
  vtuber: [],
  topic: [],
  org: [],
  has_song: [],
  type: [],
  lang: [],
  from: [],
  to: [],
  search: [],
  description: [],
} as Record<SearchableCategory, QueryItem[]>);

// const query = atomWithReset([] as QueryItem[]);

// const useAutocomplete(query: string) {
//     const { t } = useTranslation();

// }
