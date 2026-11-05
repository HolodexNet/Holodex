import type { ReactNode } from "react"
import { Autocomplete } from "@base-ui/react/autocomplete"
import { cn } from "cn"

import {
  ComboboxContent,
  ComboboxEmpty,
  ComboboxList,
} from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"

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
  placeholder,
  disabled,
  id,
  autoFocus,
  autoHighlight,
  invalid,
  popupClassName,
  className,
  onOpenChange,
  onKeyDown,
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
  placeholder?: string
  disabled?: boolean
  id?: string
  autoFocus?: boolean
  /** Lets Enter take the first suggestion, for when speed beats precision. */
  autoHighlight?: boolean
  invalid?: boolean
  popupClassName?: string
  className?: string
  onOpenChange?: (open: boolean) => void
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void
  "aria-label"?: string
}) {
  return (
    <Autocomplete.Root
      items={items}
      // Matching happens wherever the items came from.
      filter={null}
      value={value}
      onValueChange={(next, details) => {
        // Taking a suggestion is reported through `onPick`, with the whole item.
        if (details.reason !== "item-press") onValueChange(next)
      }}
      itemToStringValue={itemText}
      autoHighlight={autoHighlight}
      onOpenChange={(open) => onOpenChange?.(open)}
    >
      <Autocomplete.Input
        render={
          <Input
            id={id}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            aria-label={ariaLabel}
            aria-invalid={invalid || undefined}
            className={className}
            onKeyDown={onKeyDown}
          />
        }
      />
      <ComboboxContent
        className={cn(
          "w-[min(30rem,calc(100vw-2rem))] min-w-(--anchor-width)",
          popupClassName
        )}
      >
        {empty && <ComboboxEmpty>{empty}</ComboboxEmpty>}
        <ComboboxList>
          {(item: Item) => (
            <Autocomplete.Item
              key={itemKey(item)}
              value={item}
              onClick={() => onPick(item)}
              className="flex w-full cursor-default items-center gap-2.5 rounded-xl px-2 py-1.5 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
            >
              {renderItem(item)}
            </Autocomplete.Item>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Autocomplete.Root>
  )
}
