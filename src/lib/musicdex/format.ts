import type { Playlist, PlaylistStub } from "./types"

/** Musicdex generated playlist IDs carry their display context in the ID and description. */
export function formatMusicPlaylist(
  playlist: PlaylistStub | Playlist,
  preferEnglish = true
) {
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
  const org = params.get("org") || ""
  let title = playlist.title
  switch (type) {
    case ":artist":
      title = name || title || "Artist radio"
      break
    case ":hot":
      title = "Trending songs"
      break
    case ":dailyrandom":
      title = name ? `Daily Mix: ${name}` : title || "Daily Mix"
      break
    case ":weekly":
      title = org ? `${org} Weekly Mix` : title || "Weekly Mix"
      break
    case ":userweekly":
      title = "My Weekly Mix"
      break
    case ":history":
      title = "Recently played"
      break
    case ":latest":
      title = org ? `Catch up on ${org}` : title || "Latest songs"
      break
    case ":mv":
      title = org
        ? params.get("sort") === "random"
          ? `Best of ${org}`
          : `Recent ${org} covers & originals`
        : title || "Covers & originals"
      break
    case ":video":
      title = data.title || title || "Singing stream"
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
    title: title || "Untitled playlist",
    image,
    radio,
    kind: radio
      ? "Artist radio"
      : type === ":video"
        ? "Singing session"
        : type === ":dailyrandom"
          ? "Daily mix"
          : type === ":weekly" || type === ":userweekly"
            ? "Weekly mix"
            : type === ":mv"
              ? "Covers & originals"
              : type === ":latest"
                ? "New discoveries"
                : playlist.type === "ugp"
                  ? "Community playlist"
                  : "Musicdex mix",
    coverLabel:
      type === ":dailyrandom"
        ? "DAILY MIX"
        : type === ":weekly" || type === ":userweekly"
          ? "WEEKLY MIX"
          : undefined,
    description: playlist.id.startsWith(":")
      ? radio
        ? `A station built around ${title || "the music you love"}.`
        : type === ":video"
          ? "The songs, in the order they happened."
          : "Covers, originals, and performances worth coming back to."
      : description,
    href: `/music/${radio ? "radio" : "playlist"}/${encodeURIComponent(playlist.id)}`,
  }
}
