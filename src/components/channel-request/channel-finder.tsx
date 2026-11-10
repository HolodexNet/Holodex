import { useId, useRef, type ReactNode } from "react"
import { Link } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { cn } from "cn"

import { ChannelAvatar } from "@/components/common/channel-avatar"
import {
  ArrowSquareOutIcon,
  CaretRightIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  PencilSimpleIcon,
  WarningIcon,
  XIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Callout } from "@/components/ui/callout"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useDebounced } from "@/hooks/use-debounced"
import { api, ApiError } from "@/lib/api"
import {
  isAddKind,
  listedChannelInput,
  lookupKey,
  parseChannelInput,
  type ChannelInput,
  type RequestKind,
} from "@/lib/channel-request"
import { useT } from "@/lib/i18n"
import { formatCount } from "@/lib/time"
import type { AutocompleteChannel, Channel, ChannelType } from "@/lib/types"
import { channelName } from "@/lib/video"
import { useSettings } from "@/stores/settings"

export type LookupStatus =
  "idle" | "checking" | "listed" | "unlisted" | "failed"

export interface ChannelLookup {
  input: ChannelInput
  /** Whether the linked channel is on Holodex; "idle" without a link. */
  status: LookupStatus
  channel?: Channel
  /** Listed channels whose names match what was typed. */
  matches: AutocompleteChannel[]
  query: string
  searching: boolean
  /** The matches are still those of an earlier query. */
  stale: boolean
}

/**
 * Checks a pasted link against Holodex, and searches listed channels by name
 * for plain text, or for a handle Holodex doesn't know (it may only have the
 * channel under its id).
 */
export function useChannelLookup(text: string): ChannelLookup {
  const input = parseChannelInput(text)
  const key = lookupKey(input)
  const settledKey = useDebounced(key, 300)
  const lookup = useQuery({
    queryKey: ["channel", settledKey],
    queryFn: ({ signal }) => api.channel(settledKey, signal),
    enabled: settledKey !== "",
    staleTime: 20 * 60_000,
  })

  let status: LookupStatus = "idle"
  if (key) {
    if (key !== settledKey || lookup.isPending) status = "checking"
    // Handles can resolve to channels only known as someone's collab guest.
    else if (lookup.isSuccess)
      status =
        lookup.data?.id && lookup.data.type !== "external"
          ? "listed"
          : "unlisted"
    else
      status =
        lookup.error instanceof ApiError && lookup.error.status === 404
          ? "unlisted"
          : "failed"
  }

  const query =
    input.kind === "name"
      ? input.query
      : input.kind === "handle" && status === "unlisted"
        ? input.handle
        : ""
  const settledQuery = useDebounced(query, 250)
  const search = useQuery({
    queryKey: ["autocomplete-channels", settledQuery],
    queryFn: ({ signal }) => api.autocompleteChannels(settledQuery, signal),
    enabled: settledQuery.length >= 2,
    staleTime: 5 * 60_000,
    placeholderData: (previous) => previous,
  })
  const active = query.length >= 2

  return {
    input,
    status,
    channel: status === "listed" ? lookup.data : undefined,
    matches: active
      ? (search.data ?? []).filter((channel) => channel.type !== "external")
      : [],
    query: active ? query : "",
    searching: active && (query !== settledQuery || search.isFetching),
    stale: query !== settledQuery || search.isPlaceholderData,
  }
}

/**
 * The one box for finding the channel: paste its link, or type a name. Below
 * it says straight away whether the channel is on Holodex, and what that
 * means for the request.
 */
export function ChannelFinder({
  id,
  kind,
  value,
  onChange,
  onKindChange,
  lookup,
  error,
}: {
  id: string
  kind: RequestKind
  value: string
  onChange: (value: string) => void
  onKindChange: (kind: RequestKind) => void
  lookup: ChannelLookup
  /** A problem to point out, once a send has been tried. */
  error?: string
}) {
  const { t } = useT()
  const statusId = useId()
  const localRef = useRef<HTMLInputElement>(null)
  const add = isAddKind(kind)
  const busy = lookup.status === "checking" || lookup.searching

  const clear = () => {
    onChange("")
    localRef.current?.focus()
  }

  return (
    <div className="grid gap-2" data-invalid={!!error || undefined}>
      <Label htmlFor={id}>{t("channelRequest.ChannelLabel")}</Label>
      <InputGroup className="h-10">
        <InputGroupAddon>
          <MagnifyingGlassIcon />
        </InputGroupAddon>
        <InputGroupInput
          ref={localRef}
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={
            add
              ? t("channelRequest.ChannelPlaceholder")
              : t("channelRequest.ChannelPickPlaceholder")
          }
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          aria-invalid={!!error || undefined}
          aria-describedby={statusId}
        />
        {(busy || value) && (
          <InputGroupAddon align="inline-end">
            {busy && <Spinner className="size-4" />}
            {value && (
              <InputGroupButton
                size="icon-xs"
                aria-label={t("channelRequest.finder.clear")}
                title={t("channelRequest.finder.clear")}
                onClick={clear}
              >
                <XIcon />
              </InputGroupButton>
            )}
          </InputGroupAddon>
        )}
      </InputGroup>
      <div id={statusId} aria-live="polite" className="grid gap-2">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <FinderStatus
          kind={kind}
          lookup={lookup}
          hideHint={!!error}
          onPick={(channelId) => onChange(listedChannelInput(channelId))}
          onClear={clear}
          onKindChange={onKindChange}
        />
      </div>
    </div>
  )
}

function FinderStatus({
  kind,
  lookup,
  hideHint,
  onPick,
  onClear,
  onKindChange,
}: {
  kind: RequestKind
  lookup: ChannelLookup
  hideHint: boolean
  onPick: (channelId: string) => void
  onClear: () => void
  onKindChange: (kind: RequestKind) => void
}) {
  const { t } = useT()
  const add = isAddKind(kind)

  switch (lookup.input.kind) {
    case "empty":
      return hideHint ? null : (
        <Hint>
          {add
            ? t("channelRequest.ChannelHint")
            : t("channelRequest.ChannelPickHint")}
        </Hint>
      )
    case "video":
      return <Problem>{t("channelRequest.finder.videoLink")}</Problem>
    case "vanity":
      return <Problem>{t("channelRequest.finder.vanityLink")}</Problem>
    case "invalid":
      return <Problem>{t("channelRequest.ChannelURLErrorFeedback")}</Problem>
    case "name":
      return <Matches kind={kind} lookup={lookup} onPick={onPick} />
  }

  switch (lookup.status) {
    case "checking":
      return <Hint>{t("channelRequest.finder.checking")}</Hint>
    case "failed":
      return <Hint>{t("channelRequest.finder.lookupFailed")}</Hint>
    case "listed":
      return lookup.channel ? (
        <ListedChannel
          channel={lookup.channel}
          add={add}
          onClear={onClear}
          onFix={() => onKindChange("update")}
        />
      ) : null
    case "unlisted":
      if (add)
        return (
          <>
            <p className="flex items-start gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
              <CheckCircleIcon className="mt-0.5 size-4 shrink-0" />
              {t("channelRequest.finder.notListed")}
            </p>
            {/* A handle Holodex doesn't know may still be a listed channel. */}
            {lookup.matches.length > 0 && (
              <Matches kind={kind} lookup={lookup} onPick={onPick} />
            )}
          </>
        )
      return (
        <Callout tone="warning">
          <WarningIcon />
          <div className="grid min-w-0 flex-1 gap-2">
            <p>
              {kind === "update"
                ? t("channelRequest.finder.notListedUpdate")
                : t("channelRequest.finder.notListedRemove")}
            </p>
            {kind === "update" && (
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onKindChange("vtuber")}
                >
                  {t("channelRequest.finder.addVtuberInstead")}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onKindChange("clipper")}
                >
                  {t("channelRequest.finder.addClipperInstead")}
                </Button>
              </div>
            )}
          </div>
        </Callout>
      )
    default:
      return null
  }
}

function Hint({ children }: { children: ReactNode }) {
  return <p className="text-sm text-pretty text-muted-foreground">{children}</p>
}

function Problem({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-2 text-sm text-destructive">
      <WarningIcon className="mt-0.5 size-4 shrink-0" />
      {children}
    </p>
  )
}

function useTypeLabel() {
  const { t } = useT()
  return (type?: ChannelType | null) =>
    type === "vtuber"
      ? t("views.channels.tabs.Vtuber")
      : type === "subber"
        ? t("views.channels.tabs.Subber")
        : null
}

/** Listed channels matching a name; picking one checks it like a link. */
function Matches({
  kind,
  lookup,
  onPick,
}: {
  kind: RequestKind
  lookup: ChannelLookup
  onPick: (channelId: string) => void
}) {
  const { t } = useT()
  const preferEnglish = useSettings((s) => s.useEnglishName)
  const typeLabel = useTypeLabel()
  const add = isAddKind(kind)

  if (!lookup.query)
    return (
      <Hint>
        {add
          ? t("channelRequest.ChannelHint")
          : t("channelRequest.ChannelPickHint")}
      </Hint>
    )

  return (
    <div className="grid gap-2">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {add
          ? t("channelRequest.finder.matchesHeading")
          : t("channelRequest.finder.pickHeading")}
      </p>
      {lookup.matches.length > 0 ? (
        <ul
          className={cn(
            "divide-y overflow-hidden rounded-2xl border bg-card transition-opacity",
            lookup.stale && "opacity-60"
          )}
        >
          {lookup.matches.map((channel) => (
            <li key={channel.id}>
              <button
                type="button"
                onClick={() => onPick(channel.id)}
                className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
              >
                <ChannelAvatar channel={channel} size={32} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {channelName(channel, preferEnglish)}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {[channel.org, typeLabel(channel.type)]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
                <CaretRightIcon className="size-4 shrink-0 text-muted-foreground" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <Hint>
          {lookup.searching
            ? t("channelRequest.finder.searching")
            : t("channelRequest.finder.noMatches", { query: lookup.query })}
        </Hint>
      )}
      {add && lookup.input.kind === "name" && (
        <Hint>{t("channelRequest.finder.pasteLink")}</Hint>
      )}
    </div>
  )
}

/**
 * The channel the link points to. Asking to add it is moot, so that says so
 * and offers what helps instead; for updates and removals it's the selection.
 */
function ListedChannel({
  channel,
  add,
  onClear,
  onFix,
}: {
  channel: Channel
  add: boolean
  onClear: () => void
  onFix: () => void
}) {
  const { t, lang } = useT()
  const preferEnglish = useSettings((s) => s.useEnglishName)
  const typeLabel = useTypeLabel()
  const subscribers = Number(channel.subscriber_count)
  const meta = [
    channel.org,
    typeLabel(channel.type),
    subscribers > 0 &&
      t("component.channelInfo.subscriberCount", {
        n: formatCount(subscribers, lang),
      }),
  ].filter(Boolean)

  return (
    <div className="grid gap-3 rounded-2xl border bg-muted/30 p-3 md:p-4">
      <div className="flex items-center gap-3">
        <ChannelAvatar channel={channel} size={44} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">
            {channelName(channel, preferEnglish)}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {meta.join(" · ")}
          </p>
          {channel.inactive && (
            <p className="text-xs text-muted-foreground">
              {t("component.channelInfo.inactiveChannel")}
            </p>
          )}
        </div>
        {!add && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            {t("channelRequest.finder.change")}
          </Button>
        )}
      </div>
      {add && (
        <>
          <p className="flex items-start gap-2 text-sm">
            <CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-brand" />
            <span>
              <strong className="font-semibold">
                {t("channelRequest.finder.listed")}.
              </strong>{" "}
              {t("channelRequest.finder.listedHint")}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              nativeButton={false}
              render={
                <Link
                  to={`/channel/${channel.id}`}
                  target="_blank"
                  rel="noopener"
                />
              }
            >
              <ArrowSquareOutIcon data-icon="inline-start" />
              {t("channelRequest.finder.openChannel")}
            </Button>
            <Button size="sm" variant="outline" onClick={onFix}>
              <PencilSimpleIcon data-icon="inline-start" />
              {t("channelRequest.finder.fixInstead")}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
