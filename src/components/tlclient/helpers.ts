import { TL_LANGS } from "@/lib/consts"
import { POSTABLE_LANGS } from "@/lib/tlclient/lines"
import type { ChatRelay, ResolvedSource, TlRoom } from "@/lib/tlclient/session"
import { channelName } from "@/lib/video"

/** Somewhere a line can go: a TLdex room, or a chat typed into by Holodex+. */
export type Destination =
  | { kind: "room"; key: string; room: TlRoom; label: string; main: boolean }
  | {
      kind: "chat"
      key: string
      relay: ChatRelay
      label: string
      main: boolean
      /** TLdex listens to this chat itself, and matches copies by time. */
      indexed: boolean
    }

/** A short name for a stream: its channel, or whatever was entered. */
export function sourceLabel(source: ResolvedSource, preferEnglish: boolean) {
  if (source.video) return channelName(source.video.channel, preferEnglish)
  if (source.chat?.provider === "twitch") return source.chat.channel
  return source.raw.replace(/^https?:\/\/(www\.)?/, "")
}

/** Languages TLdex accepts posts in, named as the viewer's own list names them. */
export function postableLangOptions() {
  return POSTABLE_LANGS.map((value) => ({
    value,
    label:
      TL_LANGS.find((lang) => lang.value === value)?.text ??
      value.toUpperCase(),
  }))
}
