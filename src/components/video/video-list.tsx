import { useMemo, type CSSProperties, type ReactNode } from "react"
import { cn } from "cn"

import { Skeleton } from "@/components/ui/skeleton"
import type { Video } from "@/lib/types"
import { collateCollaborations } from "@/lib/collaborations"
import type { GridSize, HomeViewMode } from "@/stores/settings"
import { VideoCard } from "./video-card"
import { CollaborationCard } from "./collaboration-card"

interface LayoutProps {
  mode?: HomeViewMode
  gridSize?: GridSize
}

/** Minimum card width per grid size; columns fill whatever room there is. */
const CARD_MIN = ["17rem", "13.5rem", "11rem"] as const
/** Phones get a fixed column count instead: one, two or three across. */
const PHONE_COLUMNS = ["grid-cols-1", "grid-cols-2", "grid-cols-3"] as const

function layoutClass(mode: HomeViewMode, gridSize: GridSize) {
  if (mode === "denseList") return "flex flex-col"
  if (mode === "list") return "grid gap-x-6 gap-y-4 xl:grid-cols-2"
  return cn(
    "grid gap-x-4 gap-y-6",
    PHONE_COLUMNS[gridSize],
    "sm:grid-cols-[repeat(auto-fill,minmax(var(--card-min),1fr))]"
  )
}

const layoutStyle = (gridSize: GridSize) =>
  ({ "--card-min": CARD_MIN[gridSize] }) as CSSProperties

const variantOf = (mode: HomeViewMode) =>
  mode === "denseList" ? "dense" : mode === "list" ? "list" : "grid"

interface VideoListProps extends LayoutProps {
  videos: Video[]
  /** Renders below the text of a card, e.g. comments that matched a search. */
  renderExtra?: (video: Video) => ReactNode
  className?: string
  discovery?: boolean
  collateCollabs?: boolean
}

export function VideoList({
  videos,
  mode = "grid",
  gridSize = 0,
  renderExtra,
  className,
  discovery = false,
  collateCollabs = false,
}: VideoListProps) {
  const groups = useMemo(
    () =>
      collateCollabs
        ? collateCollaborations(videos)
        : videos.map((video) => [video]),
    [videos, collateCollabs]
  )
  return (
    <div
      className={cn("video-feed", layoutClass(mode, gridSize), className)}
      style={layoutStyle(gridSize)}
      data-grid-size={gridSize}
      data-view-mode={mode}
    >
      {groups.map((group) =>
        group.length > 1 ? (
          <CollaborationCard
            key={group[0].id}
            videos={group}
            variant={variantOf(mode)}
            compact={mode === "grid" && gridSize > 0}
            discovery={discovery && mode === "grid"}
            renderExtra={renderExtra}
          />
        ) : (
          <VideoCard
            key={group[0].id}
            video={group[0]}
            variant={variantOf(mode)}
            compact={mode === "grid" && gridSize > 0}
            discovery={discovery && mode === "grid"}
          >
            {renderExtra?.(group[0])}
          </VideoCard>
        )
      )}
    </div>
  )
}

export function VideoListSkeleton({
  mode = "grid",
  gridSize = 0,
  count = 12,
  className,
}: LayoutProps & { count?: number; className?: string }) {
  const items = Array.from({ length: count }, (_, i) => i)

  if (mode === "denseList") {
    return (
      <div className="flex flex-col" aria-hidden="true">
        {items.map((i) => (
          <div key={i} className="flex items-center gap-3 border-b py-2">
            <Skeleton className="size-7 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="hidden h-4 w-40 md:block" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(layoutClass(mode, gridSize), className)}
      style={layoutStyle(gridSize)}
      data-grid-size={gridSize}
      aria-hidden="true"
    >
      {items.map((i) => (
        <div
          key={i}
          className={cn("flex", mode === "list" ? "gap-3" : "flex-col gap-2.5")}
        >
          <Skeleton
            className={cn(
              "aspect-video rounded-xl",
              mode === "list" ? "w-40 sm:w-48" : "w-full"
            )}
          />
          <div className="flex flex-1 gap-2.5">
            {mode === "grid" && gridSize === 0 && (
              <Skeleton className="size-9 shrink-0 rounded-full" />
            )}
            <div className="flex flex-1 flex-col gap-1.5 pt-0.5">
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-3.5 w-1/2" />
              <Skeleton className="h-3.5 w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
