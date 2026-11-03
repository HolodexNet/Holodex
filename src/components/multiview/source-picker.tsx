import { useState } from "react"

import {
  CaretDownIcon,
  HeartIcon,
  LogoTwitchIcon,
  LogoYoutubeIcon,
  PlaylistIcon,
} from "@/components/icons"
import { OrgDialog, OrgIcon } from "@/components/layout/org-selector"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ALL_VTUBERS } from "@/lib/consts"
import { useT } from "@/lib/i18n"
import type { Org } from "@/lib/types"
import { useOrgStore } from "@/stores/org"
import type { VideoSourceChoice } from "./use-source-videos"

const rowClass =
  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm outline-none hover:bg-muted focus-visible:bg-muted data-[active=true]:bg-muted"

/** The fixed choices and starred organizations; used inline and in a popover. */
export function SourceList({
  value,
  onChange,
  showPlaylist = false,
}: {
  value: VideoSourceChoice
  onChange: (source: VideoSourceChoice) => void
  showPlaylist?: boolean
}) {
  const { t } = useT()
  const starred = useOrgStore((s) => s.orgFavorites)
  const setCurrentOrg = useOrgStore((s) => s.setCurrentOrg)
  const [dialogOpen, setDialogOpen] = useState(false)

  const pickOrg = (org: Org) => {
    setCurrentOrg(org)
    onChange({ kind: "org", org })
  }

  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        className={rowClass}
        data-active={value.kind === "favorites"}
        onClick={() => onChange({ kind: "favorites" })}
      >
        <HeartIcon className="size-4" />
        {t("component.mainNav.favorites")}
      </button>
      {showPlaylist && (
        <button
          type="button"
          className={rowClass}
          data-active={value.kind === "playlist"}
          onClick={() => onChange({ kind: "playlist" })}
        >
          <PlaylistIcon className="size-4" />
          {t("component.mainNav.playlist")}
        </button>
      )}
      <button
        type="button"
        className={rowClass}
        data-active={value.kind === "url" && value.provider === "youtube"}
        onClick={() => onChange({ kind: "url", provider: "youtube" })}
      >
        <LogoYoutubeIcon className="size-4" />
        URL
      </button>
      <button
        type="button"
        className={rowClass}
        data-active={value.kind === "url" && value.provider === "twitch"}
        onClick={() => onChange({ kind: "url", provider: "twitch" })}
      >
        <LogoTwitchIcon className="size-4" />
        URL
      </button>
      <div className="my-1 h-px bg-border" />
      {starred
        .filter((org) => org.name !== ALL_VTUBERS)
        .map((org) => (
          <button
            key={org.name}
            type="button"
            className={rowClass}
            data-active={value.kind === "org" && value.org.name === org.name}
            onClick={() => pickOrg(org)}
          >
            <OrgIcon org={org} className="size-5" />
            <span className="min-w-0 flex-1 truncate">{org.name}</span>
          </button>
        ))}
      <Button
        variant="ghost"
        size="sm"
        className="justify-start text-brand"
        onClick={() => setDialogOpen(true)}
      >
        {t("views.favorites.showall")}
      </Button>
      <OrgDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSelect={pickOrg}
      />
    </div>
  )
}

export function sourceLabel(
  source: VideoSourceChoice,
  t: (key: string) => string
) {
  switch (source.kind) {
    case "favorites":
      return t("component.mainNav.favorites")
    case "playlist":
      return t("component.mainNav.playlist")
    case "org":
      return source.org.short || source.org.name
    case "url":
      return "URL"
  }
}

/** The toolbar's compact version. */
export function SourcePicker({
  value,
  onChange,
}: {
  value: VideoSourceChoice
  onChange: (source: VideoSourceChoice) => void
}) {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="outline" size="sm" className="max-w-36 shrink-0" />
        }
      >
        {value.kind === "url" &&
          (value.provider === "twitch" ? (
            <LogoTwitchIcon data-icon="inline-start" />
          ) : (
            <LogoYoutubeIcon data-icon="inline-start" />
          ))}
        <span className="truncate">{sourceLabel(value, t)}</span>
        <CaretDownIcon data-icon="inline-end" className="size-3" />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="max-h-[70vh] w-60 gap-0 overflow-y-auto p-1"
      >
        <SourceList
          value={value}
          onChange={(source) => {
            onChange(source)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
