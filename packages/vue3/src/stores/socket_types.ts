import { TLLanguageCode } from "@/utils/consts";

export interface TLDexMessage {
  /** timestamp of message being sent or created. */
  timestamp: number | string;
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
  type?: string;
  is_tl?: boolean;
  is_owner?: boolean;
  is_vtuber?: boolean;
  is_moderator?: boolean;
  is_verified?: boolean;

  // rendering consideration?
  key?: string;
  // ID is a Database Unique Key.
  id?: string;
}

export interface ParsedMessage extends TLDexMessage {
  /** parsed message if the message contains a link */
  parsed: string;
  key: string;

  is_current?: boolean;
  /**
   * optionally provided video ID
   */
  video_id?: string;
  // relativeMs?: number;
}

export type VideoUpdatePayload = Pick<
  Video,
  "live_viewers" | "status" | "start_actual"
> & { type: "update" };

export type TldexPayload = VideoUpdatePayload | TLDexMessage;

export type RoomIDString = `${string}/${TLLanguageCode}`;

export function roomToVideoID(room: RoomIDString): string {
  return room.split("/")[0];
}

export function roomToLang(room: RoomIDString): TLLanguageCode {
  return room.split("/")[1] as TLLanguageCode;
}

/**
 * Parses and augments message body with parsed value and key.
 * @param msg
 * @param relativeTsAnchor
 * @returns
 */
export function toParsedMessage(
  msg: TLDexMessage,
  video_id?: string
): ParsedMessage {
  msg.timestamp = +msg.timestamp;
  const parsed: ParsedMessage = {
    ...msg,
    // ...(relativeTsAnchor && { relativeMs: msg.timestamp - relativeTsAnchor }),
    key: msg.name + msg.timestamp + msg.message,
    parsed: "",
    duration: msg.duration ?? msg.message.length * 65 + 1800,
    video_id,
  };
  // Check if there's any emojis represented as URLs formatted by backend
  if (msg.message.includes("https://") && !("parsed" in msg)) {
    // match a :HUMU:https://<url>
    const regex =
      /(\S+)(https:\/\/(yt\d+\.ggpht\.com\/[a-zA-Z0-9_\-=/]+-c-k-nd|www\.youtube\.com\/[a-zA-Z0-9_\-=/]+\.svg))/gi;
    parsed.parsed = msg.message
      .replace(/<([^>]*)>/g, "($1)")
      .replace(regex, '<img src="$2" />');
  }
  return parsed;
}
