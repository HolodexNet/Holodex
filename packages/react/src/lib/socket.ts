import { TLLanguageCode } from "./consts";

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
  video_id?: string,
): ParsedMessage {
  msg.timestamp = +msg.timestamp;
  const parsed: ParsedMessage = {
    ...msg,
    // ...(relativeTsAnchor && { relativeMs: msg.timestamp - relativeTsAnchor }),
    timestamp: +msg.timestamp,
    key: msg.name + msg.timestamp + msg.message,
    parsed: "",
    duration: +(msg.duration ?? msg.message.length * 65 + 1800),
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
