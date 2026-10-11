export interface Channel {
  id: string;
  name: string;
  english_name?: string | null;
  photo?: string | null;
  org?: string | null;
  suborg?: string | null;
  lang?: string | null;
  subscriber_count?: string | number;
  inactive?: boolean;
}
export interface Video {
  id: string;
  title?: string | null;
  channel: Channel;
  type: "stream" | "clip" | "placeholder" | "legacy-placeholder";
  status: "live" | "upcoming" | "past" | "new" | "missing";
  platform?: string;
  topic_id?: string | null;
  lang?: string | null;
  duration?: number;
  available_at?: string | number | null;
  start_scheduled?: string | number | null;
  start_actual?: string | number | null;
  live_viewers?: number | string;
  description?: string;
  thumbnail?: string;
  link?: string;
  mentions?: Channel[];
}
export interface VideoPage {
  items: Video[];
  approximateTotal?: number;
  nextPage?: string;
}
export interface SearchResponse {
  timed_out?: boolean;
  hits: {
    total: { value: number; relation: string } | number;
    hits: { _id: string; _source: Video; sort?: unknown[] }[];
  };
}
export interface Suggestion {
  id?: string;
  value?: string;
  name?: string;
  english_name?: string;
  text?: string;
}
export interface Autocomplete {
  vtuber?: Suggestion[];
  topic?: Suggestion[];
}
export interface Organization {
  name: string;
  short?: string;
  icon?: string | null;
}
