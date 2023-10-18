type VideoCardSize = "sm" | "md" | "lg";

type VideoType = "placeholder" | "stream" | "clip";
type VideoStatus = "new" | "upcoming" | "live" | "past" | "missing";
type VideoIncludeParam =
  | "clips"
  | "refers"
  | "sources"
  | "simulcasts"
  | "mentions"
  | "description"
  | "live_info"
  | "channel_stats"
  | "songs";

interface VideoRef {
  id: string;
  lang?: string;
  type: VIDEO_TYPES;
  title: string;
  status: VIDEO_STATUSES;
  channel: ShortChannel;
  available_at?: Date | number;
  duration?: number;
}

interface VideoBase extends VideoRef {
  id: string;
  channel_id: string;
  title: string;
  description: string;
  type: VideoType;
  topic_id: string | null;
  published_at: string | null;
  available_at?: string;
  duration: number;
  status: VideoStatus;
  start_scheduled: string | null;
  start_actual: string | null;
  end_actual: string | null;
  live_viewers: number | null;
  songcount: number;
}

interface Video extends VideoBase {
  songs: number;
  clips: Clip[];
  sources: Clip[];
  refers: Clip[];
  simulcasts: Clip[];
  mentions: ChannelBase[];
  comments: CommentBase[];
  recommendations: VideoBase[];
}

enum VIDEO_TYPES {
  CLIP = "clip",
  STREAM = "stream",
  PLACEHOLDER = "placeholder",
}
enum RELATIONSHIP_TYPES {
  REFER = "refer",
  SIMULCAST = "simulcast",
  CLIP = "clip",
}
enum USER_ROLES {
  ADMIN = "admin",
  EDITOR = "editor",
  USER = "user",
}
enum CHAT_SOURCES {
  YOUTUBE = "youtube",
  MCHAD = "MChad",
  USER = "user",
}
enum VIDEO_STATUSES {
  NEW = "new",
  LIVE = "live",
  UPCOMING = "upcoming",
  PAST = "past",
  MISSING = "missing",
}

enum PLACEHOLDER_TYPES {
  YT_STREAM = "scheduled-yt-stream",
  EXTERNAL_STREAM = "external-stream",
  EVENT = "event",
}

interface PlaceholderCredit {
  //Removed Temporarily img?: string;
  link?: string; // for discord this is the invite code.
  name?: string; // for discord this is the guild ID
  user?: string;
}

interface PlaceholderTitlePayload {
  name: string;
  jp_name: string;
  link: string;
  thumbnail: string;
  placeholderType: PLACEHOLDER_TYPES;
  certainty: "certain" | "likely";
  credits: {
    discord?: PlaceholderCredit;
    datasource?: PlaceholderCredit;
    bot?: PlaceholderCredit;
    editor?: PlaceholderCredit;
  };
}

interface PlaceholderVideo extends Union<PlaceholderTitlePayload, Video> {}
