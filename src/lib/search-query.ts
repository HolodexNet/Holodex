import type { SearchSort, VideoSearchQuery } from "@/lib/api"

/**
 * The search page keeps its whole state in the URL so results can be
 * bookmarked and shared:
 *
 *   /search?q=karaoke&ch=UC...&topic=singing&org=Hololive&type=clip&sort=latest
 */

export type SearchType = "all" | "stream" | "clip"
export type SearchMode = "videos" | "comments"

export interface SearchState {
  text: string
  mode: SearchMode
  channels: string[]
  topics: string[]
  orgs: string[]
  type: SearchType
  sort: SearchSort
  /** Clip languages; `null` means "use the viewer's clip languages". */
  langs: string[] | null
  from: string
  to: string
  song: "" | "none" | "one" | "many"
}

export const SEARCH_SORTS: SearchSort[] = [
  "latest",
  "oldest",
  "score",
  "longest",
  "shortest",
]

const TYPES: SearchType[] = ["all", "stream", "clip"]
const SONGS = ["none", "one", "many"] as const
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

/** Sort names used by links into the previous UI. */
const LEGACY_SORT: Record<string, SearchSort> = { newest: "latest" }

export const emptySearch = (): SearchState => ({
  text: "",
  mode: "videos",
  channels: [],
  topics: [],
  orgs: [],
  type: "all",
  sort: "latest",
  langs: null,
  from: "",
  to: "",
  song: "",
})

/**
 * The previous UI encoded the query as a CSV of `type,value,text` rows in
 * `q`. Old bookmarks and shared links still arrive in that shape.
 */
function parseLegacyQuery(q: string, state: SearchState): boolean {
  const lines = q.split(/\r?\n/)
  if (lines[0]?.trim() !== "type,value,text") return false

  for (const line of lines.slice(1)) {
    const [type, value, ...rest] = line.split(",")
    const text = rest.join(",").replace(/^"|"$/g, "").replace(/""/g, '"')
    switch (type) {
      case "channel":
        if (value) state.channels.push(value)
        break
      case "topic":
        if (value) state.topics.push(value)
        break
      case "org":
        if (value) state.orgs.push(value)
        break
      case "title & desc":
        state.text = [state.text, text].filter(Boolean).join(" ")
        break
      case "comments":
        state.text = text
        state.mode = "comments"
        break
    }
  }
  return true
}

const unique = (values: string[]) => [...new Set(values.filter(Boolean))]

export function parseSearchParams(params: URLSearchParams): SearchState {
  const state = emptySearch()

  const q = params.get("q") ?? ""
  if (!parseLegacyQuery(q, state)) state.text = q.trim()

  state.channels = unique([...state.channels, ...params.getAll("ch")])
  state.topics = unique([...state.topics, ...params.getAll("topic")])
  state.orgs = unique([...state.orgs, ...params.getAll("org")])
  if (params.get("in") === "comments") state.mode = "comments"

  const type = params.get("type")?.toLowerCase() as SearchType
  if (TYPES.includes(type)) state.type = type

  const sort = params.get("sort")?.toLowerCase() ?? ""
  const mapped = LEGACY_SORT[sort] ?? (sort as SearchSort)
  if (SEARCH_SORTS.includes(mapped)) state.sort = mapped

  if (params.has("lang")) state.langs = unique(params.getAll("lang"))

  const from = params.get("from") ?? ""
  const to = params.get("to") ?? ""
  if (DATE_RE.test(from)) state.from = from
  if (DATE_RE.test(to)) state.to = to

  const song = params.get("song") as SearchState["song"]
  if ((SONGS as readonly string[]).includes(song)) state.song = song

  return state
}

export function toSearchParams(state: SearchState): URLSearchParams {
  const params = new URLSearchParams()
  if (state.text) params.set("q", state.text)
  if (state.mode === "comments") params.set("in", "comments")
  state.channels.forEach((id) => params.append("ch", id))
  state.topics.forEach((id) => params.append("topic", id))
  state.orgs.forEach((name) => params.append("org", name))
  if (state.type !== "all") params.set("type", state.type)
  if (state.sort !== "latest") params.set("sort", state.sort)
  state.langs?.forEach((lang) => params.append("lang", lang))
  if (state.langs?.length === 0) params.set("lang", "")
  if (state.from) params.set("from", state.from)
  if (state.to) params.set("to", state.to)
  if (state.song) params.set("song", state.song)
  return params
}

export function searchHref(state: SearchState): string {
  const qs = toSearchParams(state).toString()
  return qs ? `/search?${qs}` : "/search"
}

/** True when there is something to search for. */
export function hasCriteria(state: SearchState): boolean {
  if (state.mode === "comments") return state.text.length > 0
  return (
    state.text.length > 0 ||
    state.channels.length > 0 ||
    state.topics.length > 0 ||
    state.orgs.length > 0 ||
    !!state.from ||
    !!state.to ||
    !!state.song
  )
}

/** Number of refinements beyond the basic text / type / sort. */
export function countFilters(state: SearchState): number {
  return (
    state.channels.length +
    state.topics.length +
    state.orgs.length +
    (state.from ? 1 : 0) +
    (state.to ? 1 : 0) +
    (state.song ? 1 : 0) +
    (state.langs !== null ? 1 : 0)
  )
}

/** Local-midnight boundary of a `YYYY-MM-DD` date, as an ISO instant. */
function dayStart(date: string, offsetDays = 0): string {
  const [y, m, d] = date.split("-").map(Number)
  return new Date(y, m - 1, d + offsetDays).toISOString()
}

/**
 * Translates the page state into a v3 search query.
 *
 * Only clips carry a language, so a language filter would silently drop
 * every stream; it is therefore applied only when searching clips.
 */
export function toVideoSearchQuery(
  state: SearchState,
  clipLangs: string[]
): VideoSearchQuery {
  const langs = state.langs ?? clipLangs
  return {
    search: state.text,
    vtuber: state.channels.length ? state.channels : undefined,
    topic: state.topics.length ? state.topics : undefined,
    org: state.orgs.length ? state.orgs : undefined,
    type: state.type === "all" ? ["stream", "clip"] : [state.type],
    lang: state.type === "clip" && langs.length ? langs : undefined,
    from: state.from ? dayStart(state.from) : undefined,
    // The API's upper bound is exclusive; include the whole chosen day.
    to: state.to ? dayStart(state.to, 1) : undefined,
    has_song: state.song || undefined,
  }
}
