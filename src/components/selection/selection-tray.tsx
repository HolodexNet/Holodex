import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useT } from "@/lib/i18n"
import { SELECTION_LIMIT } from "@/lib/selection"
import {
  availableVideoActions,
  videoActionIssue,
} from "@/lib/selection-actions"
import { videoTitle, watchPath } from "@/lib/video"
import { useAuth } from "@/stores/auth"
import { useSelection, useSelectionScopes } from "@/stores/selection"
import { useSelectionAction } from "@/stores/selection-action"
import { useSettings } from "@/stores/settings"
import { toastSelectionLimit } from "./use-selectable-video"

export function SelectionTray() {
  const { t } = useT()
  const items = useSelection((state) => state.items)
  const selecting = useSelection((state) => state.selecting)
  const scopes = useSelectionScopes((state) => state.scopes)
  const active = useSelectionScopes((state) => state.active)
  const user = useAuth((state) => state.user)
  const preferEnglish = useSettings((state) => state.useEnglishName)
  const [reviewing, setReviewing] = useState(false)
  const entries = Object.values(items)
  const actions = availableVideoActions(user)
  const editActions = actions.filter((action) => action.id !== "copy-links")
  const loaded = active ? scopes[active] : undefined
  const selectLoaded = () => {
    if (loaded && useSelection.getState().set(loaded, true))
      toastSelectionLimit()
  }
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        !useSelection.getState().selecting ||
        useSelectionAction.getState().request
      )
        return
      if (
        event.target instanceof Element &&
        event.target.closest(
          'input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="dialog"], [role="menu"]'
        )
      )
        return
      if (event.key === "Escape") {
        event.preventDefault()
        useSelection.getState().exit()
      } else if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "a"
      ) {
        const state = useSelectionScopes.getState()
        const videos = state.active ? state.scopes[state.active] : undefined
        if (!videos) return
        event.preventDefault()
        if (useSelection.getState().set(videos, true)) toastSelectionLimit()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [])
  if (!selecting) return null
  return (
    <>
      <div className="h-32" aria-hidden="true" />
      <div
        role="region"
        aria-label={t("selection.label")}
        className="fixed inset-x-3 bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] z-40 mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-2 rounded-2xl border bg-popover p-3 text-popover-foreground shadow-xl md:bottom-5"
      >
        <Popover open={reviewing} onOpenChange={setReviewing}>
          <PopoverTrigger
            disabled={!entries.length}
            render={<Button variant="ghost" size="sm" />}
          >
            {t("selection.count", { count: entries.length })}
          </PopoverTrigger>
          <PopoverContent
            side="top"
            className="w-[min(24rem,calc(100vw-2rem))]"
          >
            <p className="text-sm font-medium">{t("selection.review")}</p>
            <ul className="max-h-64 overflow-y-auto">
              {entries.map(({ video }) => (
                <li key={video.id} className="flex items-center gap-2 py-1">
                  <span className="min-w-0 flex-1 truncate text-xs">
                    {videoTitle(video, preferEnglish)}
                  </span>
                  <Button
                    variant="ghost"
                    size="xs"
                    aria-label={t("selection.deselectVideo", {
                      title: videoTitle(video, preferEnglish),
                    })}
                    onClick={() => useSelection.getState().set([video], false)}
                  >
                    {t("selection.remove")}
                  </Button>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
        {loaded && (
          <Button variant="outline" size="sm" onClick={selectLoaded}>
            {t("selection.selectLoaded", { count: loaded.length })}
          </Button>
        )}
        {actions
          .filter((action) => action.id === "copy-links")
          .map((action) => (
            <Button
              key={action.id}
              variant="secondary"
              size="sm"
              disabled={!entries.length || entries.length > action.maximum}
              title={
                entries.length > action.maximum
                  ? t("selection.actionLimit", { count: action.maximum })
                  : undefined
              }
              onClick={() => {
                void navigator.clipboard
                  .writeText(
                    entries
                      .map(
                        ({ video }) =>
                          `${window.location.origin}${watchPath(video.id)}`
                      )
                      .join("\n")
                  )
                  .then(
                    () =>
                      toast.success(t("component.videoCard.copiedToClipboard")),
                    () => toast.error(t("component.videoCard.copyFailed"))
                  )
              }}
            >
              {t(action.label)}
            </Button>
          ))}
        {editActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger
              disabled={!entries.length}
              render={<Button size="sm" />}
            >
              {t("curation.editVideos")}
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="top"
              align="center"
              className="w-80 max-w-[calc(100vw-2rem)]"
            >
              {editActions.map((action) => {
                const issue = videoActionIssue(
                  action,
                  entries.map((entry) => entry.video)
                )
                return (
                  <DropdownMenuItem
                    key={action.id}
                    disabled={!!issue}
                    variant={
                      "destructive" in action && action.destructive
                        ? "destructive"
                        : "default"
                    }
                    onClick={() =>
                      useSelectionAction.getState().open(entries, action.id)
                    }
                  >
                    <span className="grid gap-0.5">
                      <span>{t(action.label)}</span>
                      {issue && (
                        <span className="text-xs text-muted-foreground">
                          {t(`curation.smartErrors.${issue}`, {
                            minimum: action.minimum,
                            maximum: action.maximum,
                          })}
                        </span>
                      )}
                    </span>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <Button
          variant="ghost"
          size="sm"
          disabled={!entries.length}
          onClick={() => useSelection.getState().clear()}
        >
          {t("selection.clear")}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => useSelection.getState().exit()}
        >
          {t("selection.done")}
        </Button>
        {entries.length >= SELECTION_LIMIT && (
          <p className="w-full text-center text-xs text-muted-foreground">
            {t("selection.limit", { count: SELECTION_LIMIT })}
          </p>
        )}
      </div>
    </>
  )
}
