import { useEffect, useRef } from "react"

import { api } from "@/lib/api"
import { videosToLookUp } from "@/lib/multiview/layout"
import {
  needsMetadata,
  refreshable,
  type VideoDetails,
} from "@/lib/multiview/stream"
import { useMultiview } from "@/stores/multiview"

const CHANNEL_URL = /\/channel\/([\w-]+)/

/** The catalog first; oEmbed for anything it has never heard of. */
async function lookUp(ids: string[]) {
  const fresh = new Map<string, VideoDetails>()
  const failed = new Set<string>()
  const videos = await api.videosById(ids).catch(() => [])
  for (const video of videos) fresh.set(video.id, video)

  await Promise.all(
    ids
      .filter((id) => !fresh.has(id))
      .map(async (id) => {
        try {
          const data = await api.youtubeOembed(id)
          fresh.set(id, {
            title: data.title,
            channel: {
              name: data.author_name,
              id: CHANNEL_URL.exec(data.author_url ?? "")?.[1],
            },
            // All there is to know; asking the catalog again would not help.
            noData: true,
          })
        } catch {
          failed.add(id)
        }
      })
  )
  return { fresh, failed }
}

/**
 * Fetches details for streams the layout only has ids for, and on arrival also
 * refreshes anything that was live last time, as it may well have ended. An
 * answer arriving after leaving the page is still good for next time, so these
 * requests are not cancelled.
 */
export function useVideoDetails({ refreshLive }: { refreshLive: boolean }) {
  const cells = useMultiview((s) => s.cells)
  const mergeVideoData = useMultiview((s) => s.mergeVideoData)
  const refreshedLive = useRef(!refreshLive)
  const asked = useRef(new Set<string>())

  useEffect(() => {
    const ids = videosToLookUp(
      cells,
      (video) =>
        needsMetadata(video) || (!refreshedLive.current && refreshable(video))
    ).filter((id) => !asked.current.has(id))
    refreshedLive.current = true
    if (!ids.length) return

    for (const id of ids) asked.current.add(id)
    void lookUp(ids).then(({ fresh, failed }) => mergeVideoData(fresh, failed))
  }, [cells, mergeVideoData])
}
