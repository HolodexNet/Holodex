export type SearchableCategory = keyof VideoQueryModel;

export const JSON_SCHEMA: Record<
  SearchableCategory,
  { type: "array" | "string" | "boolean" | "date"; required?: boolean }
> = {
  org: { type: "array" },
  from: { type: "date" }, //ms epoch or SerializedDate
  to: { type: "date" }, //ms epoch or SerializedDate
  // uploader_id: { type: "string" },
  search: { type: "string", required: true },
  description: { type: "string" },
  type: { type: "array" },
  topic: { type: "array" }, // OR'd.
  vtuber: { type: "array" }, //id of vtubers.
  lang: { type: "array" },
  has_song: { type: "string" },
  advanced: { type: "string" },
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
  has_song?: "one" | "none" | "many";
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
