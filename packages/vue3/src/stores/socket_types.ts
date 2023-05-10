export interface TLDexMessage {
  /** timestamp of message being sent or created. */
  timestamp: number | string;
  /** a more accurate timestamp of seconds into video (may be not available) */
  videoOffset: number;
  /** message content */
  message: string;
  name: string; // name of creator
  channel_id?: string;
  // breakpoint?: boolean; // breakpoints are used to add styling separation
  // receivedAt?: number;
  // I don't know why ReceivedAt was even in the definition in the first place, b/c nothing in the API or Holodex v2 codebase WRITEs it.

  /** duration of the translation */
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
}

export interface ParsedMessage extends TLDexMessage {
  parsed: string; // parsed output after parseMessage
  key: string;
  // relativeMs?: number;
}

export type VideoUpdatePayload = Pick<
  Video,
  "live_viewers" | "status" | "start_actual"
> & { type: "update" };

export type TldexPayload = VideoUpdatePayload | TLDexMessage;

/**
 * Parses and augments message body with parsed value and key.
 * @param msg
 * @param relativeTsAnchor
 * @returns
 */
export function toParsedMessage(msg: TLDexMessage): ParsedMessage {
  msg.timestamp = +msg.timestamp;
  const parsed: ParsedMessage = {
    ...msg,
    // ...(relativeTsAnchor && { relativeMs: msg.timestamp - relativeTsAnchor }),
    key: msg.name + msg.timestamp + msg.message,
    parsed: "",
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
