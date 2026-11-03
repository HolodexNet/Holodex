import { DEFAULT_PANELS, TL_PANELS } from "./chat.ts"
import { clampRect } from "./grid.ts"
import { twitchChannelStub, youtubeStub } from "./stream.ts"
import type {
  Cell,
  CellContent,
  ChatTarget,
  MultiviewChannel,
  MultiviewVideo,
} from "./types.ts"
import type { AutoLayoutTable, SavedPreset } from "./presets.ts"

/**
 * The previous UI's persisted multiview state, as far as it is worth reading.
 * Nothing in old localStorage is guaranteed to be well formed.
 */
export interface LegacyMultiviewState {
  layout?: {
    i: string
    x: number
    y: number
    w: number
    h: number
  }[]
  layoutContent?: Record<
    string,
    {
      type?: string
      id?: string
      muted?: boolean
      currentTab?: number
      initAsTL?: boolean
      video?: {
        id?: string
        type?: string
        title?: string | null
        status?: MultiviewVideo["status"]
        topic_id?: string | null
        available_at?: string | number | null
        start_scheduled?: string | number | null
        start_actual?: string | number | null
        duration?: number | null
        noData?: boolean
        channel?: Partial<MultiviewChannel>
      }
    }
  >
  presetLayout?: SavedPreset[]
  autoLayout?: AutoLayoutTable
  ytUrlHistory?: string[]
  twUrlHistory?: string[]
  muteOthers?: boolean
  syncOffsets?: Record<string, number>
}

type LegacyContent = NonNullable<LegacyMultiviewState["layoutContent"]>[string]

function legacyVideo(content: LegacyContent): MultiviewVideo | null {
  const video = content.video
  const id = video?.id ?? content.id
  if (!id) return null
  const stub =
    video?.type === "twitch" ? twitchChannelStub(id) : youtubeStub(id)
  return {
    ...stub,
    channel: { ...stub.channel, ...video?.channel },
    title: video?.title,
    status: video?.status,
    topic_id: video?.topic_id,
    available_at: video?.available_at,
    start_scheduled: video?.start_scheduled,
    start_actual: video?.start_actual,
    duration: video?.duration,
    noData: video?.noData,
  }
}

function legacyContent(content: LegacyContent | undefined): CellContent | null {
  if (content?.type === "chat") {
    const target: ChatTarget =
      content.currentTab === undefined
        ? { kind: "auto" }
        : { kind: "auto", prefer: content.currentTab }
    return {
      type: "chat",
      target,
      panels: content.initAsTL ? TL_PANELS : DEFAULT_PANELS,
    }
  }
  if (content?.type === "video") {
    const video = legacyVideo(content)
    return video && { type: "video", video, muted: content.muted }
  }
  return null
}

export function cellsFromLegacy(state: LegacyMultiviewState): Cell[] {
  if (!Array.isArray(state.layout)) return []
  return state.layout.flatMap((item): Cell[] => {
    if (!item || typeof item.i !== "string") return []
    return [
      {
        id: item.i,
        rect: clampRect(item),
        content: legacyContent(state.layoutContent?.[item.i]),
      },
    ]
  })
}
