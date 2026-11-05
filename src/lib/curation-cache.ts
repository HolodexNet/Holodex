import {
  patchMentionLists,
  rememberVideoEdit,
  type VideoCurationEdit,
  withMentionAdditions,
} from "@/lib/mention-cache"
import { queryClient } from "@/lib/queries"
import type { ChannelSummary } from "@/lib/types"
import { useSelection } from "@/stores/selection"

/** Every query holding video records that a confirmed edit should show up in. */
const VIDEO_QUERY_PREFIXES = ["live", "videos", "search", "video", "video-edit"]

let reconciliation: ReturnType<typeof setTimeout> | undefined

export function reconcileMentionAdditions(
  additions: Record<string, ChannelSummary[]>
) {
  if (!Object.values(additions).some((channels) => channels.length)) return
  reconcileVideoEdits(
    Object.fromEntries(
      Object.entries(additions).map(([id, channels]) => [
        id,
        { addMentions: channels },
      ])
    )
  )
}

export function reconcileVideoEdits(edits: Record<string, VideoCurationEdit>) {
  if (!Object.keys(edits).length) return
  for (const [id, edit] of Object.entries(edits)) rememberVideoEdit(id, edit)
  for (const prefix of VIDEO_QUERY_PREFIXES) {
    queryClient.setQueriesData({ queryKey: [prefix] }, patchMentionLists)
    void queryClient.invalidateQueries({
      queryKey: [prefix],
      refetchType: "none",
    })
  }
  useSelection.setState((state) => ({
    items: Object.fromEntries(
      Object.entries(state.items).map(([id, entry]) => [
        id,
        { ...entry, video: withMentionAdditions(entry.video) },
      ])
    ),
  }))
  clearTimeout(reconciliation)
  reconciliation = setTimeout(() => {
    for (const prefix of VIDEO_QUERY_PREFIXES)
      void queryClient.invalidateQueries({ queryKey: [prefix] })
  }, 180_000)
}
