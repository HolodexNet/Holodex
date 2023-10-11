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
  twitter: string | null;
  video_count: string | null;
  subscriber_count: string | null;
  view_count: string | null;
  cilp_count: string | null;
  lang: string | null;
  published_at: string;
  inactive: boolean;
}
