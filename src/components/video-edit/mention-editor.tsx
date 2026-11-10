import { useId, useMemo, useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { cn } from "cn"
import { toast } from "sonner"

import { ChannelAvatar } from "@/components/common/channel-avatar"
import {
  LockSimpleIcon,
  PlusIcon,
  SparkleIcon,
  UsersIcon,
  XIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Chip } from "@/components/ui/chip"
import { Spinner } from "@/components/ui/spinner"
import { useDebounced } from "@/hooks/use-debounced"
import { api } from "@/lib/api"
import { reconcileVideoEdits } from "@/lib/curation-cache"
import { useT } from "@/lib/i18n"
import { can } from "@/lib/permissions"
import { queryClient } from "@/lib/queries"
import type { ChannelSummary, Video } from "@/lib/types"
import { channelName } from "@/lib/video"
import { suggestMentions } from "@/lib/video-edit/suggestions"
import { useAuth } from "@/stores/auth"
import { useSettings } from "@/stores/settings"
import { useVideoEditPrefs } from "@/stores/video-edit"
import { SuggestField } from "./suggest-field"
import { cardVariants } from "@/components/ui/card"

const WRITE_TIMEOUT_MS = 20_000

/** One video's participants. Adding or removing one applies at once. */
export function MentionEditor({
  video,
  onRefused,
}: {
  video: Video
  /** A removal the server turned down, as the mention was someone else's. */
  onRefused?: (channel: ChannelSummary) => void
}) {
  const { t } = useT()
  const fieldId = useId()
  const user = useAuth((state) => state.user)
  const preferEnglish = useSettings((state) => state.useEnglishName)
  const recent = useVideoEditPrefs((state) => state.recentMentions)
  const [input, setInput] = useState("")
  // The server won't say who added a mention until a removal fails, so remember
  // those it has refused and those this person has just added.
  const [refused, setRefused] = useState<ReadonlySet<string>>(new Set())
  const canAdd = can(user, "mention.add")
  const mentionsKey = ["video-mentions", video.id]

  const mentions = useQuery({
    queryKey: mentionsKey,
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
  const org = video.channel.org
  const orgChannels = useQuery({
    queryKey: ["org-channel-names", org],
    queryFn: ({ signal }) =>
      api.channels(
        {
          org: org!,
          sort: "suborg",
          order: "asc",
          limit: 100,
          offset: 0,
          type: "vtuber",
        },
        signal
      ),
    enabled: canAdd && !!org,
    staleTime: 60 * 60_000,
    retry: false,
  })

  const present = useMemo(
    () => new Set((mentions.data ?? []).map((channel) => channel.id)),
    [mentions.data]
  )
  const label = (channel: Pick<ChannelSummary, "name" | "english_name">) =>
    channelName(channel, preferEnglish)
  const results = (query.length >= 2 ? (search.data?.vtuber ?? []) : []).filter(
    (channel) => channel.id !== video.channel.id && !present.has(channel.id)
  )
  const quickAdd = useMemo(() => {
    if (!canAdd) return []
    const named = suggestMentions(video, orgChannels.data ?? [], present)
    const recents = recent.filter(
      (channel) =>
        channel.id !== video.channel.id &&
        !present.has(channel.id) &&
        !named.some((other) => other.id === channel.id)
    )
    return [...named, ...recents].slice(0, 8)
  }, [canAdd, video, orgChannels.data, present, recent])

  const add = useMutation({
    mutationFn: (channel: ChannelSummary) =>
      api.curation.addMention(
        video.id,
        channel.id,
        AbortSignal.timeout(WRITE_TIMEOUT_MS)
      ),
    onMutate: (channel) => {
      queryClient.setQueryData<ChannelSummary[]>(mentionsKey, (list) => [
        ...(list ?? []).filter((item) => item.id !== channel.id),
        channel,
      ])
    },
    onSuccess: (_result, channel) => {
      useVideoEditPrefs.getState().rememberMention(channel)
      reconcileVideoEdits({ [video.id]: { addMentions: [channel] } })
      setRefused((set) => {
        const next = new Set(set)
        next.delete(channel.id)
        return next
      })
    },
    onError: (_error, channel) => {
      queryClient.setQueryData<ChannelSummary[]>(mentionsKey, (list) =>
        (list ?? []).filter((item) => item.id !== channel.id)
      )
      toast.error(t("curation.errors.rejected"))
    },
  })

  const remove = useMutation({
    mutationFn: (channel: ChannelSummary) =>
      api.curation.removeMentions(
        video.id,
        [channel.id],
        AbortSignal.timeout(WRITE_TIMEOUT_MS)
      ),
    onSuccess: (count, channel) => {
      if (!count) {
        setRefused((set) => new Set(set).add(channel.id))
        if (onRefused) onRefused(channel)
        else toast.info(t("videoEdit.mentions.notYours"))
        return
      }
      queryClient.setQueryData<ChannelSummary[]>(mentionsKey, (list) =>
        (list ?? []).filter((item) => item.id !== channel.id)
      )
      reconcileVideoEdits({ [video.id]: { removeMentions: [channel.id] } })
      toast(t("videoEdit.mentions.removed", { name: label(channel) }), {
        action: {
          label: t("videoEdit.undo"),
          onClick: () => add.mutate(channel),
        },
      })
    },
    onError: () => toast.error(t("videoEdit.mentions.removeFailed")),
  })

  const addChannel = (channel: ChannelSummary) => {
    setInput("")
    add.mutate(channel)
  }

  return (
    <section
      className={cn(
        cardVariants({ radius: "2xl", padding: "md" }),
        "grid gap-3"
      )}
    >
      <header className="flex items-center gap-2">
        <UsersIcon className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold">
          <label htmlFor={fieldId}>{t("videoEdit.mentions.title")}</label>
        </h2>
        {(mentions.isPending || add.isPending || remove.isPending) && (
          <Spinner />
        )}
      </header>

      {mentions.isError ? (
        <div role="alert" className="flex flex-wrap items-center gap-2">
          <p className="text-sm text-destructive">
            {t("curation.errors.readFailed")}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void mentions.refetch()}
          >
            {t("curation.tryAgain")}
          </Button>
        </div>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          <Chip render={<li />} tone="muted" avatar>
            <ChannelAvatar channel={video.channel} size={24} />
            <span className="max-w-48 truncate">{label(video.channel)}</span>
            <span className="text-xs text-muted-foreground">
              {t("videoEdit.mentions.host")}
            </span>
          </Chip>
          {mentions.data?.map((channel) => {
            const removing =
              remove.isPending && remove.variables?.id === channel.id
            const blocked =
              refused.has(channel.id) && !can(user, "mention.remove-any")
            return (
              <Chip
                key={channel.id}
                render={<li />}
                avatar
                className={cn(
                  blocked ? "pr-3" : "pr-1",
                  removing && "opacity-50"
                )}
              >
                <ChannelAvatar channel={channel} size={24} />
                <span className="max-w-48 truncate">{label(channel)}</span>
                {blocked ? (
                  <LockSimpleIcon
                    className="size-3.5 text-muted-foreground"
                    aria-label={t("videoEdit.mentions.notYours")}
                  />
                ) : (
                  canAdd && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      disabled={removing}
                      aria-label={t("videoEdit.mentions.remove", {
                        name: label(channel),
                      })}
                      title={t("videoEdit.mentions.remove", {
                        name: label(channel),
                      })}
                      onClick={() => remove.mutate(channel)}
                    >
                      <XIcon />
                    </Button>
                  )
                )}
              </Chip>
            )
          })}
        </ul>
      )}

      {canAdd && (
        <SuggestField
          id={fieldId}
          value={input}
          onValueChange={setInput}
          items={results}
          itemKey={(channel) => channel.id}
          itemText={label}
          placeholder={t("curation.pickChannels")}
          popupClassName="w-(--anchor-width)"
          onPick={addChannel}
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
      )}

      {quickAdd.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <SparkleIcon
            className="size-3.5 text-muted-foreground"
            aria-hidden="true"
          />
          {quickAdd.map((channel) => (
            <Button
              key={channel.id}
              variant="secondary"
              size="xs"
              aria-label={t("videoEdit.mentions.add", { name: label(channel) })}
              onClick={() => addChannel(channel)}
            >
              <PlusIcon data-icon="inline-start" />
              {label(channel)}
            </Button>
          ))}
        </div>
      )}
    </section>
  )
}
