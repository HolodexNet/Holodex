import { useEffect, useId, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"

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
import { api } from "@/lib/api"
import { reconcileVideoEdits } from "@/lib/curation-cache"
import { useT } from "@/lib/i18n"
import { can } from "@/lib/permissions"
import {
  checkTopicPlan,
  planTopicEdit,
  runTopicPlan,
  type TopicOutcome,
  type TopicPlan,
  type TopicServices,
} from "@/lib/selection-actions/topics"
import { videoTitle } from "@/lib/video"
import { useAuth } from "@/stores/auth"
import { useSelection } from "@/stores/selection"
import {
  useSelectionAction,
  type SelectionActionRequest,
} from "@/stores/selection-action"
import { useSettings } from "@/stores/settings"

export function TopicActionDialog({
  request,
}: {
  request: SelectionActionRequest
}) {
  const { t, tc } = useT()
  const pickerId = useId()
  const user = useAuth((state) => state.user)
  const preferEnglish = useSettings((state) => state.useEnglishName)
  const [topicId, setTopicId] = useState<string | null>(null)
  const [clear, setClear] = useState(false)
  const [plan, setPlan] = useState<TopicPlan | null>(null)
  const [outcome, setOutcome] = useState<TopicOutcome | null>(null)
  const [phase, setPhase] = useState<"params" | "preview" | "results">("params")
  const [busy, setBusy] = useState<"run" | "check" | null>(null)
  const [stopping, setStopping] = useState(false)
  const controller = useRef<AbortController | null>(null)
  const mounted = useRef(false)
  const sessionValid =
    user !== null &&
    String(user.id) === request.userId &&
    can(user, "topic.set")
  const topics = useQuery({
    queryKey: ["curation-topics"],
    queryFn: ({ signal }) => api.curation.topics(signal),
    staleTime: 120_000,
    retry: false,
    enabled: sessionValid,
  })
  const allowed = () => {
    const session = useAuth.getState()
    return (
      !!session.jwt &&
      session.user !== null &&
      String(session.user.id) === request.userId &&
      can(session.user, "topic.set") &&
      (!clear || can(session.user, "topic.clear"))
    )
  }
  useEffect(() => {
    mounted.current = true
    const unsubscribe = useAuth.subscribe((session) => {
      if (
        !session.jwt ||
        !session.user ||
        String(session.user.id) !== request.userId ||
        !can(session.user, "topic.set") ||
        (clear && !can(session.user, "topic.clear"))
      )
        controller.current?.abort()
    })
    return () => {
      mounted.current = false
      controller.current?.abort()
      unsubscribe()
    }
  }, [request.userId, clear])

  const services: TopicServices = {
    execute: api.curation.setTopics,
    read: api.curation.topic,
    allowed,
    forbidden: async () => {
      if (!allowed()) return
      const session = await api.refreshSession(AbortSignal.timeout(10_000))
      if (allowed()) useAuth.getState().setSession(session)
    },
  }
  const reconcile = (current: TopicPlan, result: TopicOutcome) => {
    const confirmed = new Set(
      result.items
        .filter((item) => item.state === "confirmed")
        .map((item) => item.id)
    )
    reconcileVideoEdits(
      Object.fromEntries(
        [...confirmed].map((id) => [id, { topicId: current.topicId }])
      )
    )
    useSelection
      .getState()
      .removeCompleted(
        request.entries.filter((entry) => confirmed.has(entry.video.id))
      )
    if (mounted.current) setOutcome(result)
  }
  const run = async (checking = false) => {
    if (!plan || controller.current || !allowed() || (checking && !outcome))
      return
    const abort = new AbortController()
    controller.current = abort
    setBusy(checking ? "check" : "run")
    setStopping(false)
    setPhase("results")
    try {
      const result = checking
        ? await checkTopicPlan(
            plan,
            services,
            outcome!,
            AbortSignal.any([abort.signal, AbortSignal.timeout(20_000)])
          )
        : await runTopicPlan(plan, services, abort.signal)
      reconcile(plan, result)
    } finally {
      controller.current = null
      if (mounted.current) setBusy(null)
    }
  }
  const unverified = outcome?.items.some((item) => item.state === "unverified")
  const remaining =
    outcome?.items.filter((item) => item.state !== "confirmed") ?? []
  const updatedCount =
    outcome?.items.filter((item) => item.state === "confirmed").length ?? 0
  const options = [
    ...new Set(topics.data?.map((topic) => topic.id) ?? []),
  ].sort()
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) useSelectionAction.getState().close()
      }}
    >
      <DialogContent
        showCloseButton={!busy}
        className="max-h-[calc(100dvh-2rem)] gap-4 overflow-y-auto sm:max-w-xl"
      >
        <DialogHeader>
          <DialogTitle>{t("curation.topics.title")}</DialogTitle>
          <DialogDescription>
            {phase === "results" && plan
              ? plan.topicId === null
                ? t("curation.topics.clear")
                : t("curation.topics.resultTopic", { topic: plan.topicId })
              : t("curation.topics.description")}
          </DialogDescription>
        </DialogHeader>
        {!sessionValid && (
          <p role="alert" className="text-destructive">
            {t("curation.topics.errors.sessionChanged")}
          </p>
        )}
        {outcome?.error && outcome.error !== "unknown" && (
          <p role="alert" className="text-destructive">
            {t(`curation.topics.errors.${outcome.error}`)}
          </p>
        )}
        {phase === "params" ? (
          <div className="grid gap-3">
            {can(user, "topic.clear") && (
              <label className="flex items-center gap-2">
                <Checkbox checked={clear} onCheckedChange={setClear} />
                {t("curation.topics.clear")}
              </label>
            )}
            {!clear && (
              <>
                <label htmlFor={pickerId}>{t("curation.topics.choose")}</label>
                <Combobox
                  items={options}
                  value={topicId}
                  onValueChange={setTopicId}
                  autoHighlight
                >
                  <ComboboxInput
                    id={pickerId}
                    placeholder={t("curation.topics.choose")}
                  />
                  <ComboboxContent>
                    <ComboboxEmpty>{t("curation.topics.empty")}</ComboboxEmpty>
                    <ComboboxList>
                      {(id: string) => (
                        <ComboboxItem key={id} value={id}>
                          {id}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                {topics.isPending && (
                  <p role="status">{t("curation.topics.loading")}</p>
                )}
                {topics.isError && (
                  <div role="alert">
                    <p>{t("curation.topics.loadFailed")}</p>
                    <Button
                      variant="outline"
                      onClick={() => void topics.refetch()}
                    >
                      {t("curation.topics.tryAgain")}
                    </Button>
                  </div>
                )}
              </>
            )}
            {!can(user, "topic.clear") && (
              <p className="text-xs text-muted-foreground">
                {t("curation.topics.userHint")}
              </p>
            )}
          </div>
        ) : (
          plan && (
            <>
              <p className="font-medium" role="status" aria-live="polite">
                {phase === "results" && !busy && outcome
                  ? remaining.length > 0
                    ? t(
                        plan.topicId === null
                          ? "curation.topics.partialCleared"
                          : "curation.topics.partialUpdated",
                        { count: updatedCount, total: plan.videoIds.length }
                      )
                    : tc(
                        plan.topicId === null
                          ? "curation.topics.allCleared"
                          : "curation.topics.allUpdated",
                        updatedCount
                      )
                  : tc(
                      plan.topicId === null
                        ? "curation.topics.clearSummary"
                        : "curation.topics.summary",
                      plan.videoIds.length,
                      { topic: plan.topicId ?? "" }
                    )}
              </p>
              <ul className="max-h-[35dvh] divide-y overflow-y-auto rounded-xl border px-3">
                {plan.videoIds.map((id) => {
                  const video = request.entries.find(
                    (entry) => entry.video.id === id
                  )!.video
                  const result = outcome?.items.find((item) => item.id === id)
                  return (
                    <li
                      key={id}
                      className="flex items-center justify-between gap-3 py-3 text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <p
                          className="truncate"
                          title={videoTitle(video, preferEnglish)}
                        >
                          {videoTitle(video, preferEnglish)}
                        </p>
                        {result?.state === "skipped" && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            {t("curation.topics.skippedReason")}
                          </p>
                        )}
                      </div>
                      {result && (
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {t(
                            result.state === "confirmed" &&
                              plan.topicId === null
                              ? "curation.topics.cleared"
                              : `curation.topics.states.${result.state}`
                          )}
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
              {phase === "results" && (busy || unverified) && (
                <p
                  role="status"
                  aria-live="polite"
                  className="text-sm text-muted-foreground"
                >
                  {t(
                    busy
                      ? stopping
                        ? "curation.topics.stopping"
                        : busy === "check"
                          ? "curation.topics.checking"
                          : "curation.topics.running"
                      : "curation.topics.unconfirmedHint"
                  )}
                </p>
              )}
            </>
          )
        )}
        <DialogFooter>
          {busy ? (
            <Button
              variant="outline"
              disabled={stopping}
              onClick={() => {
                setStopping(true)
                controller.current?.abort()
              }}
            >
              {t(
                stopping ? "curation.topics.stopping" : "curation.topics.stop"
              )}
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => useSelectionAction.getState().close()}
              >
                {t(
                  phase === "results"
                    ? "curation.topics.done"
                    : "selection.close"
                )}
              </Button>
              {phase === "params" && (
                <Button
                  disabled={
                    !sessionValid ||
                    (!clear && (!topicId || !options.includes(topicId))) ||
                    (clear && !can(user, "topic.clear"))
                  }
                  onClick={() => {
                    if (!allowed()) return
                    setPlan(
                      planTopicEdit(
                        outcome
                          ? remaining.map((item) => item.id)
                          : (plan?.videoIds ??
                              request.entries.map((entry) => entry.video.id)),
                        clear ? null : topicId!
                      )
                    )
                    setOutcome(null)
                    setPhase("preview")
                  }}
                >
                  {t("curation.previewButton")}
                </Button>
              )}
              {phase === "preview" && (
                <>
                  <Button variant="outline" onClick={() => setPhase("params")}>
                    {t("curation.back")}
                  </Button>
                  <Button
                    disabled={
                      !sessionValid || (clear && !can(user, "topic.clear"))
                    }
                    onClick={() => void run()}
                  >
                    {t(
                      clear ? "curation.topics.clear" : "curation.topics.save"
                    )}
                  </Button>
                </>
              )}
              {phase === "results" && outcome && (
                <>
                  {unverified && (
                    <Button
                      variant="outline"
                      disabled={!sessionValid}
                      onClick={() => void run(true)}
                    >
                      {t("curation.topics.checkAgain")}
                    </Button>
                  )}
                  {remaining.length > 0 && (
                    <Button
                      disabled={!sessionValid}
                      onClick={() => setPhase("params")}
                    >
                      {t("curation.topics.editRemaining")}
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
