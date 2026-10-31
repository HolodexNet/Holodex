import type { HTMLAttributes, MouseEvent } from "react"
import { toast } from "sonner"

import { Checkbox } from "@/components/ui/checkbox"
import { getT, useT } from "@/lib/i18n"
import { SELECTION_LIMIT } from "@/lib/selection"
import type { Video } from "@/lib/types"
import { videoTitle } from "@/lib/video"
import { useSelection, useSelectionScopes } from "@/stores/selection"
import { useSettings } from "@/stores/settings"
import { useSelectionScope } from "./selection-scope"

function selectionTarget(
  target: EventTarget | null,
  card: HTMLElement
): boolean {
  if (!(target instanceof Element) || !card.contains(target)) return false
  return !target.closest(
    'button, input, textarea, select, [role="button"], [role="checkbox"], [contenteditable="true"], [data-selection-ignore], a:not([data-selection-link])'
  )
}

export function toastSelectionLimit() {
  toast.info(getT().t("selection.limit", { count: SELECTION_LIMIT }), {
    id: "selection-limit",
  })
}

export function useSelectableVideo(video: Video) {
  const scope = useSelectionScope()
  const { t } = useT()
  const preferEnglish = useSettings((state) => state.useEnglishName)
  const selected = useSelection((state) => !!state.items[video.id])
  const selecting = useSelection((state) => state.selecting)
  const enabled = !!scope && selecting
  const activate = () => {
    if (scope) useSelectionScopes.getState().activate(scope.id)
  }
  const toggle = (range = false) => {
    if (!scope || !selecting) return
    activate()
    const { range: selectRange, toggle } = useSelection.getState()
    const limited = range
      ? selectRange(scope.id, scope.videos, video.id)
      : toggle(video, scope.id)
    if (limited) toastSelectionLimit()
  }
  const click = (event: MouseEvent<HTMLElement>) => {
    if (!enabled || !selectionTarget(event.target, event.currentTarget)) return
    event.preventDefault()
    event.stopPropagation()
    toggle(event.shiftKey)
  }
  const itemProps: HTMLAttributes<HTMLElement> & { "data-selected"?: true } =
    enabled
      ? {
          "data-selected": selected || undefined,
          onClickCapture: click,
          onFocusCapture: activate,
          onPointerDownCapture: activate,
          onKeyDown: (event) => {
            if (
              (event.key.toLowerCase() !== "x" && event.key !== " ") ||
              event.ctrlKey ||
              event.metaKey ||
              event.altKey ||
              !selectionTarget(event.target, event.currentTarget)
            )
              return
            event.preventDefault()
            toggle(event.shiftKey)
          },
        }
      : {}
  const checkbox = enabled ? (
    <span
      data-selection-ignore
      className="relative z-10 inline-flex rounded-lg bg-background/95 p-1 shadow-sm"
      onClickCapture={(event) => {
        if (!event.shiftKey) return
        event.preventDefault()
        event.stopPropagation()
        toggle(true)
      }}
    >
      <Checkbox
        checked={selected}
        className="size-5"
        aria-label={t(
          selected ? "selection.deselectVideo" : "selection.selectVideo",
          { title: videoTitle(video, preferEnglish) }
        )}
        onCheckedChange={() => toggle()}
        onKeyDown={(event) => {
          if (event.shiftKey && event.key === " ") {
            event.preventDefault()
            toggle(true)
          }
        }}
      />
    </span>
  ) : null
  return {
    itemProps,
    checkbox,
    selecting,
    selected: enabled && selected,
    enabled,
  }
}

export function CollaborationSelection({ videos }: { videos: Video[] }) {
  const scope = useSelectionScope()
  const { t } = useT()
  const selecting = useSelection((state) => state.selecting)
  const count = useSelection(
    (state) => videos.filter((video) => state.items[video.id]).length
  )
  if (!scope || !selecting) return null
  return (
    <Checkbox
      data-selection-ignore
      checked={count === videos.length}
      indeterminate={count > 0 && count < videos.length}
      aria-label={t("selection.selectGroup", { count: videos.length })}
      className="size-5"
      onCheckedChange={() => {
        useSelectionScopes.getState().activate(scope.id)
        if (useSelection.getState().set(videos, count !== videos.length))
          toastSelectionLimit()
      }}
    />
  )
}
