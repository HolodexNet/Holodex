import type { SearchableCategory } from "./types";
import { JSON_SCHEMA } from "./types";

type Query = {
  type: string;
  value: string;
  text: string;
  first_search?: boolean;
};

export const FIRST_SEARCH: Query[] = [
  { type: "search", first_search: true, value: "?", text: "?" },
  { type: "org", first_search: true, value: "?", text: "?" },
  { type: "vtuber", first_search: true, value: "?", text: "?" },
  { type: "topic", first_search: true, value: "?", text: "?" },
  { type: "type", first_search: true, value: "?", text: "?" },
  {
    type: "from",
    first_search: true,
    value: "?",
    text: "YYYY-MM-DD HH:MM:SS +00",
  },
  {
    type: "to",
    first_search: true,
    value: "?",
    text: "YYYY-MM-DD HH:MM:SS +00",
  },
  { type: "lang", first_search: true, value: "?", text: "?" },
  { type: "has_song", first_search: true, value: "?", text: "?" },
  { type: "description", first_search: true, value: "?", text: "?" },
  { type: "advanced", first_search: true, value: "?", text: "?" },
];

export const AUTOCOMPLETE_OPTIONS = {
  type: {
    choices: [],
  },
};

export function splitSearchClassTerms(
  term: string
): [SearchableCategory | undefined, string] {
  const [q_class, ...q_value] = term.split(":");
  const trimmed_class = q_class.trim();
  if (JSON_SCHEMA[<SearchableCategory>trimmed_class]) {
    // q_class is a valid class, ergo:
    return [<SearchableCategory>trimmed_class, q_value.join(":").trim()];
  } else {
    return [undefined, term.trim()];
  }
}
