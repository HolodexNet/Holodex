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
