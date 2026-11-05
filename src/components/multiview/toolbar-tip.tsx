import { useEffect, useState, type ReactElement, type ReactNode } from "react"
import * as m from "motion/react-m"

import {
  createTooltipHandle,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ariaKey, type ShortcutId } from "@/lib/multiview/shortcuts"
import { KeyCaps, useShortcutKey } from "./shortcut-hint"

/** How long a tip stays up before it goes on to say what clicking does. */
const DETAIL_DELAY = 1000

/** Long enough to cross the gap between buttons without the tip closing. */
const CLOSE_DELAY = 100

interface Tip {
  label: string
  detail: string
  keys: string | null
}

/** One tip for the whole bar, so that it moves between buttons instead of flickering. */
const toolbarTip = createTooltipHandle<Tip>()

/**
 * The tip itself; render one wherever the buttons are. The pointer cannot rest on it:
 * a tip that could be hovered waits for mouse moves to decide when to close, and those
 * stop once the pointer is over a video's iframe, which would leave it stuck there.
 */
export function ToolbarTips() {
  return (
    <Tooltip
      handle={toolbarTip}
      disableHoverablePopup
      onOpenChange={(_open, details) => {
        // Closing the tip would otherwise use up the key, and it also leaves editing.
        if (details.reason === "escape-key") {
          details.cancel()
          details.allowPropagation()
          toolbarTip.close()
        }
      }}
    >
      {({ payload }) => (
        <TooltipContent side="bottom" sideOffset={6}>
          {payload && <TipBody {...payload} />}
        </TooltipContent>
      )}
    </Tooltip>
  )
}

/** Remounts each time the tip opens, so every visit starts without the explanation. */
function TipBody({ label, detail, keys }: Tip) {
  const [explaining, setExplaining] = useState(false)

  // Each button gets its own wait. Once one has explained itself the viewer is reading,
  // so the rest explain themselves at once for as long as the tip stays up.
  useEffect(() => {
    if (explaining) return undefined
    const timer = setTimeout(() => setExplaining(true), DETAIL_DELAY)
    return () => clearTimeout(timer)
  }, [label, explaining])

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium">{label}</span>
        {keys && <KeyCaps shortcut={keys} />}
      </div>
      {explaining && (
        <m.div
          className="overflow-hidden"
          initial={{ height: 0, width: 0, opacity: 0 }}
          animate={{ height: "auto", width: "auto", opacity: 1 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
        >
          <p className="w-56 pt-1 pr-1.5 pb-0.5 text-pretty text-background/75">
            {detail}
          </p>
        </m.div>
      )}
    </div>
  )
}

/**
 * A toolbar control and its tip, which together name it, give its key and explain it.
 * `render` is the control; a menu or popover's trigger goes inside it, with `disabled`
 * set while that is open so that the tip does not cover it. `fixedKey` is for a key
 * that cannot be rebound, and so is not a shortcut.
 */
export function ToolbarTip({
  label,
  detail,
  shortcut,
  fixedKey,
  disabled,
  render,
  children,
}: {
  label: string
  detail: string
  shortcut?: ShortcutId
  fixedKey?: string
  disabled?: boolean
  render: ReactElement
  children: ReactNode
}) {
  const shortcutKey = useShortcutKey(shortcut)
  const keys = fixedKey ?? shortcutKey
  return (
    <TooltipTrigger
      handle={toolbarTip}
      payload={{ label, detail, keys }}
      closeDelay={CLOSE_DELAY}
      disabled={disabled}
      aria-label={label}
      aria-description={detail}
      aria-keyshortcuts={keys ? ariaKey(keys) : undefined}
      render={render}
    >
      {children}
    </TooltipTrigger>
  )
}
