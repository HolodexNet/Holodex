type Query = {
  type: string;
  value: string;
  text: string;
  first_search?: boolean;
};

export const FIRST_SEARCH: Query[] = [
  "org",
  "from",
  "to",
  "search",
  "description",
  "type",
  "topic",
  "vtuber",
  "lang",
  "has_song",
  "advanced",
].map((x) => ({
  type: x,
  first_search: true,
  value: "?",
  text: "?",
}));
