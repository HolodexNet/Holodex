import { useState } from "react"
import { cn } from "cn"

import {
  ArrowDownIcon,
  ArrowUpIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
  UsersThreeIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useT } from "@/lib/i18n"
import { MAX_SPEAKERS, slotKey } from "@/lib/tlclient/lines"
import { useTlClient } from "@/stores/tlclient"
import { focusComposer } from "./chat-registry"

/** What the speaker shortcut's modifier is called on this keyboard. */
export const ALT_KEY = /Mac|iPhone|iPad/.test(navigator.userAgent) ? "⌥" : "Alt"

/** Pressing these must not take the keyboard away from the composer. */
const keepFocus = (event: React.MouseEvent) => event.preventDefault()

/**
 * Who is talking. Chips are numbered by their shortcut, starting at the left of
 * the number row: 1 for no speaker, 2 to 9 for the speakers. The composer's
 * own keys (Tab, Alt+digit) drive the same selection.
 */
export function SpeakerStrip({
  slot,
  onSelect,
  participants,
}: {
  slot: number
  onSelect: (slot: number) => void
  participants: string[]
}) {
  const { t } = useT()
  const speakers = useTlClient((s) => s.speakers)
  const replaceSpeakers = useTlClient((s) => s.replaceSpeakers)
  const [editing, setEditing] = useState(false)

  return (
    <div className="mb-1.5 flex items-center gap-1">
      <div
        role="radiogroup"
        aria-label={t("tlClient.speakers.label")}
        className="flex min-w-0 scrollbar-none items-center gap-1 overflow-x-auto"
      >
        <SpeakerChip
          slot={0}
          label={t("tlClient.speakers.none")}
          active={slot === 0}
          onSelect={onSelect}
          muted
        />
        {speakers.map((speaker, index) => (
          <SpeakerChip
            key={speaker.id}
            slot={index + 1}
            label={speaker.name}
            title={`${speaker.prefix}…${speaker.suffix}`}
            active={slot === index + 1}
            onSelect={onSelect}
          />
        ))}
      </div>
      {speakers.length < MAX_SPEAKERS && <AddSpeaker onAdded={onSelect} />}
      {participants.length > 0 && speakers.length === 0 && (
        <Button
          variant="outline"
          size="xs"
          className="shrink-0"
          title={t("tlClient.speakers.fromStreamHint")}
          onMouseDown={keepFocus}
          onClick={() => replaceSpeakers(participants)}
        >
          <UsersThreeIcon data-icon="inline-start" />
          {t("tlClient.speakers.fromStream")} ({participants.length})
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon-xs"
        className="shrink-0"
        title={t("tlClient.speakers.edit")}
        aria-label={t("tlClient.speakers.edit")}
        onClick={() => setEditing(true)}
      >
        <PencilSimpleIcon />
      </Button>
      <SpeakersDialog
        open={editing}
        onOpenChange={(open) => {
          setEditing(open)
          if (!open) focusComposer()
        }}
        participants={participants}
      />
    </div>
  )
}

function SpeakerChip({
  slot,
  label,
  title,
  active,
  muted = false,
  onSelect,
}: {
  slot: number
  label: string
  title?: string
  active: boolean
  muted?: boolean
  onSelect: (slot: number) => void
}) {
  const key = slotKey(slot)
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      aria-keyshortcuts={`Alt+${key}`}
      title={title}
      onMouseDown={keepFocus}
      onClick={() => onSelect(slot)}
      className={cn(
        "flex h-6 max-w-40 shrink-0 items-center gap-1.5 rounded-full border pr-2.5 pl-1 text-xs whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card hover:bg-muted",
        !active && muted && "text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "flex size-4 items-center justify-center rounded-full text-[10px] font-semibold tabular-nums",
          active ? "bg-primary-foreground/25" : "bg-muted"
        )}
      >
        {key}
      </span>
      <span className="truncate">{label}</span>
    </button>
  )
}

function AddSpeaker({ onAdded }: { onAdded: (slot: number) => void }) {
  const { t } = useT()
  const addSpeaker = useTlClient((s) => s.addSpeaker)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")

  const add = () => {
    if (!name.trim()) return
    addSpeaker(name)
    // The new speaker is the last slot; select it, ready to type.
    onAdded(useTlClient.getState().speakers.length)
    setName("")
    setOpen(false)
    focusComposer()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            className="shrink-0"
            title={t("tlClient.speakers.add")}
            aria-label={t("tlClient.speakers.add")}
          />
        }
      >
        <PlusIcon />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2">
        <form
          className="flex gap-1.5"
          onSubmit={(event) => {
            event.preventDefault()
            add()
          }}
        >
          <Input
            autoFocus
            value={name}
            placeholder={t("tlClient.speakers.namePlaceholder")}
            aria-label={t("tlClient.speakers.name")}
            onChange={(event) => setName(event.target.value)}
            className="h-8"
          />
          <Button type="submit" size="sm" disabled={!name.trim()}>
            {t("tlClient.setup.add")}
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}

function SpeakersDialog({
  open,
  onOpenChange,
  participants,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  participants: string[]
}) {
  const { t } = useT()
  const speakers = useTlClient((s) => s.speakers)
  const addSpeaker = useTlClient((s) => s.addSpeaker)
  const updateSpeaker = useTlClient((s) => s.updateSpeaker)
  const removeSpeaker = useTlClient((s) => s.removeSpeaker)
  const moveSpeaker = useTlClient((s) => s.moveSpeaker)
  const replaceSpeakers = useTlClient((s) => s.replaceSpeakers)
  const full = speakers.length >= MAX_SPEAKERS

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("tlClient.speakers.title")}</DialogTitle>
          <DialogDescription>
            {t("tlClient.speakers.hint", [ALT_KEY])}
          </DialogDescription>
        </DialogHeader>
        {speakers.length === 0 ? (
          <p className="rounded-lg bg-muted/50 p-4 text-center text-sm text-muted-foreground">
            {t("tlClient.speakers.empty")}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="hidden grid-cols-[1.5rem_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.7fr)_auto] gap-2 px-1 text-xs text-muted-foreground sm:grid">
              <span />
              <span>{t("tlClient.speakers.name")}</span>
              <span>{t("tlClient.speakers.prefix")}</span>
              <span>{t("tlClient.speakers.suffix")}</span>
              <span className="w-24" />
            </div>
            {speakers.map((speaker, index) => (
              <div
                key={speaker.id}
                className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[1.5rem_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.7fr)_auto]"
              >
                <span
                  title={`${ALT_KEY}+${slotKey(index + 1)}`}
                  className="text-center text-xs font-semibold text-muted-foreground tabular-nums"
                >
                  {slotKey(index + 1)}
                </span>
                <Input
                  value={speaker.name}
                  aria-label={`${t("tlClient.speakers.name")} ${index + 1}`}
                  onChange={(event) =>
                    updateSpeaker(speaker.id, { name: event.target.value })
                  }
                  className="h-8"
                />
                <div className="col-start-2 row-start-2 grid grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] gap-2 sm:contents">
                  <Input
                    value={speaker.prefix}
                    placeholder={t("tlClient.speakers.prefix")}
                    aria-label={`${t("tlClient.speakers.prefix")} ${index + 1}`}
                    onChange={(event) =>
                      updateSpeaker(speaker.id, { prefix: event.target.value })
                    }
                    className="h-8 font-mono text-xs"
                  />
                  <Input
                    value={speaker.suffix}
                    placeholder={t("tlClient.speakers.suffix")}
                    aria-label={`${t("tlClient.speakers.suffix")} ${index + 1}`}
                    onChange={(event) =>
                      updateSpeaker(speaker.id, { suffix: event.target.value })
                    }
                    className="h-8 font-mono text-xs"
                  />
                </div>
                <div className="col-start-3 row-start-1 flex w-24 justify-end gap-0.5 sm:col-start-auto">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === 0}
                    aria-label={t("tlClient.speakers.moveUp")}
                    onClick={() => moveSpeaker(speaker.id, -1)}
                  >
                    <ArrowUpIcon />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === speakers.length - 1}
                    aria-label={t("tlClient.speakers.moveDown")}
                    onClick={() => moveSpeaker(speaker.id, 1)}
                  >
                    <ArrowDownIcon />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={t("tlClient.setup.remove")}
                    onClick={() => removeSpeaker(speaker.id)}
                  >
                    <TrashIcon />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={full}
            title={full ? t("tlClient.speakers.full") : undefined}
            onClick={() =>
              addSpeaker(
                `${t("tlClient.speakers.label")} ${slotKey(speakers.length + 1)}`
              )
            }
          >
            <PlusIcon data-icon="inline-start" />
            {t("tlClient.speakers.add")}
          </Button>
          {participants.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              title={t("tlClient.speakers.fromStreamHint")}
              onClick={() => replaceSpeakers(participants)}
            >
              <UsersThreeIcon data-icon="inline-start" />
              {t("tlClient.speakers.replace")} ({participants.length})
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
