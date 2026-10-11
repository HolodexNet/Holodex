import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox"
import { useT } from "@/lib/i18n"

interface MultiComboboxProps {
  /** All selectable values. */
  items: string[]
  value: string[]
  onChange: (value: string[]) => void
  /** Display text for a value; defaults to the value itself. */
  label?: (value: string) => string
  placeholder?: string
  id?: string
  "aria-label"?: string
  /** Called when the field is first focused, to load items lazily. */
  onOpen?: () => void
}

/**
 * Searchable multi-select rendered as removable chips. The option list is
 * capped so directories with thousands of entries (topics) stay responsive.
 */
export function MultiCombobox({
  items,
  value,
  onChange,
  label = (v) => v,
  placeholder,
  id,
  onOpen,
  ...props
}: MultiComboboxProps) {
  const { t } = useT()
  const anchor = useComboboxAnchor()

  return (
    <Combobox
      multiple
      autoHighlight
      items={items}
      value={value}
      onValueChange={(next) => onChange(next as string[])}
      itemToStringLabel={label}
      limit={60}
      onOpenChange={(open) => {
        if (open) onOpen?.()
      }}
    >
      <ComboboxChips ref={anchor} className="rounded-2xl">
        <ComboboxValue>
          {(selected: string[]) => (
            <>
              {selected.map((item) => (
                <ComboboxChip key={item}>{label(item)}</ComboboxChip>
              ))}
              <ComboboxChipsInput
                id={id}
                aria-label={props["aria-label"]}
                placeholder={selected.length ? "" : placeholder}
                onFocus={onOpen}
              />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>{t("component.search.noMatch")}</ComboboxEmpty>
        <ComboboxList>
          {(item: string) => (
            <ComboboxItem key={item} value={item}>
              {label(item)}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
