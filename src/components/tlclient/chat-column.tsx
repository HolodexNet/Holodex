import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react"
import { Link } from "react-router"
import { cn } from "cn"

import {
  LogoTwitchIcon,
  LogoYoutubeIcon,
  WarningIcon,
} from "@/components/icons"
import { useT } from "@/lib/i18n"
import { useResolvedMode } from "@/lib/theme/use-theme"
import { chatEmbedUrl, extensionDetected } from "@/lib/tlclient/relay"
import type { ChatRelay } from "@/lib/tlclient/session"
import { chatRegistry, type RelayStatus } from "./chat-registry"
import type { Destination } from "./helpers"

type ChatDestination = Extract<Destination, { kind: "chat" }>

export function useRelayStatus(key: string): RelayStatus {
  useSyncExternalStore(chatRegistry.subscribe, chatRegistry.getVersion)
  return chatRegistry.status(key)
}

/** Whether Holodex+ is there; it announces itself as the page loads. */
export function useExtensionDetected() {
  const [detected, setDetected] = useState(extensionDetected)
  useEffect(() => {
    if (detected) return
    const timer = setTimeout(() => setDetected(extensionDetected()), 3000)
    return () => clearTimeout(timer)
  }, [detected])
  return detected
}

/**
 * The live chats lines are typed into. All of them stay loaded, even when not
 * on screen, because Holodex+ can only type into a chat that exists; hiding the
 * column only moves it out of view.
 */
export function ChatColumn({
  chats,
  disabled,
  shown,
  style,
}: {
  chats: ChatDestination[]
  disabled: ReadonlySet<string>
  shown: boolean
  style?: CSSProperties
}) {
  const { t } = useT()
  const [selected, setSelected] = useState<string | null>(null)
  const active = chats.find((chat) => chat.key === selected) ?? chats[0]
  const detected = useExtensionDetected()

  return (
    <aside
      aria-label={t("tlClient.chat.title")}
      aria-hidden={!shown || undefined}
      className={cn(
        "flex min-h-0 flex-col border-l bg-card",
        shown
          ? "min-w-0 shrink-0 grow-0"
          : // Out of view but still laid out and running.
            "pointer-events-none fixed top-0 left-[-200vw] h-150 w-100"
      )}
      style={style}
    >
      {chats.length > 1 && (
        <div
          role="tablist"
          className="flex shrink-0 gap-0.5 overflow-x-auto border-b p-1"
        >
          {chats.map((chat) => (
            <ChatTab
              key={chat.key}
              chat={chat}
              selected={chat.key === active.key}
              off={disabled.has(chat.key)}
              onSelect={() => setSelected(chat.key)}
            />
          ))}
        </div>
      )}
      {!detected && (
        <p className="flex shrink-0 items-start gap-2 border-b bg-amber-500/10 px-3 py-2 text-xs">
          <WarningIcon className="mt-0.5 size-4 shrink-0 text-amber-500" />
          <span>
            {t("tlClient.chat.noExtension")}{" "}
            <Link
              to="/extension"
              className="font-medium text-complement hover:underline"
            >
              Holodex+
            </Link>
          </span>
        </p>
      )}
      <div className="relative min-h-0 flex-1">
        {chats.map((chat) => (
          <ChatFrame
            key={chat.key}
            relay={chat.relay}
            relayKey={chat.key}
            visible={chat.key === active.key}
          />
        ))}
      </div>
    </aside>
  )
}

function ChatTab({
  chat,
  selected,
  off,
  onSelect,
}: {
  chat: ChatDestination
  selected: boolean
  off: boolean
  onSelect: () => void
}) {
  const status = useRelayStatus(chat.key)
  const Icon =
    chat.relay.provider === "twitch" ? LogoTwitchIcon : LogoYoutubeIcon
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onSelect}
      className={cn(
        "flex max-w-40 min-w-0 shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs outline-none hover:bg-muted focus-ring-sm",
        selected && "bg-muted font-medium",
        off && "opacity-50"
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">{chat.label}</span>
      <StatusDot status={status} />
    </button>
  )
}

export function StatusDot({ status }: { status: RelayStatus }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "size-1.5 shrink-0 rounded-full",
        status === "ready"
          ? "bg-emerald-500"
          : status === "connecting"
            ? "animate-pulse bg-amber-500"
            : "bg-muted-foreground/40"
      )}
    />
  )
}

function ChatFrame({
  relay,
  relayKey,
  visible,
}: {
  relay: ChatRelay
  relayKey: string
  visible: boolean
}) {
  const { t } = useT()
  const dark = useResolvedMode() === "dark"
  const src = useMemo(
    () => chatEmbedUrl(relay, window.location.hostname, dark),
    // The relay is identified by its key; a new object for it changes nothing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [relayKey, dark]
  )

  useEffect(() => () => chatRegistry.remove(relayKey), [relayKey])

  return (
    <iframe
      title={t("tlClient.chat.title")}
      src={src}
      onLoad={(event) =>
        chatRegistry.loaded(relayKey, relay.provider, event.currentTarget)
      }
      className={cn(
        "absolute inset-0 size-full border-0",
        !visible && "invisible"
      )}
    />
  )
}
