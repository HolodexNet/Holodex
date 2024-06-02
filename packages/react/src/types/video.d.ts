type VideoCardSize = "xs" | "sm" | "md" | "lg" | "list";

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
  type: VideoType;
  title: string;
  status: VideoStatus;
  channel: ShortChannel;
  available_at?: Date | number | string;
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
  available_at?: Date | number | string;
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
  clips?: Clip[];
  same_source_clips?: Clip[];
  sources?: Clip[];
  refers?: Clip[];
  simulcasts?: Clip[];
  mentions?: ChannelBase[];
  comments?: CommentBase[];
  recommendations?: VideoBase[];
  live_tl_count?: {
    [key: string]: number;
  };
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

enum PLACEHOLDER_TYPES {
  YT_STREAM = "scheduled-yt-stream",
  EXTERNAL_STREAM = "external-stream",
  EVENT = "event",
}

enum PLACEHOLDER_CERTAINTY {
  CERTAIN = "certain",
  LIKELY = "likely",
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
  certainty: PLACEHOLDER_CERTAINTY;
  credits: {
    discord?: PlaceholderCredit;
    datasource?: PlaceholderCredit;
    bot?: PlaceholderCredit;
    editor?: PlaceholderCredit;
  };
}

interface PlaceholderRequestBody {
  id?: string; // for placeholder modification request
  channel_id: string;
  duration: number;
  liveTime: string;
  title: PlaceholderTitlePayload;
}

interface PlaceholderVideo extends PlaceholderTitlePayload, Video {}
