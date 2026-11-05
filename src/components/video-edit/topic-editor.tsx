import { useId, useMemo, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

import { LockSimpleIcon, SparkleIcon, TagIcon, XIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Spinner } from "@/components/ui/spinner"
import { api, ApiError } from "@/lib/api"
import { useChannel } from "@/lib/channel-queries"
import { reconcileVideoEdits } from "@/lib/curation-cache"
import { useT } from "@/lib/i18n"
import { can, canChangeTopic } from "@/lib/permissions"
import { queryClient } from "@/lib/queries"
import { planTopicEdit } from "@/lib/selection-actions/topics"
import type { Video } from "@/lib/types"
import { suggestTopics, topicLabel } from "@/lib/video-edit/suggestions"
import { useAuth } from "@/stores/auth"

class TopicNotPermitted extends Error {}

/** One video's topic. Choosing one saves it; there is nothing else to press. */
export function TopicEditor({ video }: { video: Video }) {
  const { t } = useT()
  const fieldId = useId()
  const user = useAuth((state) => state.user)
  const [justSaved, setJustSaved] = useState(false)
  const topicKey = ["video-topic", video.id]

  const current = useQuery({
    queryKey: topicKey,
    queryFn: ({ signal }) => api.curation.topic(video.id, signal),
    staleTime: 30_000,
    retry: false,
  })
  const catalog = useQuery({
    queryKey: ["curation-topics"],
    queryFn: ({ signal }) => api.curation.topics(signal),
    staleTime: 120_000,
    retry: false,
    enabled: !!user,
  })
  const channel = useChannel(video.channel.id, !!user)

  const options = useMemo(
    () =>
      [...(catalog.data ?? [])]
        .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
        .map((topic) => topic.id),
    [catalog.data]
  )
  const topic = current.data?.topic_id ?? null
  const editable = !!current.data && canChangeTopic(user, current.data)
  const suggestions = useMemo(
    () =>
      editable
        ? suggestTopics(video, options, channel.data?.top_topics ?? []).filter(
            (id) => id !== topic
          )
        : [],
    [editable, video, options, channel.data?.top_topics, topic]
  )

  const save = useMutation({
    mutationFn: async (next: string | null) => {
      const result = (await api.curation.setTopics(
        planTopicEdit([video.id], next),
        AbortSignal.timeout(30_000)
      )) as { skipped_video_ids?: string[] } | null
      if (result?.skipped_video_ids?.includes(video.id))
        throw new TopicNotPermitted()
      return next
    },
    onSuccess: (next) => {
      queryClient.setQueryData(topicKey, {
        topic_id: next,
        topic_approver_id: user?.id ?? null,
      })
      reconcileVideoEdits({ [video.id]: { topicId: next } })
      setJustSaved(true)
    },
    onError: (error) => {
      // Someone else may have got there first, so show what is really there now.
      void queryClient.invalidateQueries({ queryKey: topicKey })
      toast.error(
        error instanceof TopicNotPermitted ||
          (error instanceof ApiError && error.status === 403)
          ? t("videoEdit.topic.locked")
          : t("curation.topics.errors.rejected")
      )
    },
  })

  const apply = (next: string | null) => {
    if (next === topic || save.isPending) return
    const previous = topic
    // People cannot clear a topic unless they're a curator, so undoing the very
    // first topic isn't something every account could do.
    const undoable = previous !== null || can(user, "topic.clear")
    save.mutate(next, {
      onSuccess: () => {
        toast.success(
          next
            ? t("curation.topics.resultTopic", { topic: topicLabel(next) })
            : t("videoEdit.topic.cleared"),
          undoable
            ? {
                action: {
                  label: t("videoEdit.undo"),
                  onClick: () => apply(previous),
                },
              }
            : undefined
        )
      },
    })
  }

  return (
    <section className="grid gap-3 rounded-2xl border bg-card p-4">
      <header className="flex items-center gap-2">
        <TagIcon className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">
          <label htmlFor={fieldId}>{t("videoEdit.topic.title")}</label>
        </h2>
        {(save.isPending || current.isPending) && <Spinner />}
        {justSaved && !save.isPending && (
          <span className="text-xs text-muted-foreground">
            {t("videoEdit.saved")}
          </span>
        )}
      </header>

      {current.isError ? (
        <div role="alert" className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-destructive">
            {t("videoEdit.topic.loadFailed")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void current.refetch()}
          >
            {t("curation.topics.tryAgain")}
          </Button>
        </div>
      ) : editable ? (
        <>
          <div className="flex items-center gap-2">
            <Combobox
              items={options}
              value={topic}
              onValueChange={(next) => {
                if (next) apply(next)
              }}
              itemToStringLabel={topicLabel}
              limit={60}
              autoHighlight
              disabled={save.isPending}
            >
              <ComboboxInput
                id={fieldId}
                className="min-w-0 flex-1 capitalize"
                placeholder={
                  catalog.isPending
                    ? t("curation.topics.loading")
                    : t("curation.topics.choose")
                }
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
            {topic && can(user, "topic.clear") && (
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={t("curation.topics.clear")}
                title={t("curation.topics.clear")}
                disabled={save.isPending}
                onClick={() => apply(null)}
              >
                <XIcon />
              </Button>
            )}
          </div>
          {suggestions.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <SparkleIcon
                className="size-3.5 text-muted-foreground"
                aria-hidden="true"
              />
              {suggestions.map((id) => (
                <Button
                  key={id}
                  variant="secondary"
                  size="xs"
                  className="capitalize"
                  disabled={save.isPending}
                  onClick={() => apply(id)}
                >
                  {topicLabel(id)}
                </Button>
              ))}
            </div>
          )}
          {!can(user, "topic.clear") && topic && (
            <p className="text-xs text-muted-foreground">
              {t("videoEdit.topic.ownHint")}
            </p>
          )}
        </>
      ) : (
        <div className="grid gap-1.5">
          <p
            id={fieldId}
            className="text-sm font-medium capitalize"
            aria-live="polite"
          >
            {topic ? topicLabel(topic) : t("videoEdit.topic.none")}
          </p>
          {current.data && user && (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <LockSimpleIcon className="size-3.5 shrink-0" />
              {t("videoEdit.topic.locked")}
            </p>
          )}
        </div>
      )}
    </section>
  )
}
