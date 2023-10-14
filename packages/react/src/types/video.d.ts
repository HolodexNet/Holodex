type VideoCardSize = "sm" | "md" | "lg";

type VideoType = 'placeholder' | 'stream' | 'clip'
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

interface VideoBase {
  id: string;
  channel_id: string;
  title: string;
  description: string;
  type:  VideoType;
  topic_id: string | null;
  published_at: string | null;
  available_at: string;
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