type ChannelType = "vtuber" | "subber";

interface ChannelBase {
  id: string;
  name: string;
  english_name?: string;
  type: ChannelType;
  photo?: string;
}

interface Channel extends ChannelBase {
  description: string;
  org?: string;
  suborg?: string;
  banner?: string;
  thumbnail?: string;
  twitter?: string;
  twitch?: string;
  video_count?: string;
  subscriber_count?: string;
  view_count?: string;
  clip_count?: string;
  lang?: string;
  published_at: string;
  inactive: boolean;
  yt_uploads_id?: string;
  top_topics?: string[];
  yt_handle?: string[];
  yt_name_history?: string[];
  group?: string;
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

interface ShortChannel extends ChannelBase {
  id: string;
  name: string;
  type: ChannelType;
  english_name?: string;
  org?: string;
  group?: string; //group is likely not existent.
  lang?: string; // lang is sometimes missing.
  photo?: string;
}

type PrivacyStatus = "public" | "private";
