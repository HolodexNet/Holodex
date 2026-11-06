import {
  useEffect,
  useEffectEvent,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import { cn } from "cn"

import { MinusIcon, PlusIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useT } from "@/lib/i18n"
import {
  isComposingKey,
  PLAIN_TEXT_INPUT,
  type TimeCommit,
} from "@/lib/video-edit/field"
import { shortcutFromEvent } from "@/lib/video-edit/shortcuts"
import {
  formatTimecode,
  readTime,
  SEGMENT_SECONDS,
  timeSegmentAt,
  timeSegmentRange,
} from "@/lib/video-edit/timecode"
import { useSongEditor } from "@/stores/song-editor"

/** Long enough that one deliberate click never turns into two. */
const HOLD_DELAY_MS = 350
const HOLD_INTERVAL_MS = 110
/** Holding on means the target is further off than it looked, so get there sooner. */
const HOLD_FAST_INTERVAL_MS = 50
const HOLD_FAST_AFTER = 8
const HOLD_BIG_STEPS_AFTER = 24
const PAGE_STEP_SECONDS = 30
/** Scroll distance that counts as one second, which is one notch of a mouse wheel. */
const WHEEL_NOTCH = 100
/** How long "that wasn't a time" stays up after the field has gone back. */
const REJECTED_MS = 2500

/**
 * One step per click, and more for as long as it's held. Out of the tab order,
 * because the arrow keys already do this from inside the field: tabbing from one
 * time to the next shouldn't mean going through two buttons in between.
 */
function StepButton({
  label,
  direction,
  disabled,
  onStep,
}: {
  label: string
  direction: 1 | -1
  disabled?: boolean
  onStep: (delta: number) => void
}) {
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const release = () => clearTimeout(timer.current)
  useEffect(() => () => clearTimeout(timer.current), [])
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      tabIndex={-1}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="touch-manipulation pointer-coarse:size-9"
      onPointerDown={(event) => {
        if (event.button !== 0) return
        event.currentTarget.setPointerCapture(event.pointerId)
        const amount = direction * (event.shiftKey ? 5 : 1)
        onStep(amount)
        let repeats = 0
        const repeat = () => {
          repeats++
          onStep(repeats > HOLD_BIG_STEPS_AFTER ? amount * 5 : amount)
          timer.current = setTimeout(
            repeat,
            repeats > HOLD_FAST_AFTER ? HOLD_FAST_INTERVAL_MS : HOLD_INTERVAL_MS
          )
        }
        timer.current = setTimeout(repeat, HOLD_DELAY_MS)
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onLostPointerCapture={release}
      // A long press on a phone would otherwise open a menu and stop the hold.
      onContextMenu={(event) => event.preventDefault()}
      onClick={(event) => {
        // Pointers were handled on the way down. This is assistive technology.
        if (event.detail === 0) onStep(direction)
      }}
    >
      {direction > 0 ? <PlusIcon /> : <MinusIcon />}
    </Button>
  )
}

/**
 * A time that can be typed any way someone might think of one (see `readTime`),
 * and says what it understood while it's being typed, because `930` or `+30` could
 * mean several things and finding out afterwards is too late.
 *
 * Nothing is committed until Enter, Tab or leaving the field. What can't be read is
 * never committed, and Enter on it stays put to be fixed. Up and Down step whichever
 * part the caret is in, as a native time input does, and keep it selected so that
 * stepping and typing can follow each other without touching the mouse.
 */
export function TimeField({
  label,
  value,
  onCommit,
  onStepButton,
  stepLabels,
  after,
  max,
  disabled,
  invalid,
  marker,
  className,
}: {
  label: string
  value: number
  onCommit: (seconds: number, how: TimeCommit) => void
  /** With `stepLabels`, puts a minus and a plus either side of the field. */
  onStepButton?: (delta: number) => void
  stepLabels?: { earlier: string; later: string }
  /** What this has to come after, which can settle an hour that was left out. */
  after?: number
  max?: number
  disabled?: boolean
  invalid?: boolean
  /** A `data-` attribute to find the input by. */
  marker?: string
  className?: string
}) {
  const { t } = useT()
  const fieldId = useId()
  const hintId = useId()
  const input = useRef<HTMLInputElement>(null)
  const [typed, setTyped] = useState<string | null>(null)
  const [rejected, setRejected] = useState(false)
  /** What to select once the new value is on screen: everything, or one part. */
  const reselect = useRef<"all" | number | null>(null)
  const justFocused = useRef(false)
  /**
   * Leaving on purpose, having already decided what to do with the text. The blur
   * happens before the render that would clear it, so without this, Escape would
   * commit the very thing it was cancelling.
   */
  const settled = useRef(false)
  const limit = max && max > 0 ? max : undefined
  const reading =
    typed === null
      ? null
      : readTime(typed, { base: value, after, max: limit })

  useLayoutEffect(() => {
    const target = reselect.current
    const element = input.current
    if (target === null || !element) return
    reselect.current = null
    if (document.activeElement !== element) return
    if (target === "all") element.select()
    else element.setSelectionRange(...timeSegmentRange(element.value, target))
  })

  useEffect(() => {
    if (!rejected) return
    const timer = setTimeout(() => setRejected(false), REJECTED_MS)
    return () => clearTimeout(timer)
  }, [rejected])

  const commit = (how: TimeCommit) => {
    if (typed === null || !reading) return
    setTyped(null)
    if (reading.kind === "invalid") setRejected(true)
    else if (
      reading.kind === "time" &&
      // Going through a field without changing it shouldn't count as an edit.
      Math.round(reading.seconds) !== Math.round(value)
    )
      onCommit(Math.round(reading.seconds), how)
  }

  const step = (delta: number, select: "all" | number) => {
    // A step continues from what's been typed, if that makes sense as a time.
    const from = reading?.kind === "time" ? reading.seconds : value
    const target = Math.min(Math.max(0, from + delta), limit ?? Infinity)
    setTyped(null)
    setRejected(false)
    if (target === value) return
    reselect.current = select
    onCommit(target, "step")
  }

  // Scrolling over the field steps it a second a notch, up for later. Native rather
  // than onWheel, which React makes passive, so the page can be kept from scrolling.
  const wheel = useEffectEvent((seconds: number) => {
    if (disabled) return
    if (onStepButton) {
      setTyped(null)
      setRejected(false)
      onStepButton(seconds)
    } else step(seconds, "all")
  })
  useEffect(() => {
    const element = input.current
    if (!element) return
    let carried = 0
    const onWheel = (event: WheelEvent) => {
      if (!event.deltaY) return
      event.preventDefault()
      // A mouse sends a notch at a time and a trackpad a stream of small ones.
      carried +=
        event.deltaMode === 1
          ? event.deltaY * 33
          : event.deltaMode === 2
            ? event.deltaY * 100
            : event.deltaY
      const notches = Math.trunc(carried / WHEEL_NOTCH)
      if (!notches) return
      carried -= notches * WHEEL_NOTCH
      wheel(-notches)
    }
    element.addEventListener("wheel", onWheel, { passive: false })
    return () => element.removeEventListener("wheel", onWheel)
  }, [])

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    justFocused.current = false
    if (isComposingKey(event)) return
    const element = event.currentTarget
    const shortcut = shortcutFromEvent(event.nativeEvent)
    if (shortcut === "save") {
      // Saving works from anywhere, and shouldn't leave behind what's being typed.
      commit("save")
      return
    }
    // A field with nothing typed has no text of its own to undo, so a step taken
    // with the arrow keys is taken back here, as anywhere else in the editor.
    if ((shortcut === "undo" || shortcut === "redo") && typed === null) {
      event.preventDefault()
      reselect.current = "all"
      useSongEditor.getState()[shortcut]()
      return
    }
    switch (event.key) {
      case "Enter":
        event.preventDefault()
        if (reading?.kind === "invalid") {
          element.select()
          return
        }
        commit("enter")
        settled.current = true
        element.blur()
        return
      case "Escape":
        event.preventDefault()
        setTyped(null)
        setRejected(false)
        settled.current = true
        element.blur()
        return
      case "ArrowUp":
      case "ArrowDown": {
        event.preventDefault()
        const whole =
          element.selectionStart === 0 &&
          element.selectionEnd === element.value.length
        const segment = whole
          ? 0
          : timeSegmentAt(
              element.value,
              element.selectionStart ?? element.value.length
            )
        step(
          SEGMENT_SECONDS[segment] *
            (event.shiftKey ? 5 : 1) *
            (event.key === "ArrowUp" ? 1 : -1),
          whole ? "all" : segment
        )
        return
      }
      case "PageUp":
      case "PageDown":
        event.preventDefault()
        step(PAGE_STEP_SECONDS * (event.key === "PageUp" ? 1 : -1), "all")
    }
  }

  const bad = rejected || reading?.kind === "invalid"
  let hint: string | null = bad ? t("videoEdit.time.notATime") : null
  if (reading?.kind === "time") {
    const understood = formatTimecode(reading.seconds)
    if (reading.clamped)
      hint = t("videoEdit.time.clamped", { time: understood })
    else if (understood !== typed?.trim()) hint = `→ ${understood}`
  }

  return (
    <div className={cn("grid min-w-0 gap-1", className)}>
      {/* Takes its width from the field, so that a hint can't shift the layout. */}
      <div className="flex w-0 min-w-full items-baseline justify-between gap-2 text-xs text-muted-foreground">
        <label htmlFor={fieldId} className="shrink-0">
          {label}
        </label>
        <span
          id={hintId}
          aria-live="polite"
          title={hint ?? undefined}
          className={cn(
            "min-w-0 truncate tabular-nums",
            bad && "text-destructive"
          )}
        >
          {hint}
        </span>
      </div>
      <div className="flex items-center gap-0.5">
        {onStepButton && stepLabels && (
          <StepButton
            label={stepLabels.earlier}
            direction={-1}
            disabled={disabled}
            onStep={onStepButton}
          />
        )}
        <Input
          {...PLAIN_TEXT_INPUT}
          {...(marker ? { [`data-${marker}`]: "" } : {})}
          ref={input}
          id={fieldId}
          value={typed ?? formatTimecode(value)}
          disabled={disabled}
          aria-invalid={invalid || bad || undefined}
          aria-describedby={hintId}
          title={t("videoEdit.time.formats")}
          // The number pad, on a phone. Digits read from the right and a dot works
          // as a colon, so nothing is lost by not having a colon key.
          inputMode="decimal"
          enterKeyHint="done"
          className="h-8 w-20 px-2 text-center tabular-nums pointer-coarse:h-9"
          onFocus={(event) => {
            justFocused.current = true
            event.currentTarget.select()
          }}
          onMouseUp={(event) => {
            // Letting go of the click that focused it would drop the selection.
            if (justFocused.current) event.preventDefault()
            justFocused.current = false
          }}
          onChange={(event) => {
            reselect.current = null
            setRejected(false)
            setTyped(event.target.value)
          }}
          onBlur={() => {
            justFocused.current = false
            if (!settled.current) commit("blur")
            settled.current = false
          }}
          onKeyDown={onKeyDown}
        />
        {onStepButton && stepLabels && (
          <StepButton
            label={stepLabels.later}
            direction={1}
            disabled={disabled}
            onStep={onStepButton}
          />
        )}
      </div>
    </div>
  )
}
