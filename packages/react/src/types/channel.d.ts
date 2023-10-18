type ChannelType = "vtuber" | "subber";

interface ChannelBase {
  id: string;
  name: string;
  english_name: string | null;
  type: ChannelType;
  photo: string | null;
}

interface Channel extends ChannelBase {
  description: string;
  org: string | null;
  suborg: string | null;
  banner: string | null;
  thumbnail: string | null;
  twitter: string | null;
  twitch: string | null;
  video_count: string | null;
  subscriber_count: string | null;
  view_count: string | null;
  clip_count: string | null;
  lang: string | null;
  published_at: string;
  inactive: boolean;
  yt_uploads_id: string | null;
  top_topics: string[] | null;
  yt_handle: string[] | null;
  yt_name_history: string[] | null;
  group: string | null;
}

type FavoriteChannel = Pick<
  Channel,
  | "clip_count"
  | "english_name"
  | "group"
  | "id"
  | "inactive"
  | "name"
  | "org"
  | "photo"
  | "subscriber_count"
  | "twitter"
  | "type"
  | "video_count"
>;


enum CHANNEL_TYPES {
  VTUBER = "vtuber",
  SUBBER = "subber",
}

interface ShortChannel extends ChannelBase {
  id: string;
  name: string;
  type: CHANNEL_TYPES;
  english_name?: string;
  org?: string;
  group?: string; //group is likely not existent.
  lang?: string; // lang is sometimes missing.
  photo?: string;
}

type PrivacyStatus = "public" | "private";