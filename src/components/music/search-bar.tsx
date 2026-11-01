import { useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router"

import { MagnifyingGlassIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"

/** Keeps song queries and filters separate from Holodex video search. */
export function MusicSearchBar({
  autoFocus,
  onCommit,
}: {
  autoFocus?: boolean
  onCommit?: () => void
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const input = useRef<HTMLInputElement>(null)
  const onSearchPage = location.pathname === "/music/search"
  const query = onSearchPage
    ? (new URLSearchParams(location.search).get("q") ?? "")
    : ""

  useEffect(() => {
    const focus = (event: KeyboardEvent) => {
      if (
        event.key !== "/" ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        (event.target instanceof Element &&
          event.target.closest("input, textarea, select, [contenteditable]"))
      )
        return
      event.preventDefault()
      input.current?.focus()
    }
    window.addEventListener("keydown", focus)
    return () => window.removeEventListener("keydown", focus)
  }, [])

  return (
    <form
      role="search"
      aria-label="Musicdex search"
      className="flex min-w-0 flex-1 items-center gap-1 rounded-2xl border border-input bg-input/30 pr-1 pl-3 focus-within:ring-2 focus-within:ring-ring/50"
      onSubmit={(event) => {
        event.preventDefault()
        const params = new URLSearchParams(onSearchPage ? location.search : "")
        const text = input.current?.value.trim() ?? ""
        if (text) params.set("q", text)
        else params.delete("q")
        params.delete("page")
        navigate(`/music/search${params.size ? `?${params}` : ""}`)
        onCommit?.()
      }}
    >
      <input
        key={query}
        ref={input}
        defaultValue={query}
        autoFocus={autoFocus}
        aria-label="Search Musicdex songs and artists"
        placeholder="Search songs and artists"
        type="search"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
      <Button
        type="submit"
        variant="ghost"
        size="icon-sm"
        aria-label="Search music"
      >
        <MagnifyingGlassIcon className="size-4" />
      </Button>
    </form>
  )
}
