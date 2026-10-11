import { useId, useMemo, useState, type ReactNode } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Link, useSearchParams } from "react-router"

import { ChannelPicker } from "@/components/common/channel-picker"
import { LoadMore } from "@/components/common/load-more"
import { MultiCombobox } from "@/components/common/multi-combobox"
import { SimpleSelect } from "@/components/common/simple-select"
import { ErrorMessage, StateMessage } from "@/components/common/state-message"
import {
  ArrowSquareOutIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { VideoList, VideoListSkeleton } from "@/components/video/video-list"
import { ViewMenu } from "@/components/video/view-menu"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { api, type SearchSort } from "@/lib/api"
import { TL_LANGS } from "@/lib/consts"
import { intlLocale, useT } from "@/lib/i18n"
import { flattenPages, useOrgs, useTopics } from "@/lib/queries"
import {
  countFilters,
  hasCriteria,
  parseSearchParams,
  SEARCH_SORTS,
  toSearchParams,
  toVideoSearchQuery,
  type SearchMode,
  type SearchState,
  type SearchType,
} from "@/lib/search-query"
import type { Video, VideoComment } from "@/lib/types"
import { youtubeUrl } from "@/lib/video"
import { useSettings } from "@/stores/settings"

const PAGE_SIZE = 30
/** The search index refuses to page past this many results. */
const MAX_RESULTS = 10_000

const TIMESTAMP_RE = /(?:([0-5]?\d):)?([0-5]?\d):([0-5]\d)/g

function decodeComment(message: string): string {
  const doc = new DOMParser().parseFromString(message, "text/html")
  return doc.body.textContent ?? ""
}

/** A saved comment, with its timestamps linked into the video. */
function Comment({ videoId, comment }: { videoId: string; comment: VideoComment }) {
  const { t } = useT()
  const redirectMode = useSettings((s) => s.redirectMode)
  const [expanded, setExpanded] = useState(false)
  const text = useMemo(() => decodeComment(comment.message), [comment.message])

  const parts: ReactNode[] = []
  let cursor = 0
  for (const match of text.matchAll(TIMESTAMP_RE)) {
    const [stamp, h, m, s] = match
    const seconds = Number(h ?? 0) * 3600 + Number(m) * 60 + Number(s)
    parts.push(text.slice(cursor, match.index))
    const className =
      "rounded px-0.5 font-medium text-brand tabular-nums hover:bg-primary hover:text-primary-foreground"
    parts.push(
      redirectMode ? (
        <a
          key={match.index}
          href={`https://youtu.be/${videoId}?t=${seconds}`}
          target="_blank"
          rel="noopener noreferrer"
          className={className}
        >
          {stamp}
        </a>
      ) : (
        <Link
          key={match.index}
          to={`/watch/${videoId}?t=${seconds}`}
          className={className}
        >
          {stamp}
        </Link>
      )
    )
    cursor = match.index + stamp.length
  }
  parts.push(text.slice(cursor))

  const long = text.length > 280 || text.split("\n").length > 4

  return (
    <li className="group/comment relative border-l-2 border-border py-0.5 pr-6 pl-3">
      <p
        className={
          expanded || !long
            ? "text-[13px] wrap-anywhere whitespace-pre-wrap"
            : "line-clamp-4 text-[13px] wrap-anywhere whitespace-pre-wrap"
        }
      >
        {parts}
      </p>
      {long && (
        <button
          type="button"
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded
            ? t("component.description.showLess")
            : t("component.description.showMore")}
        </button>
      )}
      <a
        href={`${youtubeUrl(videoId)}&lc=${comment.comment_key}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("views.settings.redirectModeLabel")}
        className="absolute top-0.5 right-0 text-muted-foreground hover:text-foreground pointer-fine:opacity-0 pointer-fine:group-hover/comment:opacity-100"
      >
        <ArrowSquareOutIcon className="size-4" />
      </a>
    </li>
  )
}

function FilterField({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label: string
  htmlFor?: string
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-[13px] text-muted-foreground">{hint}</p>}
    </div>
  )
}

function FilterPanel({
  state,
  update,
}: {
  state: SearchState
  update: (patch: Partial<SearchState>) => void
}) {
  const { t } = useT()
  const ids = {
    channels: useId(),
    orgs: useId(),
    topics: useId(),
    from: useId(),
    to: useId(),
    song: useId(),
  }
  const clipLangs = useSettings((s) => s.clipLangs)
  const orgs = useOrgs()
  const [wantTopics, setWantTopics] = useState(state.topics.length > 0)
  const topics = useTopics(wantTopics)
  const today = new Date().toISOString().slice(0, 10)
  const langs = state.langs ?? clipLangs

  return (
    <div className="grid gap-x-6 gap-y-4 rounded-2xl border bg-card p-4 md:grid-cols-2 xl:grid-cols-3">
      <FilterField label={t("component.search.type.channel")} htmlFor={ids.channels} className="capitalize">
        <ChannelPicker
          id={ids.channels}
          value={state.channels}
          onChange={(channels) => update({ channels })}
          placeholder={t("component.search.searchLabel")}
        />
      </FilterField>
      <FilterField label={t("views.channels.sortOptions.org")} htmlFor={ids.orgs}>
        <MultiCombobox
          id={ids.orgs}
          items={orgs.data?.map((org) => org.name) ?? state.orgs}
          value={state.orgs}
          onChange={(next) => update({ orgs: next })}
          placeholder={t("component.search.searchLabel")}
        />
      </FilterField>
      <FilterField label={t("component.search.type.topic")} htmlFor={ids.topics} className="capitalize">
        <MultiCombobox
          id={ids.topics}
          items={topics.data?.map((topic) => topic.id) ?? state.topics}
          value={state.topics}
          onChange={(next) => update({ topics: next })}
          label={(id) => id.replace(/_/g, " ")}
          placeholder={t("component.search.searchLabel")}
          onOpen={() => setWantTopics(true)}
        />
      </FilterField>

      {state.mode === "videos" && (
        <>
          <FilterField label={t("views.search.dateRange")} htmlFor={ids.from}>
            <div className="flex items-center gap-2">
              <Input
                id={ids.from}
                type="date"
                value={state.from}
                max={state.to || today}
                aria-label={t("views.search.dateFrom")}
                onChange={(event) => update({ from: event.target.value })}
              />
              <span className="text-muted-foreground">–</span>
              <Input
                id={ids.to}
                type="date"
                value={state.to}
                min={state.from || undefined}
                aria-label={t("views.search.dateTo")}
                onChange={(event) => update({ to: event.target.value })}
              />
            </div>
          </FilterField>
          <FilterField label={t("views.search.songs")} htmlFor={ids.song}>
            <SimpleSelect<SearchState["song"] | "any">
              id={ids.song}
              className="w-full"
              value={state.song || "any"}
              onChange={(song) => update({ song: song === "any" ? "" : song })}
              options={[
                { value: "any", label: t("views.search.songsAny") },
                { value: "none", label: t("views.search.songsNone") },
                { value: "one", label: t("views.search.songsOne") },
                { value: "many", label: t("views.search.songsMany") },
              ]}
            />
          </FilterField>
        </>
      )}

      {state.type === "clip" && (
        <FilterField
          label={t("views.search.clipLanguages")}
          hint={
            state.langs === null
              ? t("views.search.clipLanguagesDefault")
              : undefined
          }
        >
          <ToggleGroup
            multiple
            variant="outline"
            size="sm"
            className="flex-wrap"
            value={langs}
            onValueChange={(next) => update({ langs: next as string[] })}
          >
            {TL_LANGS.map((lang) => (
              <ToggleGroupItem
                key={lang.value}
                value={lang.value}
                className="aria-pressed:border-primary/60 aria-pressed:bg-primary/15"
              >
                {lang.text}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </FilterField>
      )}
    </div>
  )
}

/** Existing translations are reused where the old UI had the same order. */
const SORT_LABEL: Record<SearchSort, string> = {
  latest: "views.search.sort.newest",
  oldest: "views.search.sort.oldest",
  score: "views.search.sort.relevance",
  longest: "views.search.sort.longest",
  shortest: "views.search.sort.shortest",
  views: "views.search.sort.views",
}

/** v2 comment search only knows these three orders. */
const COMMENT_SORT: Partial<Record<SearchSort, "newest" | "oldest" | "longest">> = {
  latest: "newest",
  oldest: "oldest",
  longest: "longest",
}

export function SearchPage() {
  const { t, lang } = useT()
  const [params, setParams] = useSearchParams()
  const state = useMemo(() => parseSearchParams(params), [params])
  const clipLangs = useSettings((s) => s.clipLangs)
  const mode = useSettings((s) => s.homeViewMode)
  const gridSize = useSettings((s) => s.gridSize)
  const scrollMode = useSettings((s) => s.scrollMode)

  const ready = hasCriteria(state)
  const filterCount = countFilters(state)
  // With nothing to search yet, the filters are the way in.
  const [filtersToggled, setFiltersToggled] = useState<boolean | null>(null)
  const filtersOpen = filtersToggled ?? !ready

  useDocumentTitle(state.text || t("component.search.searchLabel"))

  const update = (patch: Partial<SearchState>) =>
    setParams(toSearchParams({ ...state, ...patch }), { replace: true })

  const results = useInfiniteQuery({
    queryKey: ["search", state, state.type === "clip" ? clipLangs : null],
    enabled: ready,
    initialPageParam: 0,
    queryFn: async ({ pageParam, signal }) => {
      if (state.mode === "comments") {
        const page = await api.searchComments(
          {
            comment: state.text,
            sort: COMMENT_SORT[state.sort] ?? "newest",
            lang: state.langs ?? clipLangs,
            target: state.type === "all" ? ["stream", "clip"] : [state.type],
            vch: state.channels,
            org: state.orgs,
            topic: state.topics,
          },
          pageParam,
          PAGE_SIZE,
          signal
        )
        return { ...page, totalExact: true }
      }
      return api.searchVideos(
        toVideoSearchQuery(state, clipLangs),
        state.sort,
        pageParam,
        PAGE_SIZE,
        signal
      )
    },
    getNextPageParam: (last, _pages, offset) => {
      const next = offset + PAGE_SIZE
      if (last.items.length < PAGE_SIZE) return undefined
      if (next >= Math.min(last.total, MAX_RESULTS - PAGE_SIZE)) return undefined
      return next
    },
    staleTime: 3 * 60_000,
  })

  const videos = useMemo(() => flattenPages(results.data?.pages), [results.data])
  const first = results.data?.pages[0]

  const sortOptions = SEARCH_SORTS.filter(
    (sort) => state.mode === "videos" || sort in COMMENT_SORT
  ).map((sort) => ({ value: sort, label: t(SORT_LABEL[sort]) }))

  const toolbar = (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
      <ToggleGroup
        variant="outline"
        size="sm"
        spacing={0}
        value={[state.type]}
        onValueChange={(next) => {
          const type = next[0] as SearchType | undefined
          if (type) update({ type })
        }}
      >
        <ToggleGroupItem value="all">{t("views.search.type.all")}</ToggleGroupItem>
        <ToggleGroupItem value="stream">
          {t("views.search.type.official")}
        </ToggleGroupItem>
        <ToggleGroupItem value="clip">{t("views.search.type.clip")}</ToggleGroupItem>
      </ToggleGroup>

      <SimpleSelect<SearchMode>
        size="sm"
        aria-label={t("views.search.searchIn")}
        value={state.mode}
        onChange={(next) =>
          update({
            mode: next,
            sort: next === "comments" && !(state.sort in COMMENT_SORT) ? "latest" : state.sort,
          })
        }
        options={[
          { value: "videos", label: t("views.search.inTitles") },
          { value: "comments", label: t("views.search.inComments") },
        ]}
      />

      <div className="ml-auto flex items-center gap-1">
        <SimpleSelect<SearchSort>
          size="sm"
          aria-label={t("views.search.sortByLabel")}
          value={state.sort}
          onChange={(sort) => update({ sort })}
          options={sortOptions}
        />
        <Button
          variant={filtersOpen ? "secondary" : "ghost"}
          size="sm"
          aria-expanded={filtersOpen}
          onClick={() => setFiltersToggled(!filtersOpen)}
        >
          <FunnelIcon data-icon="inline-start" />
          {t("views.home.filters")}
          {filterCount > 0 && (
            <span className="ml-0.5 rounded-md bg-primary px-1.5 text-xs leading-5 text-primary-foreground tabular-nums">
              {filterCount}
            </span>
          )}
        </Button>
        {state.mode === "videos" && <ViewMenu />}
      </div>
    </div>
  )

  let content: ReactNode
  if (!ready) {
    content = (
      <StateMessage
        icon={<MagnifyingGlassIcon />}
        title={t("views.search.promptTitle")}
        description={t("views.search.promptDescription")}
      />
    )
  } else if (results.isPending) {
    content = (
      <VideoListSkeleton
        mode={state.mode === "comments" ? "list" : mode}
        gridSize={gridSize}
        count={18}
      />
    )
  } else if (results.isError && !results.data) {
    content = (
      <ErrorMessage error={results.error} onRetry={() => results.refetch()} />
    )
  } else if (videos.length === 0) {
    content = (
      <StateMessage
        icon={<MagnifyingGlassIcon />}
        title={t("views.search.noResults")}
        description={t("views.search.noResultsHint")}
      >
        {filterCount > 0 && (
          <Button
            variant="outline"
            onClick={() =>
              update({
                channels: [],
                topics: [],
                orgs: [],
                from: "",
                to: "",
                song: "",
                langs: null,
              })
            }
          >
            <XIcon data-icon="inline-start" />
            {t("views.search.clearFilters")}
          </Button>
        )}
      </StateMessage>
    )
  } else {
    content = (
      <>
        {state.mode === "comments" ? (
          <VideoList
            videos={videos}
            mode="list"
            className="xl:grid-cols-1"
            renderExtra={(video: Video) =>
              video.comments?.length ? (
                <ul className="mt-2 flex max-h-80 flex-col gap-2 overflow-y-auto">
                  {video.comments.map((comment) => (
                    <Comment
                      key={comment.comment_key}
                      videoId={video.id}
                      comment={comment}
                    />
                  ))}
                </ul>
              ) : null
            }
          />
        ) : (
          <VideoList videos={videos} mode={mode} gridSize={gridSize} />
        )}
        <LoadMore
          hasMore={!!results.hasNextPage}
          loading={results.isFetchingNextPage}
          onLoadMore={() => void results.fetchNextPage()}
          auto={scrollMode}
        />
      </>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 px-3 pt-4 pb-8 md:px-6">
      {toolbar}
      {filtersOpen && <FilterPanel state={state} update={update} />}
      {ready && first && (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {t("views.search.resultCount", [
            `${first.totalExact ? "" : "≥ "}${first.total.toLocaleString(intlLocale(lang))}`,
          ])}
        </p>
      )}
      <div className="flex flex-1 flex-col">{content}</div>
    </div>
  )
}
