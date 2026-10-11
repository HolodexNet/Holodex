import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react"
import { useQuery } from "@tanstack/react-query"
import { useLocation, useNavigate } from "react-router"
import { cn } from "cn"

import {
  BuildingsIcon,
  ChatTextIcon,
  HashIcon,
  LogoYoutubeIcon,
  MagnifyingGlassIcon,
  TextTIcon,
  UserIcon,
  XIcon,
} from "@/components/icons"
import { Spinner } from "@/components/ui/spinner"
import { useDebounced } from "@/hooks/use-debounced"
import { api } from "@/lib/api"
import { CHANNEL_URL_REGEX, VIDEO_URL_REGEX } from "@/lib/consts"
import { useT } from "@/lib/i18n"
import { rememberChannel, useChannelInfos, useOrgs } from "@/lib/queries"
import {
  emptySearch,
  parseSearchParams,
  searchHref,
  type SearchState,
} from "@/lib/search-query"
import { channelName } from "@/lib/video"
import { useSettings } from "@/stores/settings"

type TokenType = "channel" | "topic" | "org"

interface Token {
  type: TokenType
  value: string
}

type Suggestion =
  | { kind: "token"; token: Token; label: string; hint?: string }
  | { kind: "video"; id: string }
  | { kind: "text"; mode: "videos" | "comments" }

const TOKEN_ICONS: Record<TokenType, ReactNode> = {
  channel: <UserIcon />,
  topic: <HashIcon />,
  org: <BuildingsIcon />,
}

const tokenKey = (token: Token) => `${token.type}:${token.value}`
const prettyTopic = (id: string) => id.replace(/_/g, " ")

function tokensOf(state: SearchState): Token[] {
  return [
    ...state.channels.map((value) => ({ type: "channel" as const, value })),
    ...state.topics.map((value) => ({ type: "topic" as const, value })),
    ...state.orgs.map((value) => ({ type: "org" as const, value })),
  ]
}

interface SearchBarProps {
  autoFocus?: boolean
  /** Called after a search or navigation is committed. */
  onCommit?: () => void
  className?: string
}

/**
 * Global search. Free text searches titles; picking a channel, topic or
 * organization from the suggestions adds it as a filter chip. A lone channel
 * chip goes straight to that channel, and a pasted YouTube link opens the
 * video.
 */
export function SearchBar({ autoFocus, onCommit, className }: SearchBarProps) {
  const { t } = useT()
  const navigate = useNavigate()
  const location = useLocation()
  const preferEnglish = useSettings((s) => s.useEnglishName)
  const listId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  const onSearchPage = location.pathname === "/search"
  const urlState = useMemo(
    () =>
      onSearchPage
        ? parseSearchParams(new URLSearchParams(location.search))
        : null,
    [onSearchPage, location.search]
  )

  const [text, setText] = useState(urlState?.text ?? "")
  const [tokens, setTokens] = useState<Token[]>(
    urlState ? tokensOf(urlState) : []
  )
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)

  // The URL is the source of truth on the search page: follow it.
  const [syncedState, setSyncedState] = useState(urlState)
  if (urlState !== syncedState) {
    setSyncedState(urlState)
    if (urlState) {
      setText(urlState.text)
      setTokens(tokensOf(urlState))
    }
  }

  // "/" focuses search from anywhere outside a text field.
  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return
      event.preventDefault()
      inputRef.current?.focus()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const trimmed = text.trim()
  const debounced = useDebounced(trimmed, 250)
  const videoMatch = VIDEO_URL_REGEX.exec(trimmed)
  const channelMatch = CHANNEL_URL_REGEX.exec(trimmed)
  // A pasted channel link is looked up by its id.
  const lookup = channelMatch?.groups?.id ?? debounced
  const canLookup = lookup.length >= 2 && !videoMatch

  const autocomplete = useQuery({
    queryKey: ["autocomplete", lookup],
    queryFn: ({ signal }) => api.autocomplete(lookup, signal),
    enabled: canLookup,
    staleTime: 5 * 60_000,
    placeholderData: (previous) => previous,
  })
  const orgs = useOrgs()

  const channelIds = tokens.filter((x) => x.type === "channel").map((x) => x.value)
  const channelInfos = useChannelInfos(channelIds)

  const labelOf = (token: Token) => {
    if (token.type === "topic") return prettyTopic(token.value)
    if (token.type === "org") return token.value
    const info = channelInfos.get(token.value)
    return info ? channelName(info, preferEnglish) : token.value
  }

  const suggestions = useMemo<Suggestion[]>(() => {
    if (!trimmed) return []
    if (videoMatch?.groups?.id) return [{ kind: "video", id: videoMatch.groups.id }]

    const taken = new Set(tokens.map(tokenKey))
    const out: Suggestion[] = []
    const push = (token: Token, label: string, hint?: string) => {
      if (!taken.has(tokenKey(token))) out.push({ kind: "token", token, label, hint })
    }

    if (canLookup && lookup === (channelMatch?.groups?.id ?? trimmed)) {
      for (const ch of autocomplete.data?.vtuber ?? []) {
        push(
          { type: "channel", value: ch.id },
          channelName(ch, preferEnglish),
          ch.org ?? undefined
        )
      }
      for (const topic of autocomplete.data?.topic ?? []) {
        push({ type: "topic", value: topic.id }, prettyTopic(topic.id))
      }
    }

    if (!channelMatch) {
      const needle = trimmed.toLowerCase()
      const matches = (orgs.data ?? []).filter(
        (org) =>
          org.name.toLowerCase().includes(needle) ||
          org.name_jp?.toLowerCase().includes(needle)
      )
      for (const org of matches.slice(0, 3)) {
        push({ type: "org", value: org.name }, org.name, org.name_jp ?? undefined)
      }
      out.push({ kind: "text", mode: "videos" })
      // Comment search matches a single phrase and ignores other filters.
      if (tokens.length === 0) out.push({ kind: "text", mode: "comments" })
    }
    return out
  }, [
    trimmed,
    videoMatch,
    channelMatch,
    tokens,
    canLookup,
    lookup,
    autocomplete.data,
    orgs.data,
    preferEnglish,
  ])

  const activeIndex = Math.min(active, Math.max(suggestions.length - 1, 0))
  const showList = open && suggestions.length > 0

  const finish = () => {
    setOpen(false)
    inputRef.current?.blur()
    onCommit?.()
  }

  const commit = (mode: "videos" | "comments" = "videos") => {
    const query = text.trim()
    if (!query && tokens.length === 0) return

    if (!query && tokens.length === 1 && tokens[0].type === "channel") {
      navigate(`/channel/${tokens[0].value}`)
      finish()
      return
    }

    // Keep the sort, type and other refinements already chosen on the page.
    const base = urlState ?? emptySearch()
    navigate(
      searchHref({
        ...base,
        text: query,
        mode: mode === "comments" && query ? "comments" : "videos",
        channels: tokens.filter((x) => x.type === "channel").map((x) => x.value),
        topics: tokens.filter((x) => x.type === "topic").map((x) => x.value),
        orgs: tokens.filter((x) => x.type === "org").map((x) => x.value),
      })
    )
    finish()
  }

  const choose = (suggestion: Suggestion) => {
    if (suggestion.kind === "video") {
      navigate(`/watch/${suggestion.id}`)
      setText("")
      finish()
    } else if (suggestion.kind === "text") {
      commit(suggestion.mode)
    } else {
      if (suggestion.token.type === "channel") {
        const ch = autocomplete.data?.vtuber?.find(
          (c) => c.id === suggestion.token.value
        )
        if (ch) rememberChannel(ch)
      }
      setTokens((current) => [...current, suggestion.token])
      setText("")
      setActive(0)
      inputRef.current?.focus()
    }
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        if (!suggestions.length) return
        event.preventDefault()
        setOpen(true)
        const step = event.key === "ArrowDown" ? 1 : -1
        setActive((activeIndex + step + suggestions.length) % suggestions.length)
        break
      }
      case "Enter":
        event.preventDefault()
        if (showList) choose(suggestions[activeIndex])
        else commit()
        break
      case "Escape":
        if (showList) {
          event.preventDefault()
          setOpen(false)
        } else {
          inputRef.current?.blur()
        }
        break
      case "Backspace":
        if (!text && tokens.length) setTokens(tokens.slice(0, -1))
        break
    }
  }

  const describe = (suggestion: Suggestion) => {
    if (suggestion.kind === "video") {
      return {
        icon: <LogoYoutubeIcon />,
        type: t("component.search.type.videourl"),
        label: suggestion.id,
      }
    }
    if (suggestion.kind === "text") {
      return suggestion.mode === "comments"
        ? {
            icon: <ChatTextIcon />,
            type: t("component.search.type.comments"),
            label: trimmed,
          }
        : {
            icon: <TextTIcon />,
            type: t("component.search.type.title"),
            label: trimmed,
          }
    }
    return {
      icon: TOKEN_ICONS[suggestion.token.type],
      type: t(`component.search.type.${suggestion.token.type}`),
      label: suggestion.label,
      hint: suggestion.hint,
    }
  }

  return (
    <div
      className={cn("relative w-full", className)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      <div
        className={cn(
          "flex min-h-9 w-full cursor-text flex-wrap items-center gap-1 rounded-2xl border border-input bg-background/60 py-1 pr-1 pl-3 transition-colors",
          "focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/40"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {tokens.map((token) => (
          <span
            key={tokenKey(token)}
            className="flex max-w-48 items-center gap-1 rounded-lg bg-secondary py-0.5 pr-0.5 pl-1.5 text-xs text-secondary-foreground [&>svg]:size-3.5 [&>svg]:shrink-0 [&>svg]:text-muted-foreground"
          >
            {TOKEN_ICONS[token.type]}
            <span className="truncate">{labelOf(token)}</span>
            <button
              type="button"
              aria-label={t("component.search.removeFilter", [labelOf(token)])}
              className="rounded-md p-0.5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
              onClick={(event) => {
                event.stopPropagation()
                setTokens(tokens.filter((x) => x !== token))
              }}
            >
              <XIcon className="size-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={text}
          onChange={(event) => {
            setText(event.target.value)
            setOpen(true)
            setActive(0)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          autoFocus={autoFocus}
          type="text"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder={tokens.length ? "" : t("component.search.placeholder")}
          aria-label={t("component.search.searchLabel")}
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            showList ? `${listId}-${activeIndex}` : undefined
          }
          className="h-7 min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {autocomplete.isFetching && canLookup && (
          <Spinner className="text-muted-foreground" />
        )}
        <button
          type="button"
          aria-label={t("component.search.searchLabel")}
          className="flex size-7 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={(event) => {
            event.stopPropagation()
            commit()
          }}
        >
          <MagnifyingGlassIcon className="size-4" />
        </button>
      </div>

      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-50 mt-1.5 max-h-[min(24rem,70svh)] overflow-y-auto rounded-2xl bg-popover p-1 text-popover-foreground shadow-2xl ring-1 ring-foreground/10"
        >
          {suggestions.map((suggestion, index) => {
            const item = describe(suggestion)
            return (
              <li
                key={
                  suggestion.kind === "token"
                    ? tokenKey(suggestion.token)
                    : `${suggestion.kind}:${"mode" in suggestion ? suggestion.mode : ""}`
                }
                id={`${listId}-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 text-sm [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-muted-foreground",
                  index === activeIndex && "bg-accent"
                )}
                // Keep focus in the input so the list does not close first.
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(suggestion)}
              >
                {item.icon}
                <span className="min-w-0 flex-1 truncate">
                  {item.label}
                  {item.hint && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {item.hint}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {item.type}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
