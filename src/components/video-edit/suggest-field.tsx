import { useRef, type ReactNode } from "react"
import { Autocomplete } from "@base-ui/react/autocomplete"
import { cn } from "cn"

import { MagnifyingGlassIcon } from "@/components/icons"
import {
  ComboboxContent,
  ComboboxEmpty,
  ComboboxList,
} from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { isComposingKey, PLAIN_TEXT_INPUT } from "@/lib/video-edit/field"

/** Stops the primitive's own handling of an event that's been dealt with here. */
function preventPrimitive(event: React.SyntheticEvent) {
  ;(event as { preventBaseUIHandler?: () => void }).preventBaseUIHandler?.()
}

/**
 * A text box that suggests as you type, where the text stays yours: unlike a
 * combobox, nothing has to be picked and nothing gets reverted on blur. IME
 * composition is handled by the primitive, which matters for Japanese titles.
 */
export function SuggestField<Item>({
  value,
  onValueChange,
  items,
  itemKey,
  itemText,
  renderItem,
  onPick,
  empty,
  footer,
  placeholder,
  disabled,
  id,
  autoFocus,
  autoHighlight,
  stale,
  busy,
  searchLabel,
  leaveOnSettle,
  invalid,
  popupClassName,
  className,
  onOpenChange,
  onKeyDown,
  onBlur,
  onPaste,
  marker,
  "aria-label": ariaLabel,
}: {
  value: string
  onValueChange: (value: string) => void
  items: readonly Item[]
  itemKey: (item: Item) => string
  /** The text an item puts in the box. */
  itemText: (item: Item) => string
  renderItem: (item: Item) => ReactNode
  onPick: (item: Item) => void
  /** Shown instead of items. Leave out to keep the popup closed when empty. */
  empty?: ReactNode
  /** Under the items, for what's worth knowing about them. */
  footer?: ReactNode
  placeholder?: string
  disabled?: boolean
  id?: string
  autoFocus?: boolean
  /** Lets Enter take the first suggestion, for when speed beats precision. */
  autoHighlight?: boolean
  /** The items are for what was typed earlier, so Enter must not take one. */
  stale?: boolean
  /** Looking something up: shows in the box, as the items may still be on screen. */
  busy?: boolean
  /** Adds a button to open the suggestions, for when there's no arrow key to press. */
  searchLabel?: string
  /**
   * Enter and Escape are finished with the field and give the keyboard back, once
   * the popup has had its turn: the first Escape only closes it.
   */
  leaveOnSettle?: boolean
  invalid?: boolean
  popupClassName?: string
  className?: string
  onOpenChange?: (open: boolean) => void
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void
  onBlur?: () => void
  onPaste?: (event: React.ClipboardEvent<HTMLInputElement>) => void
  /** A `data-` attribute to find the input by, as the search shortcut does. */
  marker?: string
  "aria-label"?: string
}) {
  const input = useRef<HTMLInputElement>(null)
  const popup = useRef({ open: false, highlighted: false })
  const hasContent = items.length > 0 || !!empty
  const showsTrailing = !disabled && (busy || !!searchLabel)
  return (
    <Autocomplete.Root
      items={items}
      // Matching happens wherever the items came from.
      filter={null}
      value={value}
      onValueChange={(next, details) => {
        // Taking a suggestion is reported through `onPick`, with the whole item.
        // And the primitive empties the box on Escape, as a search box might, but
        // this text is the thing being edited: a song would lose its name.
        if (details.reason !== "item-press" && details.reason !== "escape-key")
          onValueChange(next)
      }}
      itemToStringValue={itemText}
      autoHighlight={autoHighlight}
      onItemHighlighted={(item) => {
        popup.current.highlighted = item !== undefined
      }}
      onOpenChange={(open) => {
        popup.current.open = open
        if (!open) popup.current.highlighted = false
        onOpenChange?.(open)
      }}
    >
      <div className="relative min-w-0">
        <Autocomplete.Input
          render={
            <Input
              {...PLAIN_TEXT_INPUT}
              ref={input}
              id={id}
              placeholder={placeholder}
              disabled={disabled}
              autoFocus={autoFocus}
              enterKeyHint="done"
              aria-label={ariaLabel}
              aria-invalid={invalid || undefined}
              className={cn(showsTrailing && "pr-8", className)}
              onKeyDown={(event) => {
                onKeyDown?.(event)
                if (!leaveOnSettle || isComposingKey(event)) return
                const { open, highlighted } = popup.current
                if (event.key === "Escape" && !(open && hasContent)) {
                  preventPrimitive(event)
                  event.currentTarget.blur()
                } else if (event.key === "Enter" && (!highlighted || stale)) {
                  // With something fresh highlighted, Enter is picking it.
                  preventPrimitive(event)
                  event.preventDefault()
                  event.currentTarget.blur()
                }
              }}
              onBlur={onBlur}
              onPaste={onPaste}
              {...(marker ? { [`data-${marker}`]: "" } : {})}
            />
          }
        />
        {showsTrailing && (
          <Autocomplete.Trigger
            aria-label={searchLabel}
            title={searchLabel}
            tabIndex={-1}
            className="absolute inset-y-0 right-1 my-auto flex size-6 cursor-pointer items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-muted hover:text-foreground"
          >
            {busy ? (
              <Spinner className="size-3.5" />
            ) : (
              <MagnifyingGlassIcon className="size-3.5" />
            )}
          </Autocomplete.Trigger>
        )}
      </div>
      {hasContent && (
        <ComboboxContent
          className={cn(
            "w-[min(30rem,calc(100vw-2rem))] min-w-(--anchor-width)",
            popupClassName
          )}
        >
          {empty && <ComboboxEmpty>{empty}</ComboboxEmpty>}
          <ComboboxList className={cn(stale && "opacity-60")}>
            {(item: Item) => (
              <Autocomplete.Item
                key={itemKey(item)}
                value={item}
                onClick={() => {
                  onPick(item)
                  if (leaveOnSettle)
                    requestAnimationFrame(() => input.current?.blur())
                }}
                className="flex w-full cursor-default items-center gap-2.5 rounded-xl px-2 py-1.5 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
              >
                {renderItem(item)}
              </Autocomplete.Item>
            )}
          </ComboboxList>
          {footer && items.length > 0 && (
            <div className="border-t px-3 py-1.5 text-xs text-muted-foreground">
              {footer}
            </div>
          )}
        </ComboboxContent>
      )}
    </Autocomplete.Root>
  )
}
