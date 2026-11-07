import {
  HANDSHAKE_DELAY_MS,
  relayText,
  sendHandshake,
} from "@/lib/tlclient/relay"
import type { ChatRelay } from "@/lib/tlclient/session"

export type RelayStatus = "loading" | "connecting" | "ready"

/** A backlog is typed in one line at a time, not all in the same instant. */
const BACKLOG_SPACING_MS = 1000

interface Entry {
  /** Null until the chat has loaded. */
  frame: HTMLIFrameElement | null
  provider: ChatRelay["provider"] | null
  status: RelayStatus
  timers: ReturnType<typeof setTimeout>[]
  /** Lines sent before the extension was listening, typed in once it is. */
  pending: string[]
}

const emptyEntry = (): Entry => ({
  frame: null,
  provider: null,
  status: "loading",
  timers: [],
  pending: [],
})

/**
 * The embedded chats the composer can type into, by relay key. The chats are
 * rendered in one place and the composer sends from another, so they meet here.
 */
class ChatRegistry {
  private entries = new Map<string, Entry>()
  private listeners = new Set<() => void>()
  private version = 0

  /** Called when the frame (re)loads: the extension has to be greeted again. */
  loaded(
    key: string,
    provider: ChatRelay["provider"],
    frame: HTMLIFrameElement
  ) {
    const previous = this.entries.get(key)
    previous?.timers.forEach(clearTimeout)
    const entry: Entry = {
      frame,
      provider,
      status: "connecting",
      timers: [],
      pending: previous?.pending ?? [],
    }
    this.entries.set(key, entry)

    const flush = () => {
      const target = frame.contentWindow
      const text = entry.pending.shift()
      if (!target || text === undefined || this.entries.get(key) !== entry)
        return
      relayText(target, provider, text)
      entry.timers.push(setTimeout(flush, BACKLOG_SPACING_MS))
    }
    entry.timers.push(
      setTimeout(() => {
        const target = frame.contentWindow
        if (!target || this.entries.get(key) !== entry) return
        sendHandshake(target, provider)
        entry.status = "ready"
        entry.timers.push(setTimeout(flush, BACKLOG_SPACING_MS / 2))
        this.changed()
      }, HANDSHAKE_DELAY_MS[provider])
    )
    this.changed()
  }

  remove(key: string) {
    const entry = this.entries.get(key)
    if (!entry) return
    entry.timers.forEach(clearTimeout)
    this.entries.delete(key)
    this.changed()
  }

  /**
   * Types a line into a chat, or queues it until the chat and the extension
   * are ready. False only when the text cannot be relayed at all.
   */
  relay(key: string, text: string): boolean {
    let entry = this.entries.get(key)
    if (!entry) {
      entry = emptyEntry()
      this.entries.set(key, entry)
    }
    const target = entry.frame?.contentWindow
    // Behind a backlog, a new line waits its turn so the order holds.
    if (entry.status !== "ready" || entry.pending.length || !target) {
      entry.pending.push(text)
      return true
    }
    return relayText(target, entry.provider!, text)
  }

  status(key: string): RelayStatus {
    return this.entries.get(key)?.status ?? "loading"
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getVersion = () => this.version

  private changed() {
    this.version++
    for (const listener of this.listeners) listener()
  }
}

export const chatRegistry = new ChatRegistry()

// -- The composer's input, which several things hand the keyboard back to ----

let composerInput: HTMLInputElement | null = null

export function registerComposer(input: HTMLInputElement | null) {
  composerInput = input
}

export function focusComposer() {
  composerInput?.focus({ preventScroll: true })
}
