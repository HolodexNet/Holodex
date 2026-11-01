import { useEffect, useState, type FormEvent } from "react"
import { useSearchParams } from "react-router"
import { ErrorMessage, StateMessage } from "@/components/common/state-message"
import { SimpleSelect } from "@/components/common/simple-select"
import { ChannelPicker } from "@/components/common/channel-picker"
import { MultiCombobox } from "@/components/common/multi-combobox"
import { SongList } from "@/components/music/song-list"
import {
  MagnifyingGlassIcon,
  SlidersHorizontalIcon,
  XIcon,
} from "@/components/icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { useChannelInfos } from "@/lib/queries"
import { useMusicSearch } from "@/lib/musicdex/queries"
import { channelName } from "@/lib/video"
import { useSettings } from "@/stores/settings"
import { MusicNavigation } from "@/components/music/page-header"

const fields = [
  "q",
  "song",
  "artist",
  "channelId",
  "org",
  "suborg",
  "type",
  "sort",
  "from",
  "to",
] as const
type FilterKey = (typeof fields)[number]
type Filters = Record<FilterKey, string>

/** Fields typed by hand; these wait for a pause before searching. */
const textFields = ["q", "song", "artist", "from", "to"] as const
const advancedFields = [
  "song",
  "artist",
  "channelId",
  "org",
  "suborg",
  "type",
  "from",
  "to",
] as const
const TYPING_DELAY = 500
const SORT_KEY = "musicdex-sort"

const list = (value: string) => value.split("\n").filter(Boolean)

function fromParams(params: URLSearchParams): Filters {
  return Object.fromEntries(
    fields.map((field) => [field, params.get(field) ?? ""])
  ) as Filters
}

function storedSort() {
  try {
    return localStorage.getItem(SORT_KEY) ?? ""
  } catch {
    return ""
  }
}

export default function MusicSearch() {
  useDocumentTitle("Music Search")
  const [url, setUrl] = useSearchParams()
  const [draft, setDraft] = useState(() => fromParams(url))
  const [draftUrl, setDraftUrl] = useState(() => url.toString())
  if (draftUrl !== url.toString()) {
    setDraftUrl(url.toString())
    setDraft(fromParams(url))
  }
  const blocked = useSettings((s) => s.blockedChannels)
  const preferEnglish = useSettings((s) => s.useEnglishName)
  const selected = fromParams(url)
  const sort = selected.sort || storedSort() || "relevance"
  const page = Math.min(
    209,
    Math.max(1, Number.parseInt(url.get("page") || "1", 10) || 1)
  )
  const activeAdvanced = advancedFields.filter((field) => selected[field])
  const [advancedOpen, setAdvancedOpen] = useState(activeAdvanced.length > 0)
  const result = useMusicSearch({
    ...selected,
    sort,
    q: selected.q.trim() || "*",
    page,
    per_page: 24,
    blockedIds: blocked.map((channel) => channel.id),
  })
  const songs = result.data?.hits?.map((hit) => hit.document) ?? []

  const channelIds = list(draft.channelId)
  const suborgs = list(draft.suborg)
  const channelInfos = useChannelInfos(list(selected.channelId))
  // Filtering by channel makes the organization pickers redundant.
  const showOrg = channelIds.length === 0
  const showSuborg = showOrg && !!draft.org

  /** Writes the draft, plus any change, to the URL and restarts paging. */
  function commit(patch: Partial<Filters> = {}, replace = false) {
    const merged = { ...draft, ...patch }
    // Suborgs belong to an org, so they never outlive it.
    if (!merged.org || merged.channelId) merged.suborg = ""
    if (merged.channelId) merged.org = ""
    const next = new URLSearchParams()
    for (const field of fields)
      if (merged[field].trim()) next.set(field, merged[field].trim())
    setUrl(next, { replace })
  }
  function update(key: FilterKey, value: string) {
    setDraft((previous) => ({ ...previous, [key]: value }))
  }
  function choose(patch: Partial<Filters>) {
    setDraft((previous) => ({ ...previous, ...patch }))
    commit(patch)
  }

  // Search as people type, once they pause.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (textFields.some((field) => draft[field].trim() !== selected[field]))
        commit({}, true)
    }, TYPING_DELAY)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft])

  function submit(event: FormEvent) {
    event.preventDefault()
    commit()
  }
  function changePage(nextPage: number) {
    const next = new URLSearchParams(url)
    if (nextPage <= 1) next.delete("page")
    else next.set("page", String(nextPage))
    setUrl(next)
  }
  function changeSort(value: string) {
    try {
      localStorage.setItem(SORT_KEY, value)
    } catch {
      /* the preference is optional */
    }
    commit({ sort: value })
  }
  function clearAll() {
    setDraft(fromParams(new URLSearchParams()))
    setUrl(new URLSearchParams())
  }

  const orgs = result.data?.orgs ?? []
  const orgOptions = [
    { value: "", label: "All organizations" },
    ...orgs.map((org) => ({
      value: org.name,
      label: `${org.name.replace(/_/g, " ")} (${org.count.toLocaleString()})`,
    })),
    ...(draft.org && !orgs.some((org) => org.name === draft.org)
      ? [{ value: draft.org, label: draft.org.replace(/_/g, " ") }]
      : []),
  ]

  // What is currently applied, shown as removable chips.
  const chips: { key: string; label: string; clear: () => void }[] = []
  const chip = (key: string, label: string, patch: Partial<Filters>) =>
    chips.push({ key, label, clear: () => choose(patch) })
  if (selected.song) chip("song", `Song: ${selected.song}`, { song: "" })
  if (selected.artist)
    chip("artist", `Artist: ${selected.artist}`, { artist: "" })
  if (selected.type)
    chip("type", selected.type === "mv" ? "Music video" : "Stream", {
      type: "",
    })
  if (selected.org)
    chip("org", selected.org.replace(/_/g, " "), { org: "", suborg: "" })
  for (const name of list(selected.suborg))
    chip(`suborg:${name}`, name, {
      suborg: list(selected.suborg)
        .filter((value) => value !== name)
        .join("\n"),
    })
  list(selected.channelId).forEach((id) => {
    const info = channelInfos.get(id)
    chip(`channel:${id}`, info ? channelName(info, preferEnglish) : id, {
      channelId: list(selected.channelId)
        .filter((value) => value !== id)
        .join("\n"),
    })
  })
  if (selected.from) chip("from", `From ${selected.from}`, { from: "" })
  if (selected.to) chip("to", `To ${selected.to}`, { to: "" })

  return (
    <main className="music-page">
      <MusicNavigation />
      <form onSubmit={submit} className="music-search-form">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MagnifyingGlassIcon
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              aria-label="Search music"
              placeholder="Search songs or artists"
              className="pl-10"
              autoFocus
              value={draft.q}
              onChange={(event) => update("q", event.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5 text-sm">
            <span className="font-medium">Type</span>
            <ToggleGroup
              variant="outline"
              spacing={0}
              aria-label="Type"
              value={selected.type ? [draft.type] : []}
              onValueChange={(next) => choose({ type: next[0] ?? "" })}
            >
              <ToggleGroupItem value="mv">Music video</ToggleGroupItem>
              <ToggleGroupItem value="stream">Stream</ToggleGroupItem>
            </ToggleGroup>
          </div>
          <label className="space-y-1.5 text-sm">
            <span className="font-medium">Song name</span>
            <Input
              value={draft.song}
              onChange={(event) => update("song", event.target.value)}
              placeholder="Title of the song"
            />
          </label>
          <label className="space-y-1.5 text-sm">
            <span className="font-medium">Original artist</span>
            <Input
              value={draft.artist}
              onChange={(event) => update("artist", event.target.value)}
              placeholder="Who wrote or first sang it"
            />
          </label>
          <div className="space-y-1.5 text-sm sm:col-span-2 lg:col-span-3">
            <label htmlFor="music-channel" className="font-medium">
              Channels
            </label>
            <ChannelPicker
              id="music-channel"
              placeholder="Type a talent's name"
              value={channelIds}
              onChange={(ids) => choose({ channelId: ids.join("\n") })}
            />
          </div>
          {showOrg && (
            <div className="space-y-1.5 text-sm">
              <label htmlFor="music-org" className="font-medium">
                Organization
              </label>
              <SimpleSelect
                id="music-org"
                className="w-full"
                value={draft.org}
                onChange={(value) => choose({ org: value, suborg: "" })}
                options={orgOptions}
              />
            </div>
          )}
          {showSuborg && (
            <div className="space-y-1.5 text-sm sm:col-span-2">
              <label htmlFor="music-suborg" className="font-medium">
                Sub-organizations
              </label>
              <MultiCombobox
                id="music-suborg"
                placeholder="Any sub-organization"
                items={[
                  ...new Set([...(result.data?.suborgs ?? []), ...suborgs]),
                ]}
                value={suborgs}
                onChange={(values) => choose({ suborg: values.join("\n") })}
              />
            </div>
          )}
          <label className="space-y-1.5 text-sm">
            <span className="font-medium">From date</span>
            <Input
              type="date"
              value={draft.from}
              max={draft.to || undefined}
              onChange={(event) => update("from", event.target.value)}
            />
          </label>
          <label className="space-y-1.5 text-sm">
            <span className="font-medium">To date</span>
            <Input
              type="date"
              value={draft.to}
              min={draft.from || undefined}
              onChange={(event) => update("to", event.target.value)}
            />
          </label>
        </div>
      </form>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {result.data
              ? `${result.data.found.toLocaleString()} songs found`
              : "Searching music…"}
          </p>
          <div className="ml-auto flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Sort by</span>
            <SimpleSelect
              aria-label="Sort"
              size="sm"
              value={sort}
              onChange={changeSort}
              options={[
                { value: "relevance", label: "Relevance" },
                { value: "latest", label: "Latest" },
                { value: "oldest", label: "Oldest" },
              ]}
            />
          </div>
        </div>
        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {chips.map(({ key, label, clear }) => (
              <Badge key={key} variant="secondary" className="h-6 gap-1 pr-1">
                <span className="max-w-48 truncate">{label}</span>
                <button
                  type="button"
                  aria-label={`Remove ${label}`}
                  onClick={clear}
                  className="rounded-full p-0.5 hover:bg-foreground/10"
                >
                  <XIcon />
                </button>
              </Badge>
            ))}
            <Button type="button" variant="ghost" size="xs" onClick={clearAll}>
              Clear all
            </Button>
          </div>
        )}

        {result.isPending ? null : result.isError ? (
          <ErrorMessage
            error={result.error}
            onRetry={() => void result.refetch()}
          />
        ) : (
          <div
            className={
              result.isPlaceholderData
                ? "opacity-60 transition-opacity"
                : undefined
            }
          >
            {songs.length ? (
              <SongList
                songs={songs}
                source={{
                  id: `search:${url.toString()}`,
                  title: "Music search",
                }}
              />
            ) : (
              <StateMessage
                title="No songs found"
                description="Try a different search or change the filters."
              />
            )}
          </div>
        )}

        {result.data && (
          <>
            {result.data.found > 5000 && page * 24 >= 5000 && (
              <p className="text-sm text-muted-foreground">
                Showing the first 5,000 results. Refine your search or filters
                to find more songs.
              </p>
            )}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => changePage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm">Page {page}</span>
              <Button
                variant="outline"
                disabled={page * 24 >= Math.min(result.data.found, 5000)}
                onClick={() => changePage(page + 1)}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </section>
    </main>
  )
}
