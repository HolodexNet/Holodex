import { useEffect, useId, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { SimpleSelect } from "@/components/common/simple-select"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"
import { reconcileVideoEdits } from "@/lib/curation-cache"
import { useT } from "@/lib/i18n"
import { can } from "@/lib/permissions"
import {
  SMART_ACTIONS,
  checkSmartPlan,
  planSmartAction,
  runSmartPlan,
  smartBody,
  type SmartActionId,
  type SmartOutcome,
  type SmartPlan,
  type SmartServices,
} from "@/lib/selection-actions/smart"
import { smartCacheEdits } from "@/lib/selection-actions/smart-cache"
import type { ChannelSummary } from "@/lib/types"
import { channelName, videoTitle } from "@/lib/video"
import { useAuth } from "@/stores/auth"
import { useSelection } from "@/stores/selection"
import {
  useSelectionAction,
  type SelectionActionRequest,
} from "@/stores/selection-action"
import { useSettings } from "@/stores/settings"

export function SmartActionDialog({
  request,
  action,
}: {
  request: SelectionActionRequest
  action: SmartActionId
}) {
  const { t, tc } = useT()
  const definition = SMART_ACTIONS.find((entry) => entry.id === action)!
  const destructive = "destructive" in definition && definition.destructive
  const user = useAuth((state) => state.user)
  const preferEnglish = useSettings((state) => state.useEnglishName)
  const [targetVideoId, setTargetVideoId] = useState(
    request.page.pageVideoId ?? ""
  )
  const [channelId, setChannelId] = useState(request.page.pageChannelId ?? "")
  const [includePageVideo, setIncludePageVideo] = useState(false)
  const [confirmation, setConfirmation] = useState("")
  const [plan, setPlan] = useState<SmartPlan | null>(null)
  const [outcome, setOutcome] = useState<SmartOutcome | null>(null)
  const [phase, setPhase] = useState<"params" | "preview" | "results">("params")
  const [busy, setBusy] = useState<"prepare" | "run" | "check" | null>(null)
  const [stopping, setStopping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const controller = useRef<AbortController | null>(null)
  const mounted = useRef(false)
  const targetInputId = useId()
  const confirmInputId = useId()
  const channelInputId = useId()
  const sessionValid =
    user !== null &&
    String(user.id) === request.userId &&
    can(user, "smart.edit")
  const videos = request.entries.map((entry) => entry.video)
  const ids = videos.map((video) => video.id)
  const channels = useQuery({
    queryKey: ["curation-mention-targets", request.id],
    queryFn: ({ signal }) => api.curation.mentions(ids, signal),
    enabled: action === "dissociate-channel" && sessionValid,
    staleTime: 0,
    retry: false,
  })
  const targetChannels = new Map<string, ChannelSummary>()
  for (const participants of Object.values(channels.data ?? {}))
    for (const channel of participants) targetChannels.set(channel.id, channel)
  if (
    request.page.pageChannelId &&
    !targetChannels.has(request.page.pageChannelId)
  )
    targetChannels.set(request.page.pageChannelId, {
      id: request.page.pageChannelId,
      name: request.page.pageChannelId,
    })
  const allowed = () => {
    const session = useAuth.getState()
    return (
      !!session.jwt &&
      session.user !== null &&
      String(session.user.id) === request.userId &&
      can(session.user, "smart.edit")
    )
  }
  useEffect(() => {
    mounted.current = true
    const unsubscribe = useAuth.subscribe((session) => {
      if (
        !session.jwt ||
        !session.user ||
        String(session.user.id) !== request.userId ||
        !can(session.user, "smart.edit")
      )
        controller.current?.abort()
    })
    return () => {
      mounted.current = false
      controller.current?.abort()
      unsubscribe()
    }
  }, [request.userId])

  const services: SmartServices = {
    read: (id, body, signal, verification) =>
      api.curation.smartSnapshot(id, body, signal, videos, verification),
    execute: api.curation.smart,
    allowed,
    forbidden: async () => {
      if (!allowed()) return
      const session = await api.refreshSession(AbortSignal.timeout(10_000))
      if (allowed()) useAuth.getState().setSession(session)
    },
  }
  const errorText = (key: string) =>
    t(`curation.smartErrors.${key}`, {
      minimum: definition.minimum,
      maximum: definition.maximum,
    })
  const messageFor = (failure: unknown) =>
    failure instanceof Error &&
    [
      "tooFew",
      "tooMany",
      "streamsOnly",
      "noPlaceholders",
      "targetRequired",
      "channelRequired",
      "participantTypeUnknown",
      "videoMissing",
      "tooManyChanges",
    ].includes(failure.message)
      ? failure.message
      : "readFailed"
  const prepare = async () => {
    if (controller.current || !allowed()) return
    const abort = new AbortController()
    controller.current = abort
    setBusy("prepare")
    setError(null)
    try {
      const body = smartBody(
        action,
        videos,
        { targetVideoId, channelId, includePageVideo },
        request.page
      )
      const snapshot = await services.read(action, body, abort.signal)
      abort.signal.throwIfAborted()
      if (!allowed() || !mounted.current) return
      setPlan(planSmartAction(action, body, snapshot))
      setOutcome(null)
      setConfirmation("")
      setPhase("preview")
    } catch (failure) {
      if (mounted.current && !abort.signal.aborted)
        setError(messageFor(failure))
    } finally {
      controller.current = null
      if (mounted.current) setBusy(null)
    }
  }
  const reconcile = (currentPlan: SmartPlan, result: SmartOutcome) => {
    reconcileVideoEdits(smartCacheEdits(currentPlan, result))
    const completed = new Set(
      result.items
        .filter((item) => item.state === "confirmed")
        .map((item) => item.id)
    )
    useSelection
      .getState()
      .removeCompleted(
        request.entries.filter((entry) => completed.has(entry.video.id))
      )
    if (mounted.current) setOutcome(result)
  }
  const confirmedDestruction =
    !plan ||
    action !== "remove-mentions" ||
    plan.body.videoIds.length <= 10 ||
    confirmation.trim() === String(plan.body.videoIds.length)
  const run = async () => {
    if (!plan || controller.current || !allowed() || !confirmedDestruction)
      return
    const abort = new AbortController()
    controller.current = abort
    setBusy("run")
    setStopping(false)
    setError(null)
    setPhase("results")
    try {
      const result = await runSmartPlan(plan, services, abort.signal)
      reconcile(plan, result)
    } catch {
      if (mounted.current) setError("unknown")
    } finally {
      controller.current = null
      if (mounted.current) setBusy(null)
    }
  }
  const check = async () => {
    if (!plan || !outcome || controller.current) return
    const abort = new AbortController()
    controller.current = abort
    setBusy("check")
    try {
      const checked = await checkSmartPlan(
        plan,
        services,
        outcome.acknowledged,
        AbortSignal.any([abort.signal, AbortSignal.timeout(20_000)])
      )
      reconcile(plan, { ...outcome, ...checked })
    } finally {
      controller.current = null
      if (mounted.current) setBusy(null)
    }
  }
  const allConfirmed = outcome?.items.every(
    (item) => item.state === "confirmed"
  )
  const updatedCount =
    outcome?.items.filter((item) => item.state === "confirmed").length ?? 0
  const unconfirmed = outcome?.items.some((item) => item.state === "unverified")
  const resultError =
    error ?? (outcome?.error === "unknown" ? undefined : outcome?.error)
  const target = plan?.before.videos.find(
    (video) => video.id === plan.body.targetVideoId
  )
  const summary = plan
    ? tc(
        `curation.smartSummary.${action}`,
        plan.body.videoIds.length,
        {
          count: plan.body.videoIds.length,
          target: target
            ? videoTitle(target, preferEnglish)
            : targetChannels.get(plan.body.channelId ?? "")
              ? channelName(
                  targetChannels.get(plan.body.channelId!)!,
                  preferEnglish
                )
              : (plan.body.channelId ?? ""),
        }
      )
    : ""

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
          <DialogTitle>{t(definition.label)}</DialogTitle>
          <DialogDescription>
            {t(`curation.smartDescription.${action}`)}
          </DialogDescription>
        </DialogHeader>
        {!sessionValid && (
          <p role="alert" className="text-destructive">
            {errorText("sessionChanged")}
          </p>
        )}
        {resultError && (
          <p role="alert" className="text-destructive">
            {errorText(resultError)}
          </p>
        )}
        {phase === "params" ? (
          <div className="grid gap-3">
            <p className="text-xs text-muted-foreground">
              {t("curation.smartLimits", {
                minimum: definition.minimum,
                maximum: definition.maximum,
              })}
            </p>
            {action === "dissociate-video" && (
              <>
                <label htmlFor={targetInputId}>
                  {t("curation.targetVideo")}
                </label>
                <SimpleSelect
                  aria-label={t("curation.targetVideo")}
                  value={ids.includes(targetVideoId) ? targetVideoId : "custom"}
                  onChange={(value) =>
                    setTargetVideoId(value === "custom" ? "" : value)
                  }
                  options={[
                    { value: "custom", label: t("curation.otherVideo") },
                    ...videos.map((video) => ({
                      value: video.id,
                      label: videoTitle(video, preferEnglish),
                    })),
                  ]}
                />
                <Input
                  id={targetInputId}
                  value={targetVideoId}
                  onChange={(event) => setTargetVideoId(event.target.value)}
                  placeholder={t("curation.videoIdOrUrl")}
                />
                <p className="text-xs text-muted-foreground">
                  {t("curation.targetExcluded")}
                </p>
              </>
            )}
            {action === "dissociate-channel" && (
              <>
                <label htmlFor={channelInputId}>
                  {t("curation.targetChannel")}
                </label>
                <SimpleSelect
                  id={channelInputId}
                  value={channelId}
                  onChange={setChannelId}
                  options={[
                    { value: "", label: t("curation.chooseChannel") },
                    ...[...targetChannels.values()].map((channel) => ({
                      value: channel.id,
                      label: channelName(channel, preferEnglish),
                    })),
                  ]}
                />
                {channels.isPending && (
                  <p role="status">{t("curation.preparing")}</p>
                )}
                {channels.isError && (
                  <>
                    <p role="alert">{errorText("readFailed")}</p>
                    <Button
                      variant="outline"
                      onClick={() => void channels.refetch()}
                    >
                      {t("curation.tryAgain")}
                    </Button>
                  </>
                )}
              </>
            )}
            {request.page.pageVideoId &&
              !ids.includes(request.page.pageVideoId) &&
              ["merge-participants", "make-simulcast", "make-refer"].includes(
                action
              ) && (
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={includePageVideo}
                    onCheckedChange={setIncludePageVideo}
                  />
                  {t("curation.includePageVideo")}
                </label>
              )}
          </div>
        ) : (
          plan && (
            <>
              <p className="font-medium">{summary}</p>
              {action === "merge-participants" && (
                <p className="text-sm text-muted-foreground">
                  {plan.participants
                    .map((channel) => channelName(channel, preferEnglish))
                    .join(", ") || t("curation.noParticipants")}
                </p>
              )}
              {target && (
                <p className="text-xs text-muted-foreground">
                  {t("curation.targetExcluded")}
                </p>
              )}
              <ul className="max-h-[35dvh] divide-y overflow-y-auto rounded-xl border px-3">
                {plan.body.videoIds.map((id) => {
                  const video = plan.before.videos.find(
                    (entry) => entry.id === id
                  )!
                  const result = outcome?.items.find((entry) => entry.id === id)
                  return (
                    <li
                      key={id}
                      className="flex items-center justify-between gap-3 py-3 text-sm"
                    >
                      <span
                        className="min-w-0 truncate"
                        title={videoTitle(video, preferEnglish)}
                      >
                        {videoTitle(video, preferEnglish)}
                      </span>
                      {result && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {t(`curation.smartStates.${result.state}`)}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
              {phase === "preview" &&
                action === "remove-mentions" &&
                plan.body.videoIds.length > 10 && (
                  <div className="grid gap-2">
                    <label htmlFor={confirmInputId}>
                      {t("curation.confirmRemoval", {
                        count: plan.body.videoIds.length,
                      })}
                    </label>
                    <Input
                      id={confirmInputId}
                      value={confirmation}
                      onChange={(event) => setConfirmation(event.target.value)}
                      inputMode="numeric"
                      autoComplete="off"
                    />
                  </div>
                )}
              {phase === "results" && (
                <p
                  role="status"
                  aria-live="polite"
                  className="text-sm text-muted-foreground"
                >
                  {busy === "run"
                    ? t(
                        stopping ? "curation.stopping" : "curation.smartRunning"
                      )
                    : busy === "check"
                      ? t("curation.smartChecking")
                      : allConfirmed
                        ? tc("curation.updatedVideos", updatedCount)
                        : t("curation.partialUpdatedVideos", {
                            done: updatedCount,
                            total: plan.body.videoIds.length,
                          })}
                </p>
              )}
              {phase === "results" && !busy && unconfirmed && (
                <p className="text-sm text-muted-foreground">
                  {t("curation.smartUnconfirmed")}
                </p>
              )}
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
                    (action === "dissociate-channel" &&
                      (!channelId || !channels.data))
                  }
                  onClick={() => void prepare()}
                >
                  {t(busy ? "curation.preparing" : "curation.previewButton")}
                </Button>
              )}
              {phase === "preview" && (
                <>
                  <Button
                    variant="outline"
                    disabled={!!busy}
                    onClick={() => setPhase("params")}
                  >
                    {t("curation.back")}
                  </Button>
                  <Button
                    variant={destructive ? "destructive" : "default"}
                    disabled={!!busy || !sessionValid || !confirmedDestruction}
                    onClick={() => void run()}
                  >
                    {t("curation.apply")}
                  </Button>
                </>
              )}
              {phase === "results" && outcome && !allConfirmed && (
                <>
                  {outcome.attempted &&
                    !outcome.items.some((item) => item.state === "failed") && (
                      <Button
                        variant="outline"
                        disabled={!!busy}
                        onClick={() => void check()}
                      >
                        {t("curation.checkResults")}
                      </Button>
                    )}
                  {!outcome.acknowledged && (
                    <Button
                      disabled={!!busy || !sessionValid}
                      onClick={() => {
                        setPhase("params")
                        setOutcome(null)
                        setError(null)
                      }}
                    >
                      {t("curation.reviewAgain")}
                    </Button>
                  )}
                </>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
