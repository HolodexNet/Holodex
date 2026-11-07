import { useMemo } from "react"
import { cn } from "cn"

import {
  LogoTwitchIcon,
  LogoYoutubeIcon,
  TldexIcon,
  WarningIcon,
} from "@/components/icons"
import { useT } from "@/lib/i18n"
import type { DeliveryState, OwnLine } from "@/lib/tlclient/lines"
import { StatusDot, useExtensionDetected, useRelayStatus } from "./chat-column"
import type { Destination } from "./helpers"

const keepFocus = (event: React.MouseEvent) => event.preventDefault()

/**
 * Where the next line goes, as toggles. Each shows how its last line fared, so
 * a room that has started failing is visible before anyone goes looking.
 */
export function DestinationBar({
  destinations,
  disabled,
  onToggle,
  lines,
  chatTag,
}: {
  destinations: Destination[]
  disabled: ReadonlySet<string>
  onToggle: (key: string) => void
  lines: OwnLine[]
  chatTag: string
}) {
  const { t } = useT()
  const detected = useExtensionDetected()
  const lastState = useMemo(() => {
    const states = new Map<string, DeliveryState>()
    for (let i = lines.length - 1; i >= 0; i--) {
      for (const [key, delivery] of Object.entries(lines[i].rooms)) {
        if (!states.has(key)) states.set(key, delivery.state)
      }
    }
    return states
  }, [lines])

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1">
      <span className="mr-0.5 text-[11px] text-muted-foreground">
        {t("tlClient.destinations.label")}
      </span>
      {destinations.map((destination) =>
        destination.kind === "room" ? (
          <RoomChip
            key={destination.key}
            destination={destination}
            off={disabled.has(destination.key)}
            state={lastState.get(destination.key)}
            onToggle={onToggle}
          />
        ) : (
          <ChatChip
            key={destination.key}
            destination={destination}
            off={disabled.has(destination.key)}
            detected={detected}
            chatTag={chatTag}
            onToggle={onToggle}
          />
        )
      )}
    </div>
  )
}

function Chip({
  off,
  title,
  onClick,
  children,
}: {
  off: boolean
  title: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={!off}
      title={title}
      onMouseDown={keepFocus}
      onClick={onClick}
      className={cn(
        "flex h-6 max-w-48 min-w-0 items-center gap-1.5 rounded-md border px-2 text-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
        off
          ? "border-dashed text-muted-foreground line-through decoration-muted-foreground/50 hover:bg-muted/50"
          : "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
      )}
    >
      {children}
    </button>
  )
}

function RoomChip({
  destination,
  off,
  state,
  onToggle,
}: {
  destination: Extract<Destination, { kind: "room" }>
  off: boolean
  state: DeliveryState | undefined
  onToggle: (key: string) => void
}) {
  const { t } = useT()
  const kind =
    destination.room.kind === "custom"
      ? t("tlClient.destinations.customRoom")
      : t("tlClient.destinations.room")
  return (
    <Chip
      off={off}
      title={[kind, destination.label, off && t("tlClient.destinations.off")]
        .filter(Boolean)
        .join(" · ")}
      onClick={() => onToggle(destination.key)}
    >
      <TldexIcon className="size-3.5 shrink-0" />
      <span className="truncate">{destination.label}</span>
      {!off && (
        <span
          aria-hidden="true"
          className={cn(
            "size-1.5 shrink-0 rounded-full",
            state === "failed"
              ? "bg-destructive"
              : state === "sending"
                ? "animate-pulse bg-amber-500"
                : state === "sent"
                  ? "bg-emerald-500"
                  : "bg-muted-foreground/40"
          )}
        />
      )}
    </Chip>
  )
}

function ChatChip({
  destination,
  off,
  detected,
  chatTag,
  onToggle,
}: {
  destination: Extract<Destination, { kind: "chat" }>
  off: boolean
  detected: boolean
  chatTag: string
  onToggle: (key: string) => void
}) {
  const { t } = useT()
  const status = useRelayStatus(destination.key)
  const youtube = destination.relay.provider === "youtube"
  const Icon = youtube ? LogoYoutubeIcon : LogoTwitchIcon
  return (
    <Chip
      off={off}
      title={[
        youtube
          ? t("tlClient.destinations.youtubeChat")
          : t("tlClient.destinations.twitchChat"),
        destination.label,
        !detected
          ? t("tlClient.chat.noExtension")
          : status !== "ready" && t("tlClient.destinations.connecting"),
        chatTag.trim() &&
          t("tlClient.destinations.chatTagHint", [chatTag.trim()]),
        off && t("tlClient.destinations.off"),
      ]
        .filter(Boolean)
        .join(" · ")}
      onClick={() => onToggle(destination.key)}
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">{destination.label}</span>
      {!off &&
        (detected ? (
          <StatusDot status={status} />
        ) : (
          <WarningIcon className="size-3 shrink-0 text-amber-500" />
        ))}
    </Chip>
  )
}
