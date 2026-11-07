import type { ChatRelay } from "./session.ts"

/**
 * The Holodex+ extension's chat bridge. Inside an embedded YouTube or Twitch
 * chat, the extension listens for `{ n: "HolodexSync", d }` messages from the
 * page: "Initiate" sets it up, and any other text is typed into the chat box and
 * sent as the viewer's own account. There is no acknowledgement, so a relay can
 * only ever be "requested", never confirmed.
 */

declare global {
  interface Window {
    /** Set by older versions of the Holodex+ extension. */
    HOLODEX_PLUS_INSTALLED?: boolean
  }
}

const ORIGINS: Record<ChatRelay["provider"], string> = {
  youtube: "https://www.youtube.com",
  twitch: "https://www.twitch.tv",
}

const HANDSHAKE = "Initiate"

/**
 * The extension needs a moment after the chat loads before it listens; the old
 * client waited five seconds for YouTube, and so does this.
 */
export const HANDSHAKE_DELAY_MS: Record<ChatRelay["provider"], number> = {
  youtube: 5000,
  twitch: 0,
}

export function extensionDetected(): boolean {
  return !!(window.HOLODEX_PLUS_INSTALLED_V3 || window.HOLODEX_PLUS_INSTALLED)
}

export function sendHandshake(target: Window, provider: ChatRelay["provider"]) {
  target.postMessage({ n: "HolodexSync", d: HANDSHAKE }, ORIGINS[provider])
}

/** False when the text cannot be relayed, because it is the handshake itself. */
export function relayText(
  target: Window,
  provider: ChatRelay["provider"],
  text: string
): boolean {
  if (text === HANDSHAKE) return false
  target.postMessage({ n: "HolodexSync", d: text }, ORIGINS[provider])
  return true
}

export function chatEmbedUrl(
  relay: ChatRelay,
  hostname: string,
  dark: boolean
): string {
  if (relay.provider === "twitch") {
    const params = new URLSearchParams({ parent: hostname })
    if (dark) params.set("darkpopout", "")
    return `https://www.twitch.tv/embed/${encodeURIComponent(relay.channel)}/chat?${params}`
  }
  const params = new URLSearchParams({
    v: relay.videoId,
    embed_domain: hostname,
    dark_theme: dark ? "1" : "0",
  })
  return `https://www.youtube.com/live_chat?${params}`
}
