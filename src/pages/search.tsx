import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  SearchIcon,
  FiltersIcon,
  CloseIcon,
  PlayIcon,
  MusicIcon,
  UsersIcon,
  ChevronRightIcon,
} from "@/components/icons";
import {
  Choice,
  EmptyState,
  ErrorState,
  languages,
  LoadingCards,
  PageHeading,
} from "@/components/common";
import { VideoCard } from "@/components/video-card";
import { api } from "@/lib/api";
import { usePreferences } from "@/lib/preferences";
import type { Suggestion } from "@/lib/types";
import { cn } from "@/lib/utils";

const contentTypes = [
  { value: "all", label: "All videos" },
  { value: "stream", label: "Streams" },
  { value: "clip", label: "Clips" },
];
const sortOptions = [
  { value: "score", label: "Most relevant" },
  { value: "latest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "views", label: "Most viewed" },
  { value: "longest", label: "Longest first" },
  { value: "shortest", label: "Shortest first" },
];
const topics = [
  { value: "all", label: "Any topic" },
  { value: "singing", label: "Singing & karaoke" },
  { value: "Music_Cover", label: "Music covers" },
  { value: "talk", label: "Chatting" },
  { value: "asmr", label: "ASMR" },
  { value: "3D_Stream", label: "3D streams" },
  { value: "Birthday", label: "Birthdays" },
];
export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const { prefs } = usePreferences();
  const q = params.get("q") || "";
  const channel = params.get("channel") || "";
  const channelLabel = params.get("name") || "Selected channel";
  const type = params.get("type") || "all";
  const lang = params.get("lang") || "all";
  const org = params.get("org") || "all";
  const topic = params.get("topic") || "all";
  const sort = params.get("sort") || (q ? "score" : "latest");
  const from = params.get("from") || "";
  const to = params.get("to") || "";
  const [text, setText] = useState(q);
  const [debounced, setDebounced] = useState(q);
  const [focused, setFocused] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    setText(q);
  }, [q]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(text.trim());
      setActiveSuggestion(-1);
    }, 280);
    return () => clearTimeout(timer);
  }, [text]);
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (!formRef.current?.contains(e.target as Node)) setFocused(false);
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);
  const suggestions = useQuery({
    queryKey: ["autocomplete", debounced],
    queryFn: ({ signal }) => api.autocomplete(debounced, signal),
    enabled: focused && debounced.length >= 2,
    staleTime: 60_000,
  });
  const allSuggestions = [
    ...(suggestions.data?.vtuber || []).map((s) => ({ ...s, kind: "channel" })),
    ...(suggestions.data?.topic || []).map((s) => ({ ...s, kind: "topic" })),
  ];
  const orgs = useQuery({
    queryKey: ["orgs"],
    queryFn: ({ signal }) => api.orgs(signal),
    staleTime: 3_600_000,
  });
  function change(values: Record<string, string>) {
    setParams((old) => {
      const next = new URLSearchParams(old);
      Object.entries(values).forEach(([key, value]) => {
        if (!value || value === "all") next.delete(key);
        else next.set(key, value);
      });
      return next;
    });
  }
  function selectSuggestion(s: Suggestion & { kind: string }) {
    if (s.kind === "channel") {
      change({
        channel: s.id || s.value || "",
        name: s.english_name || s.name || s.text || "",
        q: "",
      });
      setText("");
    } else {
      change({ topic: s.id || s.value || "", q: "" });
      setText("");
    }
    setFocused(false);
  }
  const hasQuery = !!(
    q ||
    channel ||
    topic !== "all" ||
    type !== "all" ||
    org !== "all" ||
    lang !== "all" ||
    from ||
    to
  );
  const invalidDateRange = !!(from && to && from > to);
  const result = useInfiniteQuery({
    queryKey: ["search", q, channel, type, lang, org, topic, sort, from, to],
    enabled: hasQuery && !invalidDateRange,
    initialPageParam: undefined as unknown[] | undefined,
    queryFn: ({ signal, pageParam }) =>
      api.search(
        {
          q: {
            search: q,
            vtuber: channel ? [channel] : undefined,
            type: type !== "all" ? [type] : undefined,
            lang: lang !== "all" ? [lang] : undefined,
            org: org !== "all" ? [org] : undefined,
            topic: topic !== "all" ? [topic] : undefined,
            from: from || undefined,
            // API to is exclusive; include the full last day selected by the user.
            to: to
              ? new Date(`${to}T00:00:00Z`).getTime() + 86_400_000
              : undefined,
          },
          sort,
          limit: 24,
          offset: 0,
          search_after: pageParam,
        },
        signal,
      ),
    getNextPageParam: (last, pages) => {
      if (last.hits.hits.length < 24) return undefined;
      const cursor = last.hits.hits.at(-1)?.sort;
      if (
        !cursor ||
        pages
          .slice(0, -1)
          .some(
            (p) =>
              JSON.stringify(p.hits.hits.at(-1)?.sort) ===
              JSON.stringify(cursor),
          )
      )
        return undefined;
      return cursor;
    },
    staleTime: 180_000,
  });
  const first = result.data?.pages[0];
  const total = first
    ? typeof first.hits.total === "number"
      ? first.hits.total
      : first.hits.total.value
    : 0;
  const unique = new Map(
    result.data?.pages
      .flatMap((page) => page.hits.hits)
      .map((hit) => [
        hit._id,
        { ...hit._source, id: hit._source.id || hit._id },
      ]),
  );
  const videos = [...unique.values()].filter((v) => !!v.channel);
  const filtersCount =
    [type, lang, org, topic].filter((v) => v !== "all").length +
    Number(!!from) +
    Number(!!to);
  const reset = () => {
    setParams(q ? { q } : {});
    setFiltersOpen(false);
  };
  return (
    <>
      <PageHeading
        title="Find your next favorite"
        description="Streams, clips, and a whole world of VTubers to discover."
      />
      <div className="rounded-2xl border bg-card p-4 sm:p-5">
        <form
          ref={formRef}
          role="search"
          className="relative"
          onSubmit={(e) => {
            e.preventDefault();
            if (activeSuggestion >= 0 && allSuggestions[activeSuggestion])
              selectSuggestion(allSuggestions[activeSuggestion]);
            else {
              change({ q: text.trim(), channel: "", name: "" });
              setFocused(false);
            }
          }}
        >
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <SearchIcon className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setFocused(true);
                }}
                onFocus={() => setFocused(true)}
                autoComplete="off"
                aria-label="Search videos and channels"
                aria-expanded={focused && allSuggestions.length > 0}
                aria-controls="search-suggestions"
                aria-activedescendant={
                  activeSuggestion >= 0
                    ? `suggestion-${activeSuggestion}`
                    : undefined
                }
                role="combobox"
                placeholder="A stream, a song, a favorite creator…"
                className="h-12 rounded-xl bg-background pr-9 pl-12 text-sm shadow-none"
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown" && allSuggestions.length) {
                    e.preventDefault();
                    setActiveSuggestion(
                      (old) => (old + 1) % allSuggestions.length,
                    );
                  }
                  if (e.key === "ArrowUp" && allSuggestions.length) {
                    e.preventDefault();
                    setActiveSuggestion(
                      (old) =>
                        (old - 1 + allSuggestions.length) %
                        allSuggestions.length,
                    );
                  }
                  if (e.key === "Escape") setFocused(false);
                }}
              />
              {text && (
                <button
                  type="button"
                  aria-label="Clear search text"
                  onClick={() => setText("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  <CloseIcon className="size-4" />
                </button>
              )}
            </div>
            <Button type="submit" className="h-12 rounded-xl px-5">
              <SearchIcon />
              <span className="hidden sm:inline">Search</span>
            </Button>
          </div>
          {focused && debounced.length >= 2 && allSuggestions.length > 0 && (
            <div
              id="search-suggestions"
              role="listbox"
              aria-label="Search suggestions"
              className="absolute inset-x-0 top-14 z-20 rounded-xl border bg-popover p-2 shadow-lg"
            >
              {allSuggestions.map((s, index) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={activeSuggestion === index}
                  id={`suggestion-${index}`}
                  key={`${s.kind}:${s.id || s.value}`}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-muted",
                    activeSuggestion === index && "bg-muted",
                  )}
                  onClick={() => selectSuggestion(s)}
                >
                  {s.kind === "channel" ? (
                    <UsersIcon className="size-4 text-primary-ink" />
                  ) : (
                    <MusicIcon className="size-4 text-primary-ink" />
                  )}
                  <span className="flex-1">
                    {s.english_name || s.name || s.text || s.id || s.value}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {s.kind === "channel" ? "Channel" : "Topic"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </form>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-muted p-.5">
            {contentTypes.map((t) => (
              <Button
                key={t.value}
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-md text-xs",
                  type === t.value && "bg-card shadow-xs",
                )}
                onClick={() => change({ type: t.value })}
              >
                {t.label}
              </Button>
            ))}
          </div>
          <Button
            size="sm"
            variant={filtersOpen ? "secondary" : "ghost"}
            onClick={() => setFiltersOpen((old) => !old)}
            aria-expanded={filtersOpen}
            className="rounded-lg text-xs"
          >
            <FiltersIcon />
            Filters
            {filtersCount > 0 && (
              <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground">
                {filtersCount}
              </span>
            )}
          </Button>
          <div className="ml-auto">
            <Choice
              label="Search sort order"
              value={sort}
              onChange={(sort) => change({ sort })}
              options={sortOptions}
              className="rounded-lg border-transparent bg-transparent text-xs"
            />
          </div>
        </div>
        {filtersOpen && (
          <div className="mt-4 grid grid-cols-1 gap-4 border-t pt-5 sm:grid-cols-2 xl:grid-cols-3">
            {[
              {
                label: "Organization",
                value: org,
                key: "org",
                options: [
                  { value: "all", label: "All organizations" },
                  ...(orgs.data || []).map((o) => ({
                    value: o.name,
                    label: o.name,
                  })),
                ],
              },
              {
                label: "Language",
                value: lang,
                key: "lang",
                options: languages,
              },
              { label: "Topic", value: topic, key: "topic", options: topics },
            ].map((filter) => (
              <div key={filter.key}>
                <p className="mb-2 text-xs font-medium">{filter.label}</p>
                <Choice
                  label={filter.label}
                  value={filter.value}
                  onChange={(value) => change({ [filter.key]: value })}
                  options={filter.options}
                  className="w-full rounded-lg bg-background"
                />
              </div>
            ))}
            <label className="text-xs font-medium">
              From
              <Input
                type="date"
                value={from}
                onChange={(e) => change({ from: e.target.value })}
                className="mt-2 rounded-lg bg-background"
              />
            </label>
            <label className="text-xs font-medium">
              Through
              <Input
                type="date"
                value={to}
                min={from || undefined}
                onChange={(e) => change({ to: e.target.value })}
                className="mt-2 rounded-lg bg-background"
              />
            </label>
            <div className="flex items-end">
              <Button variant="ghost" size="sm" onClick={reset}>
                Reset filters
              </Button>
            </div>
          </div>
        )}
        {channel && (
          <div className="mt-4">
            <Badge variant="secondary" className="gap-2 rounded-lg px-3 py-1.5">
              <UsersIcon />
              {channelLabel}
              <button
                aria-label="Remove channel filter"
                onClick={() => change({ channel: "", name: "" })}
              >
                <CloseIcon />
              </button>
            </Badge>
          </div>
        )}
      </div>
      {invalidDateRange && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          Choose an end date on or after the start date.
        </p>
      )}
      {!hasQuery ? (
        <div className="mx-auto mt-12 max-w-2xl">
          <EmptyState
            title="What are you in the mood for?"
            description="Find a specific moment, revisit a favorite stream, or discover someone new."
          >
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { q: "karaoke", icon: <MusicIcon /> },
                { q: "Minecraft", icon: <PlayIcon /> },
                { q: "3D live", icon: <UsersIcon /> },
                { q: "ASMR", icon: <SearchIcon /> },
              ].map((item) => (
                <Button
                  key={item.q}
                  variant="outline"
                  size="sm"
                  onClick={() => change({ q: item.q })}
                >
                  {item.icon}
                  {item.q}
                  <ChevronRightIcon />
                </Button>
              ))}
            </div>
          </EmptyState>
        </div>
      ) : (
        !invalidDateRange && (
          <>
            <div className="my-6 flex items-center justify-between">
              <p role="status" className="text-sm">
                {result.isPending ? (
                  "Searching…"
                ) : (
                  <>
                    <span className="font-semibold">
                      {total.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">
                      {" "}
                      results
                      {q
                        ? ` for “${q}”`
                        : channel
                          ? ` featuring ${channelLabel}`
                          : ""}
                      {typeof first?.hits.total === "object" &&
                      first.hits.total.relation === "gte"
                        ? " (at least)"
                        : ""}
                    </span>
                  </>
                )}
              </p>
              {filtersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={reset}
                >
                  Clear filters
                  <CloseIcon />
                </Button>
              )}
            </div>
            {result.error ? (
              <ErrorState
                error={result.error}
                retry={() => void result.refetch()}
              />
            ) : result.isPending ? (
              <LoadingCards />
            ) : (
              <>
                {first?.timed_out && (
                  <p
                    role="status"
                    className="mb-4 rounded-lg bg-accent p-3 text-xs"
                  >
                    The search timed out. These results may be incomplete. Try
                    searching again.
                  </p>
                )}
                {videos.length ? (
                  <div
                    className={
                      prefs.layout === "list" ? "video-list" : "video-grid"
                    }
                  >
                    {videos.map((video) => (
                      <VideoCard
                        key={video.id}
                        video={video}
                        list={prefs.layout === "list"}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No matching moments yet"
                    description="Try a broader search or remove a filter to see more results."
                  />
                )}
                {result.hasNextPage && (
                  <div className="mt-8 flex justify-center">
                    <Button
                      variant="outline"
                      disabled={result.isFetchingNextPage}
                      onClick={() => void result.fetchNextPage()}
                    >
                      {result.isFetchingNextPage
                        ? "Loading…"
                        : "Load more results"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        )
      )}
    </>
  );
}
