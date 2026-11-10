import type { ReactNode } from "react"
import { Link, useNavigate } from "react-router"

import {
  ArrowLeftIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CheckIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { segmentedItemVariants, segmentedListClass } from "@/components/ui/tabs"
import { useT } from "@/lib/i18n"
import type { Video } from "@/lib/types"
import { channelName, videoThumbnail, videoTitle, watchPath } from "@/lib/video"
import { editableParts, editPath, type EditTab } from "@/lib/video-edit/routes"
import { useSelection } from "@/stores/selection"
import { useSettings } from "@/stores/settings"
import { useEditQueue } from "@/stores/video-edit"

/** Leaves the editor for wherever the person came from, not for another tab of it. */
function useLeaveEditor() {
  const navigate = useNavigate()
  return (returnTo?: string | null) => {
    if (returnTo) void navigate(returnTo, { replace: true })
    // The router records its own position, and 0 means we opened on this page.
    else if ((window.history.state?.idx ?? 0) > 0) void navigate(-1)
    else void navigate("/", { replace: true })
  }
}

/** Steps through videos chosen with the selection tray, one at a time. */
function QueueStepper({ video, tab }: { video: Video; tab: EditTab }) {
  const { t } = useT()
  const navigate = useNavigate()
  const leave = useLeaveEditor()
  const ids = useEditQueue((state) => state.ids)
  const index = ids.indexOf(video.id)
  if (index < 0 || ids.length < 2) return null
  // Stays on the same tab where the next video allows it.
  const go = (id: string) => navigate(editPath(id, tab), { replace: true })
  const last = index === ids.length - 1
  const finish = () => {
    const { returnTo, clear } = useEditQueue.getState()
    // Same as a bulk edit: what's been dealt with leaves the basket.
    const selection = useSelection.getState()
    selection.set(
      Object.values(selection.items)
        .map((entry) => entry.video)
        .filter((item) => ids.includes(item.id)),
      false
    )
    clear()
    leave(returnTo)
  }
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        disabled={index === 0}
        aria-label={t("videoEdit.queue.previous")}
        title={t("videoEdit.queue.previous")}
        onClick={() => void go(ids[index - 1])}
      >
        <CaretLeftIcon />
      </Button>
      <span className="text-xs whitespace-nowrap text-muted-foreground tabular-nums">
        {t("videoEdit.queue.position", {
          index: index + 1,
          total: ids.length,
        })}
      </span>
      {last ? (
        <Button variant="secondary" size="sm" onClick={finish}>
          <CheckIcon data-icon="inline-start" />
          {t("videoEdit.queue.finish")}
        </Button>
      ) : (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => void go(ids[index + 1])}
        >
          {t("videoEdit.queue.next")}
          <CaretRightIcon data-icon="inline-end" />
        </Button>
      )}
    </div>
  )
}

export function EditorHeader({
  video,
  tab,
  children,
}: {
  video: Video
  tab: EditTab
  /** The active tab's own controls, on a row of their own when space runs out. */
  children?: ReactNode
}) {
  const { t } = useT()
  const leave = useLeaveEditor()
  const preferEnglish = useSettings((state) => state.useEnglishName)
  const parts = editableParts(video)
  const tabs: { id: EditTab; label: string; to: string }[] = [
    {
      id: "details",
      label: t("videoEdit.tabs.details"),
      to: editPath(video.id, "details"),
    },
    ...(parts.songs
      ? [
          {
            id: "music" as const,
            label: t("videoEdit.tabs.music"),
            to: editPath(video.id, "music"),
          },
        ]
      : []),
  ]

  return (
    <header className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b bg-header px-2 py-1.5">
      <div className="flex min-w-0 flex-1 basis-64 items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("editor.exitMode")}
          title={t("editor.exitMode")}
          onClick={() => leave()}
        >
          <ArrowLeftIcon />
        </Button>
        <Link
          to={watchPath(video.id)}
          className="hidden shrink-0 overflow-hidden rounded-md sm:block"
          tabIndex={-1}
          aria-hidden="true"
        >
          <img
            src={videoThumbnail(video).src}
            alt=""
            className="aspect-video h-9 object-cover"
          />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-medium">
            <Link to={watchPath(video.id)} className="hover:underline">
              {videoTitle(video, preferEnglish)}
            </Link>
          </h1>
          <p className="truncate text-xs text-muted-foreground">
            {channelName(video.channel, preferEnglish)}
          </p>
        </div>
      </div>
      <QueueStepper video={video} tab={tab} />
      {tabs.length > 1 && (
        <nav
          aria-label={t("videoEdit.tabs.label")}
          className={segmentedListClass}
        >
          {tabs.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              replace
              aria-current={item.id === tab ? "page" : undefined}
              className={segmentedItemVariants({ active: item.id === tab })}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
      {children}
    </header>
  )
}
