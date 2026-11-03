import { useRef, useState, type KeyboardEvent } from "react"
import { cn } from "cn"

import { ArrowClockwiseIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useT } from "@/lib/i18n"
import {
  isBindable,
  isOverridden,
  keyFor,
  keyFromEvent,
  shortcutsInGroup,
  SWAP_SHORTCUTS,
  type ShortcutGroup,
  type ShortcutId,
} from "@/lib/multiview/shortcuts"
import { useMultiviewShortcuts } from "@/stores/multiview-shortcuts"
import { useMultiviewUi } from "@/stores/multiview-ui"
import { KeyCaps } from "./shortcut-hint"

const isSwap = (id: ShortcutId) =>
  (SWAP_SHORTCUTS as readonly ShortcutId[]).includes(id)

/** Laid out by hand, as the groups differ too much in length to flow evenly. */
const COLUMNS: readonly (readonly ShortcutGroup[])[] = [
  ["playback", "audio"],
  ["layout"],
  ["sync"],
]

function useShortcutLabels(): Record<ShortcutId, string> {
  const { t } = useT()
  const swap = (position: number) =>
    t("views.multiview.shortcuts.swapPosition", [position])
  return {
    "play-pause": t("views.multiview.shortcuts.playPause"),
    "seek-back": t("views.multiview.shortcuts.seekBack"),
    "seek-forward": t("views.multiview.shortcuts.seekForward"),
    "catch-up": t("views.multiview.syncAll"),
    "reload-all": t("views.multiview.reloadAll"),

    mute: t("views.multiview.shortcuts.mute"),
    "unmute-all": t("views.multiview.unmuteAll"),
    "audio-focus": t("views.multiview.muteOthers"),
    "hear-previous": t("views.multiview.shortcuts.hearPrevious"),
    "hear-next": t("views.multiview.shortcuts.hearNext"),
    "volume-up": t("views.multiview.shortcuts.volumeUp"),
    "volume-down": t("views.multiview.shortcuts.volumeDown"),

    director: t("views.multiview.director.mode"),
    "screen-next": t("views.multiview.shortcuts.screenNext"),
    "screen-previous": t("views.multiview.shortcuts.screenPrevious"),
    "swap-1": swap(1),
    "swap-2": swap(2),
    "swap-3": swap(3),
    "swap-4": swap(4),
    "swap-5": swap(5),
    "swap-6": swap(6),
    "swap-7": swap(7),
    "swap-8": swap(8),
    "swap-9": swap(9),
    edit: t("views.multiview.edit.enter"),
    undo: t("views.multiview.edit.undo"),
    redo: t("views.multiview.edit.redo"),
    "add-video": t("views.multiview.addVideo"),
    "add-cell": t("views.multiview.addframe"),
    presets: t("views.multiview.presets"),
    "media-controls": t("views.multiview.mediaControls"),
    fullscreen: t("views.multiview.fullScreen"),
    toolbar: t("views.multiview.shortcuts.toolbar"),
    help: t("views.multiview.shortcuts.help"),

    "sync-bar": t("views.multiview.shortcuts.syncBar"),
    "sync-play-pause": t("views.multiview.shortcuts.syncPlayPause"),
    "sync-back": t("views.multiview.shortcuts.syncBack"),
    "sync-forward": t("views.multiview.shortcuts.syncForward"),
    "sync-slower": t("views.multiview.shortcuts.syncSlower"),
    "sync-faster": t("views.multiview.shortcuts.syncFaster"),
  }
}

function useGroupNames(): Record<ShortcutGroup, string> {
  const { t } = useT()
  return {
    playback: t("views.multiview.shortcuts.groupPlayback"),
    audio: t("views.multiview.shortcuts.groupAudio"),
    layout: t("views.multiview.shortcuts.groupLayout"),
    sync: t("views.multiview.archiveSync"),
  }
}

/** Every shortcut, grouped, and the place to change them. */
export function ShortcutHelp() {
  const { t } = useT()
  const open = useMultiviewUi((s) => s.helpOpen)
  const setUi = useMultiviewUi((s) => s.set)
  const overrides = useMultiviewShortcuts((s) => s.overrides)
  const characterKeys = useMultiviewShortcuts((s) => s.characterKeys)
  const setCharacterKeys = useMultiviewShortcuts((s) => s.setCharacterKeys)
  const resetAll = useMultiviewShortcuts((s) => s.resetAll)
  const labels = useShortcutLabels()
  const groups = useGroupNames()
  const [choosing, setChoosing] = useState<ShortcutId | null>(null)
  const [message, setMessage] = useState("")
  const title = useRef<HTMLHeadingElement>(null)

  const chooser = (id: ShortcutId): ChooserProps => ({
    id,
    label: labels[id],
    choosing: choosing === id,
    onChoose: () => {
      setMessage("")
      setChoosing(id)
    },
    onChosen: (displaced) => {
      setChoosing(null)
      setMessage(
        displaced
          ? t("views.multiview.shortcuts.displaced", [labels[displaced]])
          : ""
      )
    },
    onRefused: () => setMessage(t("views.multiview.shortcuts.reserved")),
  })

  const close = () => {
    setChoosing(null)
    setMessage("")
    setUi({ helpOpen: false })
  }

  return (
    <Dialog
      open={open}
      // Escape while choosing a key only stops choosing.
      onOpenChange={(next) => {
        if (!next && !choosing) close()
      }}
    >
      <DialogContent
        className="flex max-h-[90vh] flex-col gap-4 sm:max-w-3xl lg:max-w-6xl"
        // Not the first key: one press of Enter should not start rebinding it.
        initialFocus={title}
        onKeyDown={(event: KeyboardEvent) => {
          if (choosing) return
          const pressed = keyFromEvent(event)
          if (pressed && pressed === keyFor("help", overrides)) close()
        }}
      >
        <DialogHeader>
          <DialogTitle ref={title} tabIndex={-1} className="outline-none">
            {t("views.multiview.shortcuts.title")}
          </DialogTitle>
          <DialogDescription>
            {t("views.multiview.shortcuts.detail")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid min-h-0 flex-1 gap-x-8 gap-y-5 overflow-y-auto pr-1 md:grid-cols-2 lg:grid-cols-3">
          {COLUMNS.map((column, index) => (
            <div key={index} className="flex flex-col gap-5">
              {column.map((group) => (
                <section key={group}>
                  <GroupHeading>{groups[group]}</GroupHeading>
                  <ul className="flex flex-col">
                    {shortcutsInGroup(group)
                      .filter((id) => !isSwap(id))
                      .map((id) => (
                        <ShortcutRow key={id} {...chooser(id)} />
                      ))}
                    {group === "layout" && <SwapRow chooser={chooser} />}
                  </ul>
                </section>
              ))}
              {index === COLUMNS.length - 1 && <EditModeKeys />}
            </div>
          ))}
        </div>

        <p
          role="status"
          className="min-h-5 text-sm text-muted-foreground empty:hidden"
        >
          {message}
        </p>

        <div className="flex flex-wrap items-start justify-between gap-3 border-t pt-3">
          <Label
            htmlFor="mv-character-keys"
            className="max-w-xl items-start gap-3"
          >
            <Switch
              id="mv-character-keys"
              checked={characterKeys}
              onCheckedChange={setCharacterKeys}
            />
            <span className="flex flex-col gap-0.5">
              {t("views.multiview.shortcuts.characterKeys")}
              <span className="text-xs font-normal text-muted-foreground">
                {t("views.multiview.shortcuts.characterKeysDetail")}
              </span>
            </span>
          </Label>
          <Button
            variant="outline"
            size="sm"
            disabled={!Object.keys(overrides).length}
            onClick={() => {
              resetAll()
              setMessage("")
            }}
          >
            <ArrowClockwiseIcon data-icon="inline-start" />
            {t("views.multiview.shortcuts.resetAll")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function GroupHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
      {children}
    </h3>
  )
}

interface ChooserProps {
  id: ShortcutId
  label: string
  choosing: boolean
  onChoose: () => void
  onChosen: (displaced: ShortcutId | null) => void
  onRefused: () => void
}

function ShortcutRow(props: ChooserProps) {
  const { t } = useT()
  const { id, label } = props
  const changed = useMultiviewShortcuts((s) => isOverridden(id, s.overrides))
  const reset = useMultiviewShortcuts((s) => s.reset)

  return (
    <li className="flex min-h-8 items-center gap-2 border-b border-border/50 py-0.5 text-sm last:border-b-0">
      <span className="min-w-0 flex-1 truncate" title={label}>
        {label}
      </span>
      {changed && (
        <Button
          variant="ghost"
          size="icon-xs"
          aria-label={t("views.multiview.shortcuts.reset", [label])}
          title={t("views.multiview.shortcuts.reset", [label])}
          onClick={() => reset(id)}
        >
          <ArrowClockwiseIcon />
        </Button>
      )}
      <KeyChooser {...props} className="min-w-14" />
    </li>
  )
}

/** Nine keys for one idea, so they share a row, each still changeable. */
function SwapRow({ chooser }: { chooser: (id: ShortcutId) => ChooserProps }) {
  const { t } = useT()
  return (
    <li className="flex flex-col gap-0.5 border-b border-border/50 py-1 text-sm last:border-b-0">
      <span>{t("views.multiview.shortcuts.swapRow")}</span>
      <span className="flex flex-wrap gap-0.5">
        {SWAP_SHORTCUTS.map((id) => (
          <KeyChooser key={id} {...chooser(id)} className="min-w-7" />
        ))}
      </span>
    </li>
  )
}

function KeyChooser({
  id,
  label,
  choosing,
  onChoose,
  onChosen,
  onRefused,
  className,
}: ChooserProps & { className?: string }) {
  const { t } = useT()
  const shortcut = useMultiviewShortcuts((s) => keyFor(id, s.overrides))
  const rebind = useMultiviewShortcuts((s) => s.rebind)

  const onKeyDown = (event: KeyboardEvent) => {
    if (!choosing) return
    // Tab must keep moving focus, or the keyboard is stuck on this button.
    if (event.key === "Tab") {
      onChosen(null)
      return
    }
    event.preventDefault()
    event.stopPropagation()
    if (event.key === "Escape") {
      onChosen(null)
      return
    }
    if (event.key === "Delete" || event.key === "Backspace") {
      rebind(id, null)
      onChosen(null)
      return
    }
    const pressed = keyFromEvent(event)
    if (!pressed) return
    if (!isBindable(pressed)) {
      onRefused()
      return
    }
    onChosen(rebind(id, pressed))
  }

  return (
    <button
      type="button"
      className={cn(
        "flex min-h-6 cursor-pointer items-center justify-center rounded-md px-1 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring aria-pressed:ring-2 aria-pressed:ring-primary",
        className
      )}
      aria-pressed={choosing}
      aria-label={t("views.multiview.shortcuts.change", [
        label,
        shortcut ?? t("views.multiview.shortcuts.none"),
      ])}
      onClick={() => (choosing ? onChosen(null) : onChoose())}
      onBlur={() => choosing && onChosen(null)}
      onKeyDown={onKeyDown}
    >
      {choosing ? (
        <span className="text-xs text-primary">
          {t("views.multiview.shortcuts.pressKey")}
        </span>
      ) : shortcut ? (
        <KeyCaps shortcut={shortcut} />
      ) : (
        <span className="text-xs text-muted-foreground">
          {t("views.multiview.shortcuts.none")}
        </span>
      )}
    </button>
  )
}

/** Keys that belong to a cell being edited, listed so they can be found. */
function EditModeKeys() {
  const { t } = useT()
  const rows = [
    { label: t("views.multiview.shortcuts.editMove"), keys: "ArrowUp" },
    { label: t("views.multiview.shortcuts.editResize"), keys: "Shift+ArrowUp" },
    { label: t("views.multiview.shortcuts.editDelete"), keys: "Delete" },
    { label: t("views.multiview.shortcuts.editLeave"), keys: "Escape" },
  ]
  return (
    <section>
      <GroupHeading>{t("views.multiview.shortcuts.groupEditing")}</GroupHeading>
      <ul className="flex flex-col">
        {rows.map(({ label, keys }) => (
          <li
            key={keys}
            className="flex min-h-8 items-center gap-2 border-b border-border/50 py-0.5 text-sm text-muted-foreground last:border-b-0"
          >
            <span className="min-w-0 flex-1 truncate" title={label}>
              {label}
            </span>
            <span className="flex min-w-14 justify-center px-1">
              <KeyCaps shortcut={keys} />
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
