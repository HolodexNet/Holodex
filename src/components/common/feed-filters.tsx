import { useId, useState, type ReactNode } from "react"

import { MultiCombobox } from "@/components/common/multi-combobox"
import { Switch } from "@/components/ui/switch"
import { useT } from "@/lib/i18n"
import { useTopics } from "@/lib/queries"
import { useSettings } from "@/stores/settings"

/** A labelled switch: the whole row toggles, the description explains. */
export function SwitchRow({
  label,
  description,
  checked,
  onChange,
  icon,
}: {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  icon?: ReactNode
}) {
  const id = useId()
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center gap-3 py-2.5 [&>svg]:size-5 [&>svg]:shrink-0 [&>svg]:text-muted-foreground"
    >
      {icon}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{label}</span>
        {description && (
          <span className="block text-[13px] text-muted-foreground">
            {description}
          </span>
        )}
      </span>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </label>
  )
}

const prettyTopic = (id: string) => id.replace(/_/g, " ")

/**
 * What the Home and Favorites feeds leave out. Shared between the quick
 * filter popover on those pages and the Settings page.
 */
export function FeedFilters() {
  const { t } = useT()
  const topicsId = useId()
  const [wantTopics, setWantTopics] = useState(false)
  const topics = useTopics(wantTopics)

  const ignoredTopics = useSettings((s) => s.ignoredTopics)
  const hideCollabStreams = useSettings((s) => s.hideCollabStreams)
  const hidePlaceholder = useSettings((s) => s.hidePlaceholder)
  const hideMissing = useSettings((s) => s.hideMissing)
  const set = useSettings((s) => s.set)

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-1.5 pb-2.5">
        <label htmlFor={topicsId} className="text-sm font-medium">
          {t("views.settings.ignoredTopicsLabel")}
        </label>
        <MultiCombobox
          id={topicsId}
          items={topics.data?.map((topic) => topic.id) ?? ignoredTopics}
          value={ignoredTopics}
          // Sorted so the same selection always produces the same setting.
          onChange={(next) => set("ignoredTopics", [...next].sort())}
          label={prettyTopic}
          placeholder={t("component.search.searchLabel")}
          onOpen={() => setWantTopics(true)}
        />
        <p className="text-[13px] text-muted-foreground">
          {t("views.settings.ignoredTopicsMsg")}
        </p>
      </div>
      <SwitchRow
        label={t("views.settings.hideCollabStreamsLabel")}
        description={t("views.settings.hideCollabStreamsMsg")}
        checked={hideCollabStreams}
        onChange={(v) => set("hideCollabStreams", v)}
      />
      <SwitchRow
        label={t("views.settings.hidePlaceholderStreams")}
        description={t("views.settings.hidePlaceholderStreamsMsg")}
        checked={hidePlaceholder}
        onChange={(v) => set("hidePlaceholder", v)}
      />
      <SwitchRow
        label={t("views.settings.hideMissingStreams")}
        description={t("views.settings.hideMissingStreamsMsg")}
        checked={hideMissing}
        onChange={(v) => set("hideMissing", v)}
      />
    </div>
  )
}
