import { useEffect, useId, useRef, useState } from "react"

import { ChannelPicker } from "@/components/common/channel-picker"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { api } from "@/lib/api"
import { reconcileMentionAdditions } from "@/lib/curation-cache"
import { useT } from "@/lib/i18n"
import { can } from "@/lib/permissions"
import { queryClient } from "@/lib/queries"
import {
  MENTION_CHANNEL_LIMIT,
  MENTION_OPERATION_LIMIT,
  MENTION_VIDEO_LIMIT,
  planMentionAdditions,
  runMentionPlan,
  type MentionPlan,
  type MentionResult,
} from "@/lib/selection-actions/mentions"
import type { ChannelSummary, StaticChannel, Video } from "@/lib/types"
import { channelName, videoTitle } from "@/lib/video"
import { useAuth } from "@/stores/auth"
import { useSelection } from "@/stores/selection"
import {
  useSelectionAction,
  type SelectionActionRequest,
} from "@/stores/selection-action"
import { useSettings } from "@/stores/settings"

export function MentionActionDialog({
  request,
}: {
  request: SelectionActionRequest
}) {
  const { t, tc } = useT()
  const pickerId = useId()
  const user = useAuth((state) => state.user)
  const preferEnglish = useSettings((state) => state.useEnglishName)
  const [channelIds, setChannelIds] = useState<string[]>([])
  const [videos, setVideos] = useState<readonly Video[]>(
    request.entries.map((entry) => entry.video)
  )
  const [plan, setPlan] = useState<MentionPlan | null>(null)
  const [results, setResults] = useState<readonly MentionResult[] | null>(null)
  const [phase, setPhase] = useState<"params" | "preview" | "results">("params")
  const [busy, setBusy] = useState<"prepare" | "run" | null>(null)
  const [stopping, setStopping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const controller = useRef<AbortController | null>(null)
  const mounted = useRef(false)
  const sessionValid =
    user !== null &&
    String(user.id) === request.userId &&
    can(user, "mention.add")
  const allowed = () => {
    const session = useAuth.getState()
    return (
      !!session.jwt &&
      session.user !== null &&
      String(session.user.id) === request.userId &&
      can(session.user, "mention.add")
    )
  }
  useEffect(() => {
    mounted.current = true
    const unsubscribe = useAuth.subscribe((session) => {
      if (
        !session.jwt ||
        !session.user ||
        String(session.user.id) !== request.userId ||
        !can(session.user, "mention.add")
      )
        controller.current?.abort()
    })
    return () => {
      mounted.current = false
      controller.current?.abort()
      unsubscribe()
    }
  }, [request.userId])

  const prepare = async (targets = videos) => {
    if (controller.current || !allowed()) return
    const abort = new AbortController()
    controller.current = abort
    setBusy("prepare")
    setError(null)
    try {
      if (targets.length > MENTION_VIDEO_LIMIT) throw new Error("videoLimit")
      const canonical = await api.curation.mentions(
        targets.map((video) => video.id),
        abort.signal
      )
      abort.signal.throwIfAborted()
      if (!allowed()) return
      const next = planMentionAdditions(targets, channelIds, canonical)
      setVideos(targets)
      setPlan(next)
      setResults(null)
      setPhase("preview")
    } catch (failure) {
      if (mounted.current && !abort.signal.aborted)
        setError(
          failure instanceof Error &&
            ["videoLimit", "channelLimit", "operationLimit"].includes(
              failure.message
            )
            ? failure.message
            : "readFailed"
        )
    } finally {
      controller.current = null
      if (mounted.current) setBusy(null)
    }
  }

  const run = async () => {
    if (!plan || controller.current || !allowed()) return
    const abort = new AbortController()
    controller.current = abort
    setBusy("run")
    setPhase("results")
    setError(null)
    setStopping(false)
    try {
      const outcome = await runMentionPlan(
        plan,
        {
          read: api.curation.mentions,
          add: api.curation.addMention,
          allowed,
          forbidden: async () => {
            const session = await api.refreshSession(
              AbortSignal.timeout(10_000)
            )
            if (allowed()) useAuth.getState().setSession(session)
          },
          progress: (progress) => {
            if (mounted.current) setResults(progress)
          },
        },
        abort.signal
      )
      const additions: Record<string, ChannelSummary[]> = {}
      for (const result of outcome.results) {
        if (result.state !== "confirmed" && result.state !== "skipped") continue
        const channel = outcome.mentions[result.operation.videoId]?.find(
          (mention) => mention.id === result.operation.channelId
        )
        if (channel) (additions[result.operation.videoId] ??= []).push(channel)
      }
      reconcileMentionAdditions(additions)
      useSelection
        .getState()
        .removeCompleted(
          request.entries.filter((entry) =>
            outcome.completedIds.includes(entry.video.id)
          )
        )
    } catch {
      if (mounted.current) setError("unknown")
    } finally {
      controller.current = null
      if (mounted.current) setBusy(null)
    }
  }

  const channelLabel = (id: string) => {
    const channel = queryClient.getQueryData<StaticChannel>([
      "channel-info",
      id,
    ])
    return channel ? channelName(channel, preferEnglish) : id
  }
  const remaining = results
    ? videos.filter((video) =>
        results.some(
          (result) =>
            result.operation.videoId === video.id &&
            !["confirmed", "skipped"].includes(result.state)
        )
      )
    : []
  const added =
    results?.filter((result) => result.state === "confirmed").length ?? 0
  const errorText = (key: string) =>
    t(`curation.errors.${key}`, {
      count:
        key === "videoLimit"
          ? MENTION_VIDEO_LIMIT
          : key === "channelLimit"
            ? MENTION_CHANNEL_LIMIT
            : MENTION_OPERATION_LIMIT,
    })
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && busy !== "run") useSelectionAction.getState().close()
      }}
    >
      <DialogContent
        showCloseButton={busy !== "run"}
        className="max-h-[calc(100dvh-2rem)] gap-4 overflow-y-auto sm:max-w-xl"
      >
        <DialogHeader>
          <DialogTitle>{t("curation.addMentions")}</DialogTitle>
          <DialogDescription>
            {tc("curation.description", videos.length)}
          </DialogDescription>
        </DialogHeader>
        {!sessionValid && (
          <p role="alert" className="text-destructive">
            {errorText("sessionChanged")}
          </p>
        )}
        {error && (
          <p role="alert" className="text-destructive">
            {errorText(error)}
          </p>
        )}
        {phase === "params" ? (
          <div className="grid gap-2">
            <label htmlFor={pickerId} className="font-medium">
              {t("curation.channels")}
            </label>
            <ChannelPicker
              id={pickerId}
              value={channelIds}
              onChange={setChannelIds}
              placeholder={t("curation.pickChannels")}
            />
            <p className="text-xs text-muted-foreground">
              {t("curation.limits", {
                videos: MENTION_VIDEO_LIMIT,
                channels: MENTION_CHANNEL_LIMIT,
                requests: MENTION_OPERATION_LIMIT,
              })}
            </p>
          </div>
        ) : (
          plan && (
            <>
              <p className="text-sm font-medium">
                {channelIds.map(channelLabel).join(", ")}
              </p>
              <p
                className="text-sm text-muted-foreground"
                role="status"
                aria-live="polite"
              >
                {phase === "preview"
                  ? tc("curation.previewSummary", plan.requests)
                  : busy === "run"
                    ? t("curation.runningProgress")
                    : tc("curation.mentionResult", added)}
              </p>
              <ul className="max-h-[40dvh] divide-y overflow-y-auto rounded-xl border px-3">
                {plan.videos.map((video) => (
                  <li key={video.id} className="py-3">
                    <p
                      className="truncate font-medium"
                      title={videoTitle(video, preferEnglish)}
                    >
                      {videoTitle(video, preferEnglish)}
                    </p>
                    <ul className="mt-1 grid gap-1 text-xs text-muted-foreground">
                      {plan.operations
                        .filter((operation) => operation.videoId === video.id)
                        .map((operation) => {
                          const result = results?.find(
                            (item) => item.operation === operation
                          )
                          return (
                            <li
                              key={operation.channelId}
                              className="flex flex-wrap justify-between gap-x-3"
                            >
                              <span>{channelLabel(operation.channelId)}</span>
                              <span>
                                {result && result.state !== "skipped"
                                  ? t(`curation.states.${result.state}`)
                                  : t(
                                      `curation.preview.${operation.skip ?? (result ? "existing" : "add")}`
                                    )}
                              </span>
                              {result?.error && (
                                <span className="w-full text-destructive">
                                  {errorText(result.error)}
                                </span>
                              )}
                            </li>
                          )
                        })}
                    </ul>
                  </li>
                ))}
              </ul>
            </>
          )
        )}
        <DialogFooter>
          {busy === "run" ? (
            <Button
              variant="outline"
              disabled={stopping}
              onClick={() => {
                setStopping(true)
                controller.current?.abort()
              }}
            >
              {t(stopping ? "curation.stopping" : "curation.stop")}
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => useSelectionAction.getState().close()}
              >
                {t(phase === "results" ? "curation.done" : "selection.close")}
              </Button>
              {phase === "params" && (
                <Button
                  disabled={
                    !!busy ||
                    !sessionValid ||
                    channelIds.length === 0 ||
                    channelIds.length > MENTION_CHANNEL_LIMIT ||
                    videos.length > MENTION_VIDEO_LIMIT
                  }
                  onClick={() => void prepare()}
                >
                  {t(busy ? "curation.preparing" : "curation.previewButton")}
                </Button>
              )}
              {phase === "preview" && (
                <>
                  <Button variant="outline" onClick={() => setPhase("params")}>
                    {t("curation.back")}
                  </Button>
                  <Button disabled={!sessionValid} onClick={() => void run()}>
                    {t("curation.saveMentions")}
                  </Button>
                </>
              )}
              {phase === "results" && remaining.length > 0 && (
                <Button
                  disabled={!!busy || !sessionValid}
                  onClick={() => void prepare(remaining)}
                >
                  {t(busy ? "curation.preparing" : "curation.reviewRemaining")}
                </Button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
