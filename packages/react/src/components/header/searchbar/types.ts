import dayjs from "dayjs";

export type SearchableCategory = keyof VideoQueryModel;

export type QueryItem = {
  type: SearchableCategory;
  value: string;
  text: string;
  incomplete?: boolean;
  _raw?: unknown;
};

/**
 * It specifies the type of the category (array, string, boolean, or date), whether it is required, whether suggestions are allowed for the category, a validation function, and whether only autocomplete suggestions can be autofilled.
 */
interface SearchableCategoryClassificationInterface {
  type: "array" | "string" | "boolean" | "date";
  required?: boolean;
  suggestionOK?: (current_query: QueryItem[]) => "replace" | "ok" | false;
  validation?: (item: QueryItem, rest: QueryItem[]) => boolean;
  onlyAutocompleteSuggestions?: boolean; //only autocompleted items can be autofilled.
}

// suggest is OK if the query doesn't have the class
function suggest_if_query_doesnt_have(uniq_class: string) {
  return (current_query: QueryItem[]) => {
    return current_query.find((x) => x.type === uniq_class) ? "replace" : "ok";
  };
}

function validation_nonzero(item: QueryItem) {
  return (item.value || "").trim().length > 0;
}

export const JSON_SCHEMA: Record<
  SearchableCategory,
  SearchableCategoryClassificationInterface
> = {
  org: { type: "array", onlyAutocompleteSuggestions: true },
  from: {
    type: "date",
    suggestionOK: suggest_if_query_doesnt_have("from"),
    onlyAutocompleteSuggestions: true,
    validation: (item, rest) => {
      const from = dayjs(item.value);
      const to = rest.find((x) => x.type === "to")?.value;
      const beforeToExists = from ? dayjs(from).isBefore(to) : true;

      return item.value.length > 3 && from.isValid() && beforeToExists;
    },
  }, //ms epoch or SerializedDate
  to: {
    type: "date",
    onlyAutocompleteSuggestions: true,
    suggestionOK: suggest_if_query_doesnt_have("to"),
    validation: (item, rest) => {
      const to = dayjs(item.value);
      const from = rest.find((x) => x.type === "from")?.value;
      const beforeToExists = from ? dayjs(from).isBefore(to) : true;
      return item.value.length > 3 && to.isValid() && beforeToExists;
    },
  }, //ms epoch or SerializedDate
  // uploader_id: { type: "string" },
  search: {
    type: "string",
    suggestionOK: suggest_if_query_doesnt_have("search"),
    validation: validation_nonzero,
  },
  description: {
    type: "string",
    suggestionOK: suggest_if_query_doesnt_have("description"),
    validation: validation_nonzero,
  },
  type: { type: "array", onlyAutocompleteSuggestions: true },
  topic: { type: "array", onlyAutocompleteSuggestions: true }, // OR'd.
  vtuber: { type: "array", onlyAutocompleteSuggestions: true }, //id of vtubers.
  lang: { type: "array", onlyAutocompleteSuggestions: true },
  has_song: {
    type: "string",
    suggestionOK: suggest_if_query_doesnt_have("has_song"),
    onlyAutocompleteSuggestions: true,
  },
  // advanced: {
  //   type: "string",
  //   suggestionOK: suggest_if_query_doesnt_have("advanced"),
  //   validation: validation_nonzero,
  // },
};
export type VideoQueryModel = {
  /**
   * Queries generally
   */
  org?: string[]; // AND'd
  from?: string; //ms epoch or SerializedDate
  to?: string; //ms epoch or SerializedDate
  // uploader_id?: string;
  search?: string;
  description?: string;
  type?: string[];
  topic?: string[]; // OR'd.
  vtuber?: string[]; //id of vtubers.
  lang?: string[];
  has_song?: "one" | "none" | "many" | "non-zero";
  // advanced?: string;
};

export interface VideoQueryContainer {
  tags?: string[];
  query?: VideoQueryModel;
  facet?: string[];
  pagination: {
    sort: (typeof SORT_OPTIONS)[number];
    // pit?: string; // point-in-time Elastic object
    search_after?: unknown[]; // [value, shard_doc]
    // offset: number;
    size: number;
  };
}

export const SORT_OPTIONS = [
  "score",
  "latest",
  "oldest",
  "longest",
  "shortest",
  "views",
] as const;

export interface WhitelistCategory {
  category: SearchableCategory;
}

export interface WhitelistOption extends WhitelistCategory {
  category: SearchableCategory;
  key: string;
  text?: string; // text to render for the UI
  _raw?: unknown; // loaded in from remote object
  loading: boolean;
}

export interface AC_Vtuber {
  id: string;
  english_name: string;
  name: string;
  org: string;
}

export interface AC_Topic {
  id: string;
}

export interface AC_Response {
  vtuber?: AC_Vtuber[];
  topic?: AC_Topic[];
}
