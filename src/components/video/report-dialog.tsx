import { useId, useMemo, useState } from "react"
import { Link } from "react-router"
import { useMutation, useQuery } from "@tanstack/react-query"
import { cn } from "cn"
import { toast } from "sonner"

import { ChannelAvatar } from "@/components/common/channel-avatar"
import { SwitchRow } from "@/components/common/feed-filters"
import {
  ArrowCounterClockwiseIcon,
  EyeIcon,
  EyeSlashIcon,
  InfoIcon,
  WarningIcon,
  XIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { MentionEditor } from "@/components/video-edit/mention-editor"
import { SuggestField } from "@/components/video-edit/suggest-field"
import { TopicEditor } from "@/components/video-edit/topic-editor"
import { useDebounced } from "@/hooks/use-debounced"
import { api, ApiError } from "@/lib/api"
import { useT } from "@/lib/i18n"
import { can, canChangeTopic } from "@/lib/permissions"
import { useTopics } from "@/lib/queries"
import {
  availableReasons,
  buildReportFields,
  COMMENT_MAX,
  commentIssue,
  hasSuggestion,
  showDisputeNotice,
  type MentionSuggestion,
  type ReasonId,
  type TopicSuggestion,
} from "@/lib/report"
import type { ChannelSummary, Video } from "@/lib/types"
import { channelName, videoTitle } from "@/lib/video"
import { topicLabel } from "@/lib/video-edit/suggestions"
import { useAuth } from "@/stores/auth"
import { useSettings } from "@/stores/settings"

const SEND_TIMEOUT_MS = 20_000

/**
 * Where people can fix a topic or a mention themselves, the dialog hands them
 * the editor and only reports what they couldn't change. Everything typed
 * survives a failed send, and nothing is retried behind their back.
 */
export function ReportDialog({
  video,
  org,
  onClose,
}: {
  video: Video
  org: string | null
  onClose: () => void
}) {
  const { t } = useT()
  const commentId = useId()
  const commentHintId = useId()
  const preferEnglish = useSettings((state) => state.useEnglishName)
  const hideCollabStreams = useSettings((state) => state.hideCollabStreams)
  const setSetting = useSettings((state) => state.set)
  const isBlocked = useSettings((state) =>
    state.blockedChannels.some((channel) => channel.id === video.channel.id)
  )
  const toggleBlocked = useSettings((state) => state.toggleBlocked)

  const [reasons, setReasons] = useState<ReadonlySet<ReasonId>>(new Set())
  const [comment, setComment] = useState("")
  const [topic, setTopic] = useState<TopicSuggestion | null>(null)
  const [mentions, setMentions] = useState<MentionSuggestion>({
    add: [],
    remove: [],
  })
  const [touched, setTouched] = useState(false)

  const options = availableReasons(video.type, !!org)
  const draft = { reasons: [...reasons], comment, topic, mentions }
  const suggesting = hasSuggestion(draft)
  const issue = commentIssue(comment, suggesting)
  const ready = reasons.size > 0 && !issue

  const send = useMutation({
    mutationFn: () =>
      api.reportVideo(
        video.id,
        buildReportFields(draft),
        AbortSignal.timeout(SEND_TIMEOUT_MS)
      ),
    onSuccess: () => {
      toast.success(t("component.reportDialog.success"))
      onClose()
    },
  })

  const toggleReason = (id: ReasonId, on: boolean) =>
    setReasons((set) => {
      const next = new Set(set)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })

  const submit = () => {
    setTouched(true)
    if (ready && !send.isPending) send.mutate()
  }

  const issueText =
    issue === "short"
      ? t("component.reportDialog.commentShort")
      : issue === "long"
        ? t("component.reportDialog.commentLong", { max: COMMENT_MAX })
        : issue === "missing"
          ? t("component.reportDialog.commentMissing")
          : suggesting && !comment.trim()
            ? t("component.reportDialog.commentOptional")
            : t("component.reportDialog.commentsHint")
  const showIssue = !!issue && (touched || issue === "long")

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-h-[calc(100dvh-2rem)] grid-cols-[minmax(0,1fr)] gap-4 overflow-x-hidden overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("component.reportDialog.title")}</DialogTitle>
          <DialogDescription className="grid gap-0.5">
            <span className="line-clamp-2 font-medium text-foreground">
              {videoTitle(video, preferEnglish)}
            </span>
            <span>{channelName(video.channel, preferEnglish)}</span>
          </DialogDescription>
        </DialogHeader>

        {org && video.type !== "clip" && !hideCollabStreams && (
          <Notice icon={<InfoIcon />}>
            <p>{t("component.reportDialog.collabing", { org })}</p>
            <SwitchRow
              label={t("views.settings.hideCollabStreamsLabel")}
              checked={hideCollabStreams}
              onChange={(value) => setSetting("hideCollabStreams", value)}
            />
          </Notice>
        )}

        <fieldset className="grid gap-1">
          <legend className="mb-1.5 text-sm font-semibold">
            {t("component.reportDialog.reasonsLabel")}
          </legend>
          {options.map((reason) => {
            const checked = reasons.has(reason.id)
            return (
              <div key={reason.id} className="grid gap-2">
                <label className="flex cursor-pointer items-start gap-3 rounded-lg py-1.5 text-sm">
                  <Checkbox
                    className="mt-0.5"
                    checked={checked}
                    onCheckedChange={(on) => toggleReason(reason.id, on)}
                  />
                  <span>
                    {t(
                      reason.labelKey,
                      reason.id === "org"
                        ? [video.type === "clip" ? "clip" : "video", org ?? ""]
                        : undefined
                    )}
                  </span>
                </label>
                {checked && reason.id === "topic" && (
                  <TopicPanel video={video} value={topic} onChange={setTopic} />
                )}
                {checked && reason.id === "mentions" && (
                  <MentionPanel
                    video={video}
                    value={mentions}
                    onChange={setMentions}
                  />
                )}
              </div>
            )
          })}
        </fieldset>

        {showDisputeNotice(video.channel.id, video.type, reasons) && (
          <Notice icon={<WarningIcon />} tone="warning">
            <p>{t("component.reportDialog.dispute")}</p>
          </Notice>
        )}

        <div className="grid gap-1.5">
          <label htmlFor={commentId} className="text-sm font-semibold">
            {t("component.reportDialog.comments")}
          </label>
          <Textarea
            id={commentId}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey))
                submit()
            }}
            rows={3}
            className="max-h-60"
            aria-invalid={showIssue || undefined}
            aria-describedby={commentHintId}
          />
          <div className="flex items-start justify-between gap-3 text-xs">
            <p
              id={commentHintId}
              className={cn(
                showIssue ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {issueText}
            </p>
            {comment.length > COMMENT_MAX * 0.8 && (
              <span
                className={cn(
                  "shrink-0 tabular-nums",
                  comment.trim().length > COMMENT_MAX
                    ? "text-destructive"
                    : "text-muted-foreground"
                )}
              >
                {comment.trim().length}/{COMMENT_MAX}
              </span>
            )}
          </div>
        </div>

        {send.isError && (
          <p role="alert" className="text-sm text-destructive">
            {send.error instanceof ApiError && send.error.status === 404
              ? t("component.reportDialog.notFound")
              : t("component.reportDialog.failed")}
          </p>
        )}

        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => {
              toggleBlocked(video.channel)
              if (!isBlocked) onClose()
            }}
          >
            {isBlocked ? <EyeIcon /> : <EyeSlashIcon />}
            {isBlocked
              ? t("component.videoCard.unblockChannel")
              : t("component.reportDialog.blockInstead")}
          </Button>
          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="outline" onClick={onClose}>
              {t("views.app.close_btn")}
            </Button>
            <Button
              onClick={submit}
              disabled={send.isPending || reasons.size === 0}
            >
              {send.isPending && <Spinner />}
              {t("component.reportDialog.submit")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Notice({
  icon,
  tone = "info",
  children,
}: {
  icon: React.ReactNode
  tone?: "info" | "warning"
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border p-3 text-sm [&>svg]:mt-0.5 [&>svg]:size-4 [&>svg]:shrink-0",
        tone === "warning"
          ? "border-amber-500/30 bg-amber-500/10 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400"
          : "bg-muted/50 [&>svg]:text-muted-foreground"
      )}
    >
      {icon}
      <div className="grid min-w-0 flex-1 gap-1">{children}</div>
    </div>
  )
}

function SignInHint() {
  const { t } = useT()
  return (
    <p className="text-xs text-muted-foreground">
      <Link to="/login" className="underline underline-offset-2">
        {t("component.reportDialog.signInToFix")}
      </Link>
    </p>
  )
}

/**
 * Someone allowed to change the topic gets the editor itself; anyone else picks
 * the topic they'd suggest, and the report carries both.
 */
function TopicPanel({
  video,
  value,
  onChange,
}: {
  video: Video
  value: TopicSuggestion | null
  onChange: (topic: TopicSuggestion | null) => void
}) {
  const { t } = useT()
  const user = useAuth((state) => state.user)
  const fieldId = useId()
  // Shared with the editor, so it reads the same answer.
  const current = useQuery({
    queryKey: ["video-topic", video.id],
    queryFn: ({ signal }) => api.curation.topic(video.id, signal),
    staleTime: 30_000,
    retry: false,
  })
  const editable = !!current.data && canChangeTopic(user, current.data)
  const catalog = useTopics(!editable)
  const items = useMemo(
    () => (catalog.data ?? []).map((topic) => topic.id),
    [catalog.data]
  )
  const original = current.isSuccess
    ? current.data.topic_id
    : (video.topic_id ?? null)
  // `undefined`: nothing suggested yet; `null`: suggesting no topic at all.
  const suggested = value ? value.suggested : undefined

  const choose = (next: string | null | undefined) =>
    onChange(next === undefined ? null : { original, suggested: next })

  if (current.isPending) return <Panel busy />

  if (editable)
    return (
      <Panel>
        <p className="text-xs text-muted-foreground">
          {t("component.reportDialog.fixedDirectly")}
        </p>
        <TopicEditor video={video} />
      </Panel>
    )

  return (
    <Panel>
      <p className="text-sm">
        <span className="text-muted-foreground">
          {t("component.reportDialog.topicCurrent")}:{" "}
        </span>
        <span className="font-medium capitalize">
          {original ? topicLabel(original) : t("videoEdit.topic.none")}
        </span>
      </p>
      {suggested === null ? (
        <div className="flex items-center gap-2 text-sm">
          <span>{t("component.reportDialog.topicSuggestedNone")}</span>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={t("videoEdit.undo")}
            title={t("videoEdit.undo")}
            onClick={() => choose(undefined)}
          >
            <ArrowCounterClockwiseIcon />
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor={fieldId} className="sr-only">
            {t("component.reportDialog.topicSuggest")}
          </label>
          <Combobox
            items={items}
            value={suggested ?? null}
            onValueChange={(next) => choose(next ?? undefined)}
            itemToStringLabel={topicLabel}
            limit={60}
            autoHighlight
          >
            <ComboboxInput
              id={fieldId}
              className="min-w-0 flex-1 basis-48 capitalize"
              placeholder={t("component.reportDialog.topicSuggest")}
              showClear={suggested !== undefined}
            />
            <ComboboxContent>
              <ComboboxEmpty>{t("curation.topics.empty")}</ComboboxEmpty>
              <ComboboxList>
                {(id: string) => (
                  <ComboboxItem key={id} value={id} className="capitalize">
                    {topicLabel(id)}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          {original && (
            <Button variant="ghost" size="sm" onClick={() => choose(null)}>
              {t("component.reportDialog.topicSuggestNone")}
            </Button>
          )}
        </div>
      )}
      {!user && <SignInHint />}
    </Panel>
  )
}

/**
 * Signed in, the editor applies additions and removals directly; a removal the
 * server refuses (someone else added it) lands in the report instead. Signed
 * out, people mark who's wrong and suggest who's missing.
 */
function MentionPanel({
  video,
  value,
  onChange,
}: {
  video: Video
  value: MentionSuggestion
  onChange: (value: MentionSuggestion) => void
}) {
  const { t } = useT()
  const user = useAuth((state) => state.user)
  const preferEnglish = useSettings((state) => state.useEnglishName)
  const label = (channel: ChannelSummary) => channelName(channel, preferEnglish)
  const removing = new Set(value.remove.map((channel) => channel.id))

  const flag = (channel: ChannelSummary) =>
    onChange({
      ...value,
      remove: removing.has(channel.id)
        ? value.remove
        : [...value.remove, channel],
    })
  const unflag = (channel: ChannelSummary) =>
    onChange({
      ...value,
      remove: value.remove.filter((item) => item.id !== channel.id),
    })

  if (can(user, "mention.add"))
    return (
      <Panel>
        <p className="text-xs text-muted-foreground">
          {t("component.reportDialog.fixedDirectly")}
        </p>
        <MentionEditor video={video} onRefused={flag} />
        {value.remove.length > 0 && (
          <div className="grid gap-1.5">
            <p className="text-xs text-muted-foreground">
              {t("component.reportDialog.mentionsFlagged")}
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {value.remove.map((channel) => (
                <ChannelChip
                  key={channel.id}
                  channel={channel}
                  label={label(channel)}
                  action={t("component.reportDialog.mentionsUnmark", {
                    name: label(channel),
                  })}
                  onAction={() => unflag(channel)}
                />
              ))}
            </ul>
          </div>
        )}
      </Panel>
    )

  return (
    <SuggestMentions
      video={video}
      value={value}
      onChange={onChange}
      label={label}
    />
  )
}

function SuggestMentions({
  video,
  value,
  onChange,
  label,
}: {
  video: Video
  value: MentionSuggestion
  onChange: (value: MentionSuggestion) => void
  label: (channel: ChannelSummary) => string
}) {
  const { t } = useT()
  const fieldId = useId()
  const [input, setInput] = useState("")
  const mentions = useQuery({
    queryKey: ["video-mentions", video.id],
    queryFn: ({ signal }) => api.curation.videoMentions(video.id, signal),
    staleTime: 30_000,
    retry: false,
  })
  const query = useDebounced(input.trim(), 250)
  const search = useQuery({
    queryKey: ["autocomplete", query],
    queryFn: ({ signal }) => api.autocomplete(query, signal),
    enabled: query.length >= 2,
    staleTime: 5 * 60_000,
    placeholderData: (previous) => previous,
  })

  const removing = new Set(value.remove.map((channel) => channel.id))
  const taken = new Set([
    video.channel.id,
    ...(mentions.data ?? []).map((channel) => channel.id),
    ...value.add.map((channel) => channel.id),
  ])
  const results = (query.length >= 2 ? (search.data?.vtuber ?? []) : []).filter(
    (channel) => !taken.has(channel.id)
  )

  const toggleRemove = (channel: ChannelSummary) =>
    onChange({
      ...value,
      remove: removing.has(channel.id)
        ? value.remove.filter((item) => item.id !== channel.id)
        : [...value.remove, channel],
    })

  return (
    <Panel busy={mentions.isPending}>
      {mentions.isError ? (
        <p className="text-sm text-destructive">
          {t("curation.errors.readFailed")}
        </p>
      ) : (
        !!mentions.data?.length && (
          <ul className="flex flex-wrap gap-1.5">
            {mentions.data.map((channel) => {
              const marked = removing.has(channel.id)
              return (
                <ChannelChip
                  key={channel.id}
                  channel={channel}
                  label={label(channel)}
                  struck={marked}
                  action={
                    marked
                      ? t("component.reportDialog.mentionsUnmark", {
                          name: label(channel),
                        })
                      : t("component.reportDialog.mentionsMarkRemove", {
                          name: label(channel),
                        })
                  }
                  actionIcon={
                    marked ? <ArrowCounterClockwiseIcon /> : undefined
                  }
                  onAction={() => toggleRemove(channel)}
                />
              )
            })}
          </ul>
        )
      )}
      {value.add.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {value.add.map((channel) => (
            <ChannelChip
              key={channel.id}
              channel={channel}
              label={`+ ${label(channel)}`}
              action={t("component.reportDialog.mentionsUnsuggest", {
                name: label(channel),
              })}
              onAction={() =>
                onChange({
                  ...value,
                  add: value.add.filter((item) => item.id !== channel.id),
                })
              }
            />
          ))}
        </ul>
      )}
      <SuggestField
        id={fieldId}
        aria-label={t("component.reportDialog.mentionsSuggestAdd")}
        value={input}
        onValueChange={setInput}
        items={results}
        itemKey={(channel) => channel.id}
        itemText={label}
        placeholder={t("component.reportDialog.mentionsSuggestAdd")}
        popupClassName="w-(--anchor-width)"
        onPick={(channel) => {
          setInput("")
          onChange({ ...value, add: [...value.add, channel] })
        }}
        empty={
          query.length < 2
            ? t("component.search.typeToSearch")
            : search.isFetching
              ? t("component.search.searching")
              : t("component.search.noMatch")
        }
        renderItem={(channel) => (
          <>
            <ChannelAvatar channel={channel} size={28} />
            <span className="min-w-0 flex-1 truncate">{label(channel)}</span>
            {channel.org && (
              <span className="text-xs text-muted-foreground">
                {channel.org}
              </span>
            )}
          </>
        )}
      />
      <SignInHint />
    </Panel>
  )
}

function ChannelChip({
  channel,
  label,
  struck,
  action,
  actionIcon,
  onAction,
}: {
  channel: ChannelSummary
  label: string
  struck?: boolean
  action: string
  actionIcon?: React.ReactNode
  onAction: () => void
}) {
  return (
    <li
      className={cn(
        "flex h-8 items-center gap-1.5 rounded-full border bg-background pr-1 pl-1 text-sm",
        struck && "border-destructive/40 bg-destructive/5"
      )}
    >
      <ChannelAvatar
        channel={channel}
        size={24}
        className={cn(struck && "opacity-50")}
      />
      <span
        className={cn(
          "max-w-48 truncate",
          struck && "text-muted-foreground line-through"
        )}
      >
        {label}
      </span>
      <Button
        variant="ghost"
        size="icon-xs"
        aria-label={action}
        title={action}
        onClick={onAction}
      >
        {actionIcon ?? <XIcon />}
      </Button>
    </li>
  )
}

function Panel({
  busy,
  children,
}: {
  busy?: boolean
  children?: React.ReactNode
}) {
  return (
    <div className="mb-1 ml-7 grid gap-3">
      {busy && !children ? <Spinner /> : children}
    </div>
  )
}
