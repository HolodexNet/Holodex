import { useMemo, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { cn } from "cn"
import { toast } from "sonner"

import {
  ArrowSquareOutIcon,
  ArrowsClockwiseIcon,
  CaretLeftIcon,
  CaretRightIcon,
  ChatTextIcon,
  CheckIcon,
  ClipboardTextIcon,
  PlusIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Kbd } from "@/components/ui/kbd"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { api, ApiError } from "@/lib/api"
import { useT } from "@/lib/i18n"
import { queryClient } from "@/lib/queries"
import type { Video } from "@/lib/types"
import {
  decodeMessage,
  makeSource,
  parseSetlist,
  type SetlistEntry,
  type SetlistSource,
} from "@/lib/video-edit/setlist"
import { MOD_KEY, SONG_SHORTCUT_KEYS } from "@/lib/video-edit/shortcuts"
import { songCovers } from "@/lib/video-edit/songs"
import {
  formatTimecode,
  parseTimecode,
  toHalfWidth,
} from "@/lib/video-edit/timecode"
import { useAuth } from "@/stores/auth"
import { useSongWorkspace } from "./workspace"

function useRenewComments() {
  const { t, tc } = useT()
  const { video } = useSongWorkspace()
  return useMutation({
    mutationFn: async () => {
      await api.curation.renewComments(video.id, AbortSignal.timeout(120_000))
      return api.curation.comments(video.id)
    },
    onSuccess: (comments) => {
      queryClient.setQueryData<Video>(["video-edit", video.id], (old) =>
        old ? { ...old, comments } : old
      )
      toast.success(tc("videoEdit.setlist.commentsFound", comments.length))
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiError && error.status === 400
          ? t("videoEdit.setlist.renewLimited")
          : t("videoEdit.setlist.renewFailed")
      ),
  })
}

function PasteDialog({
  open,
  onOpenChange,
  onSource,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSource: (source: SetlistSource) => void
}) {
  const { t, tc } = useT()
  const workspace = useSongWorkspace()
  const [text, setText] = useState("")
  const duration = workspace.video.duration || undefined
  const preview = useMemo(
    () => makeSource("preview", "paste", text, duration),
    [text, duration]
  )
  // Said out loud, as a line with no time on it is otherwise just quietly gone.
  const unread = useMemo(
    () =>
      text
        .split(/\r?\n/)
        .filter((line) => line.trim() && !parseSetlist(line, duration).length)
        .length,
    [text, duration]
  )
  const submit = () => {
    if (!preview.songCount) return
    const source = workspace.addPastedSource(text)
    if (source) onSource(source)
    setText("")
    onOpenChange(false)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("videoEdit.setlist.pasteTitle")}</DialogTitle>
          <DialogDescription>
            {t("videoEdit.setlist.pasteDescription")}
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={text}
          rows={9}
          autoFocus
          spellCheck={false}
          aria-label={t("videoEdit.setlist.pasteTitle")}
          placeholder={"0:02:10 怪物 / YOASOBI\n0:07:30 Lemon - 米津玄師"}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
              event.preventDefault()
              submit()
            }
          }}
        />
        {preview.entries.length > 0 && (
          <ul className="grid max-h-40 gap-px overflow-y-auto rounded-xl border p-1.5 text-xs">
            {preview.entries.map((entry, position) => (
              <li
                key={`${entry.start}-${position}`}
                className={cn(
                  "flex items-baseline gap-2",
                  entry.kind === "note" && "opacity-55"
                )}
              >
                <span className="shrink-0 text-muted-foreground tabular-nums">
                  {formatTimecode(entry.start)}
                  {entry.end !== undefined && ` – ${formatTimecode(entry.end)}`}
                </span>
                <span className="min-w-0 truncate" title={entry.text}>
                  {entry.title || t("videoEdit.setlist.noText")}
                  {entry.artist && (
                    <span className="text-muted-foreground">
                      {" "}
                      · {entry.artist}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
        <DialogFooter className="items-center">
          <span className="mr-auto grid text-xs text-muted-foreground">
            <span>{tc("videoEdit.setlist.pasteFound", preview.songCount)}</span>
            {unread > 0 && (
              <span>{tc("videoEdit.setlist.pasteUnread", unread)}</span>
            )}
          </span>
          <Button disabled={!preview.songCount} onClick={submit}>
            {t("videoEdit.setlist.pasteUse")}
            <Kbd className="ml-1 hidden bg-primary-foreground/20 text-primary-foreground lg:inline-flex">
              {MOD_KEY} {SONG_SHORTCUT_KEYS.confirm}
            </Kbd>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function EntryRow({
  source,
  entry,
}: {
  source: SetlistSource
  entry: SetlistEntry
}) {
  const { t } = useT()
  const workspace = useSongWorkspace()
  const added = songCovers(workspace.songs, entry.start)
  const isNote = entry.kind === "note"
  return (
    <li
      className={cn(
        "flex items-center gap-2 rounded-lg px-1.5 py-0.5 hover:bg-muted/60",
        isNote && "opacity-55"
      )}
    >
      <button
        type="button"
        className="shrink-0 cursor-pointer text-xs text-complement tabular-nums outline-none hover:underline focus-visible:underline"
        title={t("videoEdit.setlist.playFrom")}
        onClick={() => workspace.clock.hearFrom(entry.start)}
      >
        {formatTimecode(entry.start)}
      </button>
      <span className="min-w-0 flex-1 truncate text-sm" title={entry.text}>
        {entry.title || t("videoEdit.setlist.noText")}
        {entry.artist && (
          <span className="text-muted-foreground"> · {entry.artist}</span>
        )}
      </span>
      {added ? (
        <CheckIcon
          className="mx-1.5 size-4 shrink-0 text-complement"
          aria-label={t("videoEdit.setlist.added")}
        />
      ) : (
        workspace.canAdd && (
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={t("videoEdit.songs.addOne", { name: entry.title })}
            title={t("videoEdit.songs.addOne", { name: entry.title })}
            onClick={() => {
              const id = workspace.addEntry(source, entry)
              if (id) workspace.clock.seek(entry.start)
            }}
          >
            <PlusIcon />
          </Button>
        )
      )}
    </li>
  )
}

/** A comment as it was written, with its timestamps ready to jump to. */
function CommentBody({ message }: { message: string }) {
  const { clock } = useSongWorkspace()
  const text = toHalfWidth(decodeMessage(message))
  const parts = text.split(/((?:\d{1,2}:)?\d{1,3}:\d{2})/)
  return (
    <p className="text-sm wrap-anywhere whitespace-pre-wrap">
      {parts.map((part, index) => {
        const time = index % 2 ? parseTimecode(part) : null
        return time === null ? (
          part
        ) : (
          <button
            key={index}
            type="button"
            className="cursor-pointer text-complement tabular-nums outline-none hover:underline focus-visible:underline"
            onClick={() => clock.hearFrom(time)}
          >
            {part}
          </button>
        )
      })}
    </p>
  )
}

/** What the comments and description offer, turned into songs a click at a time. */
export function SourcePanel({ className }: { className?: string }) {
  const { t, tc } = useT()
  const user = useAuth((state) => state.user)
  const workspace = useSongWorkspace()
  const { sources, songs, video, canAdd } = workspace
  const [view, setView] = useState<"setlist" | "comments">("setlist")
  const [sourceId, setSourceId] = useState<string | null>(null)
  const [pasting, setPasting] = useState(false)
  const renew = useRenewComments()
  const source =
    sources.find((item) => item.id === sourceId) ?? sources[0] ?? null
  const index = source ? sources.indexOf(source) : -1
  const remaining =
    source?.entries.filter(
      (entry) => entry.kind === "song" && !songCovers(songs, entry.start)
    ).length ?? 0
  const comments = video.comments ?? []

  const sourceLabel = source
    ? source.kind === "description"
      ? t("videoEdit.setlist.fromDescription")
      : source.kind === "paste"
        ? t("videoEdit.setlist.fromPaste")
        : t("videoEdit.setlist.fromComment")
    : ""

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div className="flex flex-wrap items-center gap-1 border-b px-2 py-1.5">
        <div className="flex items-center gap-0.5 rounded-4xl bg-muted p-0.5">
          {(["setlist", "comments"] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={view === item}
              className={cn(
                "cursor-pointer rounded-4xl px-2.5 py-0.5 text-xs font-medium transition-colors outline-none focus-ring",
                view === item
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setView(item)}
            >
              {item === "setlist"
                ? t("videoEdit.setlist.tab")
                : t("videoEdit.setlist.commentsTab", {
                    count: comments.length,
                  })}
            </button>
          ))}
        </div>
        <span className="flex-1" />
        {canAdd && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={t("videoEdit.setlist.pasteTitle")}
            title={t("videoEdit.setlist.pasteTitle")}
            onClick={() => setPasting(true)}
          >
            <ClipboardTextIcon />
          </Button>
        )}
        {user && (
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={renew.isPending}
            aria-label={t("videoEdit.setlist.renew")}
            title={t("videoEdit.setlist.renew")}
            onClick={() => renew.mutate()}
          >
            {renew.isPending ? <Spinner /> : <ArrowsClockwiseIcon />}
          </Button>
        )}
      </div>

      {view === "comments" ? (
        comments.length ? (
          <ul className="grid min-h-0 flex-1 content-start gap-3 overflow-y-auto p-3">
            {comments.map((comment) => (
              <li key={comment.comment_key} className="grid gap-1">
                <CommentBody message={comment.message} />
                <a
                  href={`https://www.youtube.com/watch?v=${encodeURIComponent(video.id)}&lc=${encodeURIComponent(comment.comment_key)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-fit items-center gap-1 text-xs text-muted-foreground hover:underline"
                >
                  <ArrowSquareOutIcon className="size-3" />
                  {t("views.settings.redirectModeLabel")}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <EmptySource
            renew={user ? () => renew.mutate() : undefined}
            renewing={renew.isPending}
            paste={canAdd ? () => setPasting(true) : undefined}
          />
        )
      ) : source ? (
        <>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="flex min-w-0 flex-1 items-center gap-0.5">
              {sources.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  disabled={index === 0}
                  aria-label={t("videoEdit.setlist.previousSource")}
                  onClick={() => setSourceId(sources[index - 1].id)}
                >
                  <CaretLeftIcon />
                </Button>
              )}
              <span
                className="min-w-0 truncate text-xs text-muted-foreground"
                title={sourceLabel}
              >
                {sources.length > 1
                  ? t("videoEdit.setlist.sourcePosition", {
                      label: sourceLabel,
                      index: index + 1,
                      total: sources.length,
                    })
                  : sourceLabel}
              </span>
              {sources.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  disabled={index === sources.length - 1}
                  aria-label={t("videoEdit.setlist.nextSource")}
                  onClick={() => setSourceId(sources[index + 1].id)}
                >
                  <CaretRightIcon />
                </Button>
              )}
            </div>
          </div>
          <div className="relative flex min-h-0 flex-1 flex-col">
            <ul
              className={cn(
                // A grid's single column is as wide as its widest row unless told it can shrink.
                "grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)] content-start gap-px overflow-y-auto px-1.5",
                // Room for the button to float over, so the last rows can scroll clear of it.
                canAdd ? "pb-16" : "pb-3"
              )}
            >
              {source.entries.map((entry, position) => (
                <EntryRow
                  key={`${entry.start}-${position}`}
                  source={source}
                  entry={entry}
                />
              ))}
            </ul>
            {canAdd && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end p-3">
                <Button
                  className="pointer-events-auto shadow-lg"
                  variant={remaining ? "default" : "secondary"}
                  disabled={!remaining}
                  onClick={() => {
                    const added = workspace.addAllEntries(source)
                    if (added)
                      toast.success(tc("videoEdit.songs.addedMany", added))
                  }}
                >
                  {remaining ? (
                    <PlusIcon data-icon="inline-start" />
                  ) : (
                    <CheckIcon data-icon="inline-start" />
                  )}
                  {remaining
                    ? tc("videoEdit.songs.addAll", remaining)
                    : t("videoEdit.setlist.allAdded")}
                </Button>
              </div>
            )}
          </div>
        </>
      ) : (
        <EmptySource
          renew={user ? () => renew.mutate() : undefined}
          renewing={renew.isPending}
          paste={canAdd ? () => setPasting(true) : undefined}
        />
      )}
      <PasteDialog
        open={pasting}
        onOpenChange={setPasting}
        onSource={(pasted) => {
          setSourceId(pasted.id)
          setView("setlist")
        }}
      />
    </div>
  )
}

function EmptySource({
  renew,
  renewing,
  paste,
}: {
  renew?: () => void
  renewing: boolean
  paste?: () => void
}) {
  const { t } = useT()
  return (
    <div className="grid flex-1 content-center justify-items-center gap-3 p-6 text-center">
      <ChatTextIcon className="size-6 text-muted-foreground" />
      <p className="max-w-xs text-sm text-muted-foreground">
        {t("videoEdit.setlist.noneFound")}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {renew && (
          <Button
            variant="outline"
            size="sm"
            disabled={renewing}
            onClick={renew}
          >
            {renewing ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <ArrowsClockwiseIcon data-icon="inline-start" />
            )}
            {t("videoEdit.setlist.renew")}
          </Button>
        )}
        {paste && (
          <Button variant="outline" size="sm" onClick={paste}>
            <ClipboardTextIcon data-icon="inline-start" />
            {t("videoEdit.setlist.pasteTitle")}
          </Button>
        )}
      </div>
    </div>
  )
}
