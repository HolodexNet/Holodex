import { useMemo } from "react"

import { ALL_VTUBERS } from "@/lib/consts"
import { isPlayableInMultiview } from "@/lib/multiview/stream"
import { useFavorites, useFavoritesLive, useOrgLive } from "@/lib/queries"
import type { Org } from "@/lib/types"
import { createVideoFilter } from "@/lib/video"
import { useAuth } from "@/stores/auth"
import { useOrgStore } from "@/stores/org"
import { useSettings } from "@/stores/settings"

export type VideoSourceChoice =
  | { kind: "favorites" }
  | { kind: "org"; org: Org }
  | { kind: "playlist" }
  | { kind: "url"; provider: "youtube" | "twitch" }

/** Starts on favorites when there are any to show, as the old picker did. */
export function useDefaultSource(): VideoSourceChoice {
  const loggedIn = useAuth((s) => !!s.jwt)
  const org = useOrgStore((s) => s.currentOrg)
  return loggedIn ? { kind: "favorites" } : { kind: "org", org }
}

/** Live and upcoming streams from a source, after the viewer's feed filters. */
export function useSourceVideos(source: VideoSourceChoice, enabled = true) {
  const settings = useSettings()
  const { favorites } = useFavorites()
  const orgName = source.kind === "org" ? source.org.name : ""
  const orgLive = useOrgLive(orgName, enabled && source.kind === "org")
  const favoritesLive = useFavoritesLive(enabled && source.kind === "favorites")
  const query = source.kind === "favorites" ? favoritesLive : orgLive

  const filter = useMemo(
    () =>
      createVideoFilter({
        settings,
        favoriteIds: new Set(favorites.map((channel) => channel.id)),
        org: source.kind === "org" ? orgName : null,
        hideCollabs:
          settings.hideCollabStreams &&
          (source.kind === "favorites" || orgName !== ALL_VTUBERS),
      }),
    [settings, favorites, source.kind, orgName]
  )

  const videos = useMemo(
    () =>
      (query.data ?? []).filter((v) => filter(v) && isPlayableInMultiview(v)),
    [query.data, filter]
  )
  return {
    videos,
    isFetching: query.isFetching,
    isPending: query.isPending,
    refetch: query.refetch,
  }
}
