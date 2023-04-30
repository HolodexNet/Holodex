import { dayjs } from "@/utils/time";

export type SearchableCategory = keyof VideoQueryModel;

type QueryItem = {
  type: string;
  value: string;
  text: string;
  incomplete?: boolean;
  _raw?: any;
};

interface SearchableCategoryClassificationInterface {
  type: "array" | "string" | "boolean" | "date";
  required?: boolean;
  suggestionOK?: (current_query: QueryItem[]) => "replace" | "ok" | false;
  validation?: (item: QueryItem) => boolean;
  suggested_only?: boolean; //only autocompleted items can be autofilled.
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
  org: { type: "array", suggested_only: true },
  from: {
    type: "date",
    suggestionOK: suggest_if_query_doesnt_have("from"),
    suggested_only: true,
    validation: (item) => {
      return item.value.length > 3 && dayjs(item.value).isValid();
    },
  }, //ms epoch or SerializedDate
  to: {
    type: "date",
    suggestionOK: suggest_if_query_doesnt_have("to"),
    validation: (item) => {
      return item.value.length > 3 && dayjs(item.value).isValid();
    },
  }, //ms epoch or SerializedDate
  // uploader_id: { type: "string" },
  search: {
    type: "string",
    required: true,
    suggestionOK: suggest_if_query_doesnt_have("search"),
    validation: validation_nonzero,
  },
  description: {
    type: "string",
    suggestionOK: suggest_if_query_doesnt_have("description"),
    validation: validation_nonzero,
  },
  type: { type: "array", suggested_only: true },
  topic: { type: "array", suggested_only: true }, // OR'd.
  vtuber: { type: "array", suggested_only: true }, //id of vtubers.
  lang: { type: "array", suggested_only: true },
  has_song: {
    type: "string",
    suggestionOK: suggest_if_query_doesnt_have("has_song"),
    suggested_only: true,
  },
  // advanced: {
  //   type: "string",
  //   suggestionOK: suggest_if_query_doesnt_have("advanced"),
  //   validation: validation_nonzero,
  // },
};
export interface VideoQueryModel {
  /**
   * Queries generally
   */
  org?: string[]; // AND'd
  from?: Date | string; //ms epoch or SerializedDate
  to?: Date | string; //ms epoch or SerializedDate
  // uploader_id?: string;
  search: string;
  description?: string;
  type?: string[];
  topic?: string[]; // OR'd.
  vtuber?: string[]; //id of vtubers.
  lang?: string[];
  has_song?: "one" | "none" | "many" | "non-zero";
  // advanced?: string;
}

export interface VideoQueryContainer {
  tags?: string[];
  query?: VideoQueryModel;
  facet?: string[];
  pagination: {
    sort: "latest" | "oldest" | "score" | "longest" | "shortest" | "views";
    // pit?: string; // point-in-time Elastic object
    search_after?: any[]; // [value, shard_doc]
    // offset: number;
    size: number;
  };
}

export interface WhitelistCategory {
  category: SearchableCategory;
}

export interface WhitelistOption extends WhitelistCategory {
  category: SearchableCategory;
  key: string;
  text?: string; // text to render for the UI
  _raw?: any; // loaded in from remote object
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
