interface TLDexMessage extends ChatMessage {
  /** timestamp of message being sent or created. */
  timestamp: number;
  /** a more accurate timestamp of seconds into video (may be not available) */
  video_offset: number;
  /** message content */
  message: string;
  name: string; // name of creator
  channel_id?: string;
  // breakpoint?: boolean; // breakpoints are used to add styling separation
  // receivedAt?: number;
  // I don't know why ReceivedAt was even in the definition in the first place, b/c nothing in the API or Holodex v2 codebase WRITEs it.

  /** duration of the translation (in milliseconds) */
  duration?: number;

  // TL Dex Live Message items:
  // type?: string;
  is_tl?: boolean;
  is_owner?: boolean;
  is_vtuber?: boolean;
  is_moderator?: boolean;
  is_verified?: boolean;

  // ID is a Database Unique Key. Provided only when authoring in script editor
  id?: string;
}

interface ParsedMessage extends TLDexMessage {
  // Parsing converts timestamp to number.
  timestamp: number;
  /** parsed message if the message contains a link */
  parsed: string;
  key: string;

  // the end time of the subtitle
  end?: number;

  is_current?: boolean;
  /**
   * optionally provided video ID
   */
  video_id?: string;
  // relativeMs?: number;
}

interface ParsedScripterMessage extends ParsedMessage {
  id: string;
  end: number;
}

interface ChatMessage {
  name: string;
  channel_id?: string;
  timestamp: number;
  message: string;
  is_tl?: boolean;
  is_owner?: boolean;
  is_moderator?: boolean;
  is_verified?: boolean;
  is_vtuber?: boolean;
  // usually present for holodex videos
  video_offset: number;
  duration?: number;
}

type VideoUpdatePayload = Pick<
  Video,
  "live_viewers" | "status" | "start_actual"
> & { type: "update" };

type TldexPayload = VideoUpdatePayload | TLDexMessage;

type RoomIDString = `${string}/${import("../lib/consts").TLLanguageCode}`;
