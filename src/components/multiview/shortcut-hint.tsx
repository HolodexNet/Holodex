import { cn } from "cn"

import { Kbd, KbdGroup } from "@/components/ui/kbd"
import {
  ariaKey,
  compactKey,
  isCharacterKey,
  keyFor,
  keyParts,
  type ShortcutId,
} from "@/lib/multiview/shortcuts"
import { useMultiviewShortcuts } from "@/stores/multiview-shortcuts"

export const IS_MAC =
  typeof navigator !== "undefined" &&
  /Mac|iP(hone|ad|od)/.test(navigator.userAgent)

/** The key that will actually run this right now, if any will. */
export function useShortcutKey(id: ShortcutId | undefined): string | null {
  const key = useMultiviewShortcuts((s) =>
    id ? keyFor(id, s.overrides) : null
  )
  const characterKeys = useMultiviewShortcuts((s) => s.characterKeys)
  return key && (characterKeys || !isCharacterKey(key)) ? key : null
}

/** A label that names the key, and tells assistive technology about it. */
export function useShortcutLabel(id: ShortcutId | undefined, label: string) {
  const key = useShortcutKey(id)
  return {
    title: key ? `${label} (${keyParts(key, IS_MAC).join("+")})` : label,
    "aria-keyshortcuts": key ? ariaKey(key) : undefined,
  }
}

/** Key caps, for menus and anywhere with room to spell the shortcut out. */
export function ShortcutKeys({
  id,
  className,
}: {
  id: ShortcutId
  className?: string
}) {
  const key = useShortcutKey(id)
  return key ? <KeyCaps shortcut={key} className={className} /> : null
}

export function KeyCaps({
  shortcut,
  className,
}: {
  shortcut: string
  className?: string
}) {
  return (
    <KbdGroup className={className}>
      {keyParts(shortcut, IS_MAC).map((part, index) => (
        <Kbd key={index}>{part}</Kbd>
      ))}
    </KbdGroup>
  )
}

/**
 * The key beside the action, tucked into the corner of an icon button where a key
 * cap would not fit. The button needs `relative`; its title or tip spells it out.
 */
export function ShortcutBadge({
  id,
  className,
}: {
  id: ShortcutId
  className?: string
}) {
  const key = useShortcutKey(id)
  if (!key) return null
  return (
    <span
      aria-hidden="true"
      data-shortcut-badge=""
      className={cn(
        "pointer-events-none absolute -right-0.5 -bottom-0.5 rounded-[3px] bg-background/85 px-0.5 font-sans text-[9px] leading-3 font-medium text-muted-foreground",
        className
      )}
    >
      {compactKey(key, IS_MAC)}
    </span>
  )
}
