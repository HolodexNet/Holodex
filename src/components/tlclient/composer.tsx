import {
  useImperativeHandle,
  useRef,
  useState,
  useSyncExternalStore,
  type Ref,
} from "react"
import { Link } from "react-router"
import { toast } from "sonner"
import { cn } from "cn"

import {
  ClockCountdownIcon,
  KeyboardIcon,
  PencilSimpleIcon,
  XIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Kbd } from "@/components/ui/kbd"
import { useT } from "@/lib/i18n"
import { formatDuration } from "@/lib/time"
import {
  CHAT_LIMITS,
  canChangeLine,
  chatLength,
  chatLine,
  composeLine,
  cycleSpeaker,
  defaultChatTag,
  lineTimestamp,
  slotForKey,
} from "@/lib/tlclient/lines"
import { useAuth } from "@/stores/auth"
import { useTlClient } from "@/stores/tlclient"
import { focusComposer, registerComposer } from "./chat-registry"
import { DestinationBar } from "./destinations"
import { ALT_KEY, SpeakerStrip } from "./speakers"
import type { Outbox } from "./use-outbox"
import type { Destination } from "./helpers"

export interface ComposerHandle {
  /** Loads one of this session's lines into the box to be corrected. */
  startEdit: (localId: string) => void
}

/** Chat counters stay out of the way until a line gets near the limit. */
const COUNTER_MARGIN = 40

const frameHasFocus = () => document.activeElement?.tagName === "IFRAME"

/** An embed can take the keyboard without the page being told, so look now and then. */
function subscribeFrameFocus(listener: () => void) {
  const afterBlur = () => setTimeout(listener)
  window.addEventListener("blur", afterBlur)
  window.addEventListener("focus", listener)
  document.addEventListener("focusin", listener)
  const timer = setInterval(listener, 1000)
  return () => {
    window.removeEventListener("blur", afterBlur)
    window.removeEventListener("focus", listener)
    document.removeEventListener("focusin", listener)
    clearInterval(timer)
  }
}

const clockTime = (ms: number) =>
  new Date(ms).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })

export function Composer({
  ref,
  lang,
  startMs,
  destinations,
  disabled,
  onToggleDestination,
  participants,
  outbox,
  editing,
  onEditingChange,
}: {
  ref?: Ref<ComposerHandle>
  lang: string
  startMs: number | null
  destinations: Destination[]
  disabled: ReadonlySet<string>
  onToggleDestination: (key: string) => void
  participants: string[]
  outbox: Outbox
  editing: string | null
  onEditingChange: (localId: string | null) => void
}) {
  const { t } = useT()
  const user = useAuth((s) => s.user)
  const speakers = useTlClient((s) => s.speakers)
  const activeId = useTlClient((s) => s.activeSpeaker)
  const chatTagSetting = useTlClient((s) => s.chatTag)
  const stampOnType = useTlClient((s) => s.stampOnType)
  const tabCycles = useTlClient((s) => s.tabCyclesSpeakers)
  const setSetting = useTlClient((s) => s.set)
  const [text, setText] = useState("")
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [nudge, setNudge] = useState<string | null>(null)
  // What was being typed before an edit began, to put back afterwards.
  const draft = useRef<{
    text: string
    startedAt: number | null
    speakerId: string | null
  } | null>(null)
  const keyboardAway = useSyncExternalStore(subscribeFrameFocus, frameHasFocus)
  const awayInPlayer =
    keyboardAway && !!document.activeElement?.closest("[data-tl-player]")

  const slot = speakers.findIndex((s) => s.id === activeId) + 1
  const speaker = slot > 0 ? speakers[slot - 1] : null
  const selectSlot = (index: number) =>
    setSetting(
      "activeSpeaker",
      index > 0 ? (speakers[index - 1]?.id ?? null) : null
    )

  const chatTag = chatTagSetting ?? defaultChatTag(lang)
  const enabled = destinations.filter((d) => !disabled.has(d.key))
  const rooms = enabled.flatMap((d) => (d.kind === "room" ? [d.room] : []))
  const relays = enabled.flatMap((d) => (d.kind === "chat" ? [d.relay] : []))
  const editingLine = editing
    ? (outbox.lines.find((line) => line.localId === editing) ?? null)
    : null
  const editable = outbox.lines.filter(canChangeLine)

  const composed = composeLine(text, speaker)
  const limit =
    relays.length && !editingLine
      ? Math.min(...relays.map((relay) => CHAT_LIMITS[relay.provider]))
      : null
  const chatCount = chatLength(chatLine(composed, chatTag))
  const over = limit !== null && !!composed && chatCount > limit
  const showCount =
    limit !== null && !!composed && chatCount >= limit - COUNTER_MARGIN

  const canPost = !!user && (rooms.length > 0 || relays.length > 0)
  // TLdex matches a chat copy with the posted line only within five seconds,
  // and times the chat copy on arrival; a backdated line would count twice.
  const backdate =
    stampOnType && !enabled.some((d) => d.kind === "chat" && d.indexed)

  const startEdit = (localId: string) => {
    const line = outbox.lines.find((l) => l.localId === localId)
    if (!line || !canChangeLine(line)) return
    if (!editingLine) draft.current = { text, startedAt, speakerId: activeId }
    onEditingChange(localId)
    setText(line.body)
    setNudge(null)
    setSetting(
      "activeSpeaker",
      speakers.some((s) => s.id === line.speakerId) ? line.speakerId : null
    )
    focusComposer()
  }

  const stopEdit = () => {
    const saved = draft.current
    draft.current = null
    onEditingChange(null)
    setText(saved?.text ?? "")
    setStartedAt(saved?.startedAt ?? null)
    if (saved) setSetting("activeSpeaker", saved.speakerId)
  }

  useImperativeHandle(ref, () => ({ startEdit }))

  const submit = async () => {
    if (!text.trim()) return
    if (editingLine) {
      if (editingLine.busy) return
      const result = await outbox.edit(editingLine.localId, text, speaker)
      if (result === "ok") stopEdit()
      else if (result === "merged") {
        // Nothing of ours to correct; the correction can go out as a new line.
        draft.current = null
        onEditingChange(null)
        setStartedAt(null)
        toast.info(t("tlClient.errors.editMerged"), { position: "top-center" })
      }
      return
    }
    if (!user) return
    if (!rooms.length && !relays.length) {
      setNudge(t("tlClient.composer.noDestinations"))
      return
    }
    outbox.send({
      lang,
      body: text,
      speaker,
      timestamp: lineTimestamp(startedAt, Date.now(), backdate),
      rooms,
      relays,
      chatTag,
    })
    setText("")
    setStartedAt(null)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // An input method is still composing: Enter picks a candidate, not "send".
    if (event.nativeEvent.isComposing || event.keyCode === 229) return

    // Alt+1 is no speaker, Alt+2 to 9 the speakers. Only the top row: Alt with
    // the number pad is how Windows types characters such as ♪. AltGr reports
    // Ctrl+Alt; skip it.
    const digit = /^Digit(\d)$/.exec(event.code)?.[1]
    if (
      digit !== undefined &&
      event.altKey &&
      !event.ctrlKey &&
      !event.metaKey
    ) {
      event.preventDefault()
      const picked = slotForKey(Number(digit), speakers.length)
      if (picked !== null) selectSlot(picked)
      return
    }

    switch (event.key) {
      case "Enter":
        if (event.shiftKey) return
        event.preventDefault()
        void submit()
        return
      case "Tab":
        if (!tabCycles || !speakers.length) return
        if (event.ctrlKey || event.altKey || event.metaKey) return
        event.preventDefault()
        selectSlot(cycleSpeaker(slot, speakers.length, event.shiftKey ? -1 : 1))
        return
      case "ArrowUp": {
        // From an empty box, or from an unchanged line being edited.
        if (editingLine ? text !== editingLine.body : text) return
        const at = editingLine ? editable.indexOf(editingLine) : editable.length
        const previous = editable[at - 1]
        if (!previous) return
        event.preventDefault()
        startEdit(previous.localId)
        return
      }
      case "ArrowDown": {
        if (!editingLine || text !== editingLine.body) return
        event.preventDefault()
        const next = editable[editable.indexOf(editingLine) + 1]
        if (next) startEdit(next.localId)
        else stopEdit()
        return
      }
      case "Escape":
        if (editingLine) {
          event.preventDefault()
          stopEdit()
        } else if (text) {
          event.preventDefault()
          setText("")
          setStartedAt(null)
        }
        return
    }
  }

  const stampLabel =
    startedAt === null
      ? null
      : startMs && startedAt >= startMs
        ? formatDuration(startedAt - startMs)
        : clockTime(startedAt)
  const editingLabel = editingLine
    ? startMs && editingLine.timestamp >= startMs
      ? formatDuration(editingLine.timestamp - startMs)
      : clockTime(editingLine.timestamp)
    : null

  return (
    <div className="shrink-0 border-t bg-background px-2 pt-1.5 pb-[calc(0.5rem+env(safe-area-inset-bottom))] sm:px-3">
      <SpeakerStrip
        slot={slot}
        onSelect={selectSlot}
        participants={participants}
      />
      {editingLine && (
        <div className="mb-1.5 flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1 text-xs">
          <PencilSimpleIcon className="size-3.5 shrink-0 text-primary" />
          <span className="font-medium">
            {t("tlClient.composer.editing", [editingLabel ?? ""])}
          </span>
          <span className="hidden min-w-0 truncate text-muted-foreground sm:inline">
            {t("tlClient.composer.editingHint")}
          </span>
          <Button
            variant="ghost"
            size="icon-xs"
            className="ml-auto"
            aria-label={t("views.app.close_btn")}
            onClick={stopEdit}
          >
            <XIcon />
          </Button>
        </div>
      )}
      <div className="relative flex items-stretch gap-2">
        <label
          className={cn(
            "flex min-w-0 flex-1 cursor-text items-center rounded-xl border bg-card shadow-xs transition-colors focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/40",
            editingLine && "border-primary/60",
            over && "border-destructive/70"
          )}
        >
          <span className="sr-only">{t("tlClient.composer.label")}</span>
          {stampLabel && backdate && !editingLine && (
            <button
              type="button"
              title={t("tlClient.composer.stamp", [stampLabel])}
              aria-label={t("tlClient.composer.stamp", [stampLabel])}
              onClick={() => {
                setStartedAt(Date.now())
                focusComposer()
              }}
              className="ml-1.5 flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-xs text-muted-foreground tabular-nums hover:bg-muted hover:text-foreground"
            >
              <ClockCountdownIcon className="size-3.5" />
              {stampLabel}
            </button>
          )}
          {speaker?.prefix && (
            <span className="shrink-0 pl-2.5 text-base whitespace-pre text-primary/80 select-none">
              {speaker.prefix}
            </span>
          )}
          <input
            ref={registerComposer}
            value={text}
            disabled={!user && !editingLine}
            autoFocus
            autoComplete="off"
            spellCheck
            enterKeyHint="send"
            placeholder={
              !user
                ? t("tlClient.composer.login")
                : editingLine
                  ? t("tlClient.composer.placeholderEditing")
                  : t("tlClient.composer.placeholder")
            }
            onChange={(event) => {
              const value = event.target.value
              setText(value)
              setNudge(null)
              if (editingLine) return
              if (!value.trim()) setStartedAt(null)
              else if (startedAt === null) setStartedAt(Date.now())
            }}
            onKeyDown={onKeyDown}
            className={cn(
              "h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed",
              speaker?.prefix ? "pl-0" : "pl-3",
              speaker?.suffix ? "pr-0" : "pr-3"
            )}
          />
          {speaker?.suffix && (
            <span className="shrink-0 pr-2.5 text-base whitespace-pre text-primary/80 select-none">
              {speaker.suffix}
            </span>
          )}
          {showCount && (
            <span
              title={
                over
                  ? t("tlClient.composer.tooLong", [chatCount - limit!, limit!])
                  : t("tlClient.composer.charsLeft", [limit! - chatCount])
              }
              className={cn(
                "shrink-0 pr-3 text-xs tabular-nums",
                over ? "font-medium text-destructive" : "text-muted-foreground"
              )}
            >
              {limit! - chatCount}
            </span>
          )}
        </label>
        {user || editingLine ? (
          <Button
            size="lg"
            className="h-auto shrink-0 rounded-xl px-4"
            disabled={
              !text.trim() || (!editingLine && !canPost) || !!editingLine?.busy
            }
            onClick={() => {
              void submit()
              focusComposer()
            }}
          >
            {editingLine
              ? t("tlClient.composer.save")
              : t("tlClient.composer.send")}
            <Kbd className="hidden bg-primary-foreground/20 text-primary-foreground sm:inline-flex">
              ⏎
            </Kbd>
          </Button>
        ) : (
          <Button
            size="lg"
            className="h-auto shrink-0 rounded-xl"
            nativeButton={false}
            render={<Link to="/login" />}
          >
            {t("component.mainNav.login")}
          </Button>
        )}
        {keyboardAway && (
          <button
            type="button"
            onClick={focusComposer}
            className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-background/85 text-sm backdrop-blur-[2px] outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <KeyboardIcon className="size-4 shrink-0" />
            <span className="text-muted-foreground">
              {awayInPlayer
                ? t("tlClient.composer.keyboardAwayPlayer")
                : t("tlClient.composer.keyboardAwayChat")}
            </span>
            <span className="font-medium text-primary">
              {t("tlClient.composer.keyboardBack")}
            </span>
          </button>
        )}
      </div>
      {(over || nudge) && (
        <p role="status" className="mt-1 px-1 text-xs text-destructive">
          {nudge ??
            t("tlClient.composer.tooLong", [chatCount - limit!, limit!])}
        </p>
      )}
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
        <DestinationBar
          destinations={destinations}
          disabled={disabled}
          onToggle={onToggleDestination}
          lines={outbox.lines}
          chatTag={chatTag}
        />
        <KeyHints />
      </div>
    </div>
  )
}

function KeyHints() {
  const { t } = useT()
  return (
    <p className="ml-auto hidden items-center gap-3 text-[11px] text-muted-foreground lg:flex">
      <span className="flex items-center gap-1">
        <Kbd>⏎</Kbd> {t("tlClient.composer.send")}
      </span>
      <span className="flex items-center gap-1">
        <Kbd>Tab</Kbd> {t("tlClient.shortcuts.nextSpeaker")}
      </span>
      <span className="flex items-center gap-1">
        <Kbd>{ALT_KEY}</Kbd>+<Kbd>1</Kbd> {t("tlClient.speakers.none")}
      </span>
      <span className="flex items-center gap-1">
        <Kbd>{ALT_KEY}</Kbd>+<Kbd>2–9</Kbd> {t("tlClient.speakers.label")}
      </span>
      <span className="flex items-center gap-1">
        <Kbd>↑</Kbd> {t("tlClient.feed.edit")}
      </span>
      <span className="flex items-center gap-1">
        <Kbd>Esc</Kbd> {t("views.app.close_btn")}
      </span>
    </p>
  )
}
