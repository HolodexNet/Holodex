import { useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router"

import { MagnifyingGlassIcon } from "@/components/icons"
import {
  SEARCH_BAR_FRAME_CLASS,
  SEARCH_BAR_INPUT_CLASS,
  SEARCH_BAR_SUBMIT_CLASS,
} from "@/components/search/search-bar-styles"
import { useT } from "@/lib/i18n"

/** Keeps song queries and filters separate from Holodex video search. */
export function MusicSearchBar({
  autoFocus,
  onCommit,
}: {
  autoFocus?: boolean
  onCommit?: () => void
}) {
  const { t } = useT()
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
      aria-label={t("musicdex.search.formLabel")}
      className={`${SEARCH_BAR_FRAME_CLASS} min-w-0 flex-1`}
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
        aria-label={t("musicdex.search.inputLabel")}
        placeholder={t("musicdex.search.placeholder")}
        type="text"
        inputMode="search"
        enterKeyHint="search"
        autoComplete="off"
        className={SEARCH_BAR_INPUT_CLASS}
      />
      <button
        type="submit"
        aria-label={t("musicdex.search.submitLabel")}
        className={SEARCH_BAR_SUBMIT_CLASS}
      >
        <MagnifyingGlassIcon className="size-4" />
      </button>
    </form>
  )
}
