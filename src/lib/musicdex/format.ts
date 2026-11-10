import { ALL_VTUBERS } from "../consts.ts"
import { getT } from "../i18n"
import type { Playlist, PlaylistStub } from "./types"

/**
 * Musicdex generated playlist IDs carry their display context in the ID and description.
 * Labels come from getT(), so callers must subscribe with useT() to re-render on language change.
 */
export function formatMusicPlaylist(
  playlist: PlaylistStub | Playlist,
  preferEnglish = true
) {
  const { t } = getT()
  const [type, raw = ""] = playlist.id.split(/[[\]]/)
  const params = new URLSearchParams(raw.replace(/,/g, "&"))
  let data: {
    channel?: { name?: string; english_name?: string }
    title?: string
  } = {}
  const description =
    "description" in playlist ? playlist.description : undefined
  if (description && playlist.id.startsWith(":")) {
    try {
      data = JSON.parse(description)
    } catch {
      /* ordinary description */
    }
  }
  const name =
    (preferEnglish && data.channel?.english_name) || data.channel?.name
  // Discovery spells the all-organizations scope with an underscore.
  const org = params.get("org")?.replace(/^All_Vtubers$/, ALL_VTUBERS) || ""
  let title = playlist.title
  switch (type) {
    case ":artist":
      title = name || title || t("musicdex.format.title.artistRadio")
      break
    case ":hot":
      title = t("musicdex.format.title.trending")
      break
    case ":dailyrandom":
      title = name
        ? t("musicdex.format.title.dailyMixFor", { name })
        : title || t("musicdex.format.title.dailyMix")
      break
    case ":weekly":
      title = org
        ? t("musicdex.format.title.orgWeeklyMix", { org })
        : title || t("musicdex.format.title.weeklyMix")
      break
    case ":userweekly":
      title = t("musicdex.format.title.myWeeklyMix")
      break
    case ":history":
      title = t("musicdex.format.title.history")
      break
    case ":latest":
      title = org
        ? t("musicdex.format.title.orgLatest", { org })
        : title || t("musicdex.format.title.latest")
      break
    case ":mv":
      title = org
        ? params.get("sort") === "random"
          ? t("musicdex.format.title.orgBestOf", { org })
          : t("musicdex.format.title.orgRecentCovers", { org })
        : title || t("musicdex.format.title.coversAndOriginals")
      break
    case ":video":
      title = data.title || title || t("musicdex.format.title.singingStream")
      break
  }
  const radio =
    playlist.type?.startsWith("radio") || type === ":artist" || type === ":hot"
  const channel =
    playlist.art_context?.channels?.[0] ||
    ("content" in playlist ? playlist.content?.[0]?.channel_id : undefined)
  const video =
    (type === ":video" ? params.get("id") : undefined) ||
    playlist.art_context?.videos?.[0]
  const image =
    channel &&
    type !== ":video" &&
    (!video || (playlist.art_context?.channels?.length ?? 0) < 3)
      ? `/statics/channelImg/${encodeURIComponent(channel)}/200.png`
      : video
        ? `https://i.ytimg.com/vi/${encodeURIComponent(video)}/hqdefault.jpg`
        : undefined
  return {
    title: title || t("musicdex.format.title.untitled"),
    image,
    radio,
    kind: radio
      ? t("musicdex.format.kind.artistRadio")
      : type === ":video"
        ? t("musicdex.format.kind.singingSession")
        : type === ":dailyrandom"
          ? t("musicdex.format.kind.dailyMix")
          : type === ":weekly" || type === ":userweekly"
            ? t("musicdex.format.kind.weeklyMix")
            : type === ":mv"
              ? t("musicdex.format.kind.coversAndOriginals")
              : type === ":latest"
                ? t("musicdex.format.kind.newDiscoveries")
                : playlist.type === "ugp"
                  ? t("musicdex.format.kind.community")
                  : t("musicdex.format.kind.musicdexMix"),
    coverLabel:
      type === ":dailyrandom"
        ? t("musicdex.format.cover.dailyMix")
        : type === ":weekly" || type === ":userweekly"
          ? t("musicdex.format.cover.weeklyMix")
          : undefined,
    bestOf:
      type === ":mv" && org && params.get("sort") === "random"
        ? org
        : undefined,
    description: playlist.id.startsWith(":")
      ? radio
        ? title
          ? t("musicdex.format.description.radio", { title })
          : t("musicdex.format.description.radioFallback")
        : type === ":video"
          ? t("musicdex.format.description.video")
          : t("musicdex.format.description.mix")
      : description,
    href: `/music/${radio ? "radio" : "playlist"}/${encodeURIComponent(playlist.id)}`,
  }
}
