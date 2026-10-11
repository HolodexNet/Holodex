import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

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
import { useDebounced } from "@/hooks/use-debounced"
import { api } from "@/lib/api"
import { useT } from "@/lib/i18n"
import { rememberChannel, useChannelInfos } from "@/lib/queries"
import { channelName } from "@/lib/video"
import { useSettings } from "@/stores/settings"

interface PickerChannel {
  id: string
  name: string
  english_name?: string | null
  org?: string | null
}

/** Multi-select of talents, searched on the server as you type. */
export function ChannelPicker({
  value,
  onChange,
  id,
  placeholder,
}: {
  /** Selected channel ids. */
  value: string[]
  onChange: (ids: string[]) => void
  id?: string
  placeholder?: string
}) {
  const { t } = useT()
  const anchor = useComboboxAnchor()
  const preferEnglish = useSettings((s) => s.useEnglishName)
  const [input, setInput] = useState("")
  const query = useDebounced(input.trim(), 250)

  const results = useQuery({
    queryKey: ["autocomplete", query],
    queryFn: ({ signal }) => api.autocomplete(query, signal),
    enabled: query.length >= 2,
    staleTime: 5 * 60_000,
    placeholderData: (previous) => previous,
  })
  const infos = useChannelInfos(value)

  const selected: PickerChannel[] = value.map(
    (channelId) => infos.get(channelId) ?? { id: channelId, name: channelId }
  )
  const items: PickerChannel[] = query.length >= 2 ? (results.data?.vtuber ?? []) : []
  const label = (channel: PickerChannel) => channelName(channel, preferEnglish)

  return (
    <Combobox<PickerChannel, true>
      multiple
      autoHighlight
      items={items}
      // Matching happens on the server.
      filter={null}
      value={selected}
      onValueChange={(next) => {
        next.forEach(rememberChannel)
        onChange(next.map((channel) => channel.id))
      }}
      inputValue={input}
      onInputValueChange={setInput}
      isItemEqualToValue={(a, b) => a.id === b.id}
      itemToStringLabel={label}
    >
      <ComboboxChips ref={anchor} className="rounded-2xl">
        <ComboboxValue>
          {(chosen: PickerChannel[]) => (
            <>
              {chosen.map((channel) => (
                <ComboboxChip key={channel.id}>{label(channel)}</ComboboxChip>
              ))}
              <ComboboxChipsInput
                id={id}
                placeholder={chosen.length ? "" : placeholder}
              />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>
          {query.length < 2
            ? t("component.search.typeToSearch")
            : results.isFetching
              ? t("component.search.searching")
              : t("component.search.noMatch")}
        </ComboboxEmpty>
        <ComboboxList>
          {(channel: PickerChannel) => (
            <ComboboxItem key={channel.id} value={channel}>
              <span className="truncate">{label(channel)}</span>
              {channel.org && (
                <span className="ml-auto pl-2 text-xs text-muted-foreground">
                  {channel.org}
                </span>
              )}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
