import type { SearchableCategory } from "./types";
import { JSON_SCHEMA } from "./types";

type QueryItem = {
  type: SearchableCategory;
  value: string;
  text: string;
  incomplete?: boolean;
};

export const FIRST_SEARCH: QueryItem[] = [
  { type: "search", incomplete: true, value: "", text: "?" },
  { type: "org", incomplete: true, value: "", text: "?" },
  { type: "vtuber", incomplete: true, value: "", text: "?" },
  { type: "topic", incomplete: true, value: "", text: "?" },
  { type: "type", incomplete: true, value: "", text: "?" },
  {
    type: "from",
    incomplete: true,
    value: "",
    text: "?",
  },
  {
    type: "to",
    incomplete: true,
    value: "",
    text: "?",
  },
  { type: "lang", incomplete: true, value: "", text: "?" },
  { type: "has_song", incomplete: true, value: "", text: "?" },
  { type: "description", incomplete: true, value: "", text: "?" },
  { type: "advanced", incomplete: true, value: "", text: "?" },
];

export const AUTOCOMPLETE_OPTIONS = {
  type: {
    choices: [],
  },
};

export function splitSearchClassTerms(
  term: string,
  langCategoryReversemapClass: Record<string, keyof typeof JSON_SCHEMA>
): [SearchableCategory | undefined, string] {
  const [q_class, ...q_value] = term.split(":");
  const trimmed_class = q_class.trim();
  const system_class =
    langCategoryReversemapClass[trimmed_class] || trimmed_class;
  if (JSON_SCHEMA[<SearchableCategory>system_class]) {
    // q_class is a valid class, ergo:
    return [
      <SearchableCategory>langCategoryReversemapClass[trimmed_class],
      q_value.join(":").trim(),
    ];
  } else {
    return [undefined, term.trim()];
  }
}
