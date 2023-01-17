export type SearchableCategory = keyof VideoQueryModel;

type Query = {
  type: string;
  value: string;
  text: string;
  first_search?: boolean;
  _raw?: any;
};

function uniqValidation(uniq: string) {
  return (query: Query[]) => {
    return !query.find((x) => x.type === uniq);
  };
}
function falseyValidation() {
  return false;
}

export const JSON_SCHEMA: Record<
  SearchableCategory,
  {
    type: "array" | "string" | "boolean" | "date";
    required?: boolean;
    validateCanAutocomplete?: (query: Query[]) => boolean;
  }
> = {
  org: { type: "array" },
  from: { type: "date", validateCanAutocomplete: falseyValidation }, //ms epoch or SerializedDate
  to: { type: "date", validateCanAutocomplete: falseyValidation }, //ms epoch or SerializedDate
  // uploader_id: { type: "string" },
  search: {
    type: "string",
    required: true,
    validateCanAutocomplete: uniqValidation("search"),
  },
  description: {
    type: "string",
    validateCanAutocomplete: uniqValidation("description"),
  },
  type: { type: "array" },
  topic: { type: "array" }, // OR'd.
  vtuber: { type: "array" }, //id of vtubers.
  lang: { type: "array" },
  has_song: {
    type: "string",
    validateCanAutocomplete: uniqValidation("has_song"),
  },
  advanced: {
    type: "string",
    validateCanAutocomplete: uniqValidation("advanced"),
  },
};
export interface VideoQueryModel {
  /**
   * Queries generally
   */
  org?: string[]; // AND'd
  from?: Date; //ms epoch or SerializedDate
  to?: Date; //ms epoch or SerializedDate
  // uploader_id?: string;
  search: string;
  description?: string;
  type?: string[];
  topic?: string[]; // OR'd.
  vtuber?: string[]; //id of vtubers.
  lang?: string[];
  has_song?: "one" | "none" | "many" | "non-zero";
  advanced?: string;
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
