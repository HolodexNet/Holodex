import { useId, useState, type ReactNode } from "react"
import { cn } from "cn"

import { ChannelAvatar } from "@/components/common/channel-avatar"
import { FeedFilters, SwitchRow } from "@/components/common/feed-filters"
import { SimpleSelect } from "@/components/common/simple-select"
import {
  ArrowCounterClockwiseIcon,
  CheckIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useDocumentTitle } from "@/hooks/use-document-title"
import { DEFAULT_PRIMARY, PRIMARY_PRESETS, TL_LANGS, UI_LANGS } from "@/lib/consts"
import { useT } from "@/lib/i18n"
import { queryClient } from "@/lib/queries"
import { isHexColor, normalizeHex } from "@/lib/theme/color"
import { channelName } from "@/lib/video"
import { useAuth } from "@/stores/auth"
import { useOrgStore } from "@/stores/org"
import {
  useSettings,
  type DefaultPage,
  type GridSize,
  type ThemeMode,
} from "@/stores/settings"

function Section({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section>
      <h2 className="text-base font-medium">{title}</h2>
      {description && (
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      )}
      <div className="mt-3 divide-y rounded-2xl border bg-card px-4 py-1.5">
        {children}
      </div>
    </section>
  )
}

/** A setting whose control sits beside its label on wide screens. */
function Row({
  label,
  description,
  htmlFor,
  children,
  stacked = false,
}: {
  label: string
  description?: string
  htmlFor?: string
  children: ReactNode
  /** Put the control under the label instead of beside it. */
  stacked?: boolean
}) {
  return (
    <div
      className={cn(
        "flex gap-x-6 gap-y-2 py-3",
        stacked ? "flex-col" : "flex-col sm:flex-row sm:items-center"
      )}
    >
      <div className="min-w-0 flex-1">
        <label htmlFor={htmlFor} className="block text-sm font-medium">
          {label}
        </label>
        {description && (
          <p className="text-[13px] text-muted-foreground">{description}</p>
        )}
      </div>
      <div className={cn("min-w-0", !stacked && "sm:shrink-0")}>{children}</div>
    </div>
  )
}

function PrimaryColorPicker() {
  const { t } = useT()
  const primary = useSettings((s) => s.primaryColor)
  const set = useSettings((s) => s.set)
  const hexId = useId()
  // Typed text is kept separately so a half-typed value is not rejected.
  const [draft, setDraft] = useState<string | null>(null)

  const choose = (color: string) => {
    setDraft(null)
    set("primaryColor", normalizeHex(color))
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {PRIMARY_PRESETS.map((preset) => {
          const selected = preset.color === primary
          return (
            <button
              key={preset.name}
              type="button"
              title={preset.name}
              aria-label={preset.name}
              aria-pressed={selected}
              className={cn(
                "flex size-8 items-center justify-center rounded-full outline-none transition-transform hover:scale-110 focus-visible:ring-[3px] focus-visible:ring-ring",
                selected && "ring-2 ring-foreground ring-offset-2 ring-offset-card"
              )}
              style={{ backgroundColor: preset.color }}
              onClick={() => choose(preset.color)}
            >
              {selected && <CheckIcon className="size-4 text-white mix-blend-difference" />}
            </button>
          )
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label
          htmlFor={hexId}
          className="text-[13px] text-muted-foreground"
        >
          {t("views.settings.customColor")}
        </label>
        <input
          type="color"
          value={primary}
          aria-label={t("views.settings.customColor")}
          onChange={(event) => choose(event.target.value)}
          className="size-9 cursor-pointer rounded-full border border-input bg-transparent p-1 [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
        />
        <Input
          id={hexId}
          value={draft ?? primary}
          spellCheck={false}
          autoComplete="off"
          maxLength={7}
          aria-invalid={draft !== null && !isHexColor(draft)}
          className="w-28 font-mono"
          onChange={(event) => {
            const value = event.target.value
            if (isHexColor(value) && value.replace("#", "").length === 6) {
              choose(value)
            } else {
              setDraft(value)
            }
          }}
          onBlur={() => setDraft(null)}
        />
        {primary !== DEFAULT_PRIMARY && (
          <Button variant="ghost" size="sm" onClick={() => choose(DEFAULT_PRIMARY)}>
            <ArrowCounterClockwiseIcon data-icon="inline-start" />
            {t("views.settings.resetColor")}
          </Button>
        )}
      </div>
    </div>
  )
}

/** Shows what the theme engine derived from the chosen primary colour. */
function PalettePreview() {
  const { t } = useT()
  const swatches = [
    { className: "bg-primary", label: t("views.settings.palettePrimary") },
    { className: "bg-complement", label: t("views.settings.paletteComplement") },
    { className: "bg-header", label: t("views.settings.paletteHeader") },
    { className: "bg-secondary", label: t("views.settings.paletteSurface") },
    { className: "bg-background", label: t("views.settings.paletteBase") },
  ]
  return (
    <div className="flex w-full overflow-hidden rounded-xl border sm:w-96">
      {swatches.map((swatch) => (
        <div key={swatch.label} className="min-w-0 flex-1" title={swatch.label}>
          <div className={cn("h-9", swatch.className)} />
          <div className="truncate border-t bg-card px-1.5 py-1 text-center text-[11px] text-muted-foreground">
            {swatch.label}
          </div>
        </div>
      ))}
    </div>
  )
}

function ResetDialog() {
  const { t } = useT()
  const [open, setOpen] = useState(false)

  const reset = () => {
    useSettings.getState().reset()
    useOrgStore.getState().reset()
    useAuth.getState().logout()
    queryClient.clear()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" />}>
        {t("views.settings.resetAllSettings")}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("views.settings.resetAllSettings")}</DialogTitle>
          <DialogDescription>
            {t("views.settings.resetAllSettingsWarning")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            {t("views.app.close_btn")}
          </DialogClose>
          <Button variant="destructive" onClick={reset}>
            {t("views.settings.resetAllSettings")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function SettingsPage() {
  const { t, tl } = useT()
  const settings = useSettings()
  const { set } = settings
  const ids = { lang: useId(), page: useId(), grid: useId() }

  useDocumentTitle(t("component.mainNav.settings"))

  const language = UI_LANGS.find((l) => l.val === settings.lang)
  const gridSizes = tl("views.settings.gridSize")

  const toggleClipLang = (lang: string, on: boolean) => {
    const next = on
      ? [...settings.clipLangs, lang]
      : settings.clipLangs.filter((l) => l !== lang)
    // Sorted so identical selections hit the same cached responses.
    set("clipLangs", [...new Set(next)].sort())
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-3 py-6 md:px-6">
      <h1 className="text-2xl font-medium tracking-tight">
        {t("views.settings.title")}
      </h1>

      <Section title={t("views.settings.languageSettings")}>
        <Row
          label={t("views.settings.interfaceLanguage")}
          description={language ? `♡ ${language.credit}` : undefined}
          htmlFor={ids.lang}
        >
          <SimpleSelect
            id={ids.lang}
            className="w-full sm:w-56"
            value={settings.lang}
            onChange={(lang) => set("lang", lang)}
            options={UI_LANGS.map((l) => ({ value: l.val, label: l.display }))}
          />
        </Row>
        <SwitchRow
          label={t("views.settings.useEnglishNameLabel")}
          description={t("views.settings.useEnglishNameMsg")}
          checked={settings.useEnglishName}
          onChange={(v) => set("useEnglishName", v)}
        />
        <Row label={t("views.settings.clipLanguageSelection")} stacked>
          <div className="grid gap-x-4 gap-y-2.5 sm:grid-cols-2">
            {TL_LANGS.map((lang) => (
              <label
                key={lang.value}
                className="flex cursor-pointer items-center gap-2.5 text-sm"
              >
                <Checkbox
                  checked={settings.clipLangs.includes(lang.value)}
                  onCheckedChange={(on) => toggleClipLang(lang.value, on)}
                />
                {lang.text}
              </label>
            ))}
          </div>
        </Row>
      </Section>

      <Section title={t("views.settings.theme")}>
        <Row label={t("views.settings.themeMode")}>
          <ToggleGroup
            variant="outline"
            spacing={0}
            value={[settings.themeMode]}
            onValueChange={(next) => {
              const mode = next[0] as ThemeMode | undefined
              if (mode) set("themeMode", mode)
            }}
          >
            <ToggleGroupItem value="light">
              <SunIcon />
              {t("views.settings.themeLight")}
            </ToggleGroupItem>
            <ToggleGroupItem value="dark">
              <MoonIcon />
              {t("views.settings.themeDark")}
            </ToggleGroupItem>
            <ToggleGroupItem value="system">
              <MonitorIcon />
              {t("views.settings.themeSystem")}
            </ToggleGroupItem>
          </ToggleGroup>
        </Row>
        <Row label={t("views.settings.primaryColor")} stacked>
          <PrimaryColorPicker />
        </Row>
        <Row
          label={t("views.settings.computedPalette")}
          description={t("views.settings.computedPaletteMsg")}
        >
          <PalettePreview />
        </Row>
        <Row
          label={t("views.settings.gridSizeLabel")}
          description={t("views.settings.gridSizeMsg")}
          htmlFor={ids.grid}
        >
          <SimpleSelect<GridSize>
            id={ids.grid}
            className="w-full sm:w-40"
            value={settings.gridSize}
            onChange={(size) => set("gridSize", size)}
            options={([0, 1, 2] as const).map((size) => ({
              value: size,
              label: gridSizes[size] ?? String(size),
            }))}
          />
        </Row>
      </Section>

      <Section title={t("views.settings.siteNavigationSettings")}>
        <Row
          label={t("views.settings.defaultPage")}
          description={t("views.settings.defaultPageMsg")}
          htmlFor={ids.page}
        >
          <SimpleSelect<DefaultPage>
            id={ids.page}
            className="w-full sm:w-40"
            value={settings.defaultOpen}
            onChange={(page) => set("defaultOpen", page)}
            options={[
              { value: "home", label: t("component.mainNav.home") },
              { value: "favorites", label: t("component.mainNav.favorites") },
              { value: "multiview", label: t("component.mainNav.multiview") },
            ]}
          />
        </Row>
        <SwitchRow
          label={t("views.settings.scrollModeLabel")}
          description={t("views.settings.scrollModeDescription")}
          checked={settings.scrollMode}
          onChange={(v) => set("scrollMode", v)}
        />
        <SwitchRow
          label={t("views.settings.redirectModeLabel")}
          description={t("views.settings.redirectModeMsg")}
          checked={settings.redirectMode}
          onChange={(v) => set("redirectMode", v)}
        />
        <SwitchRow
          label={t("views.settings.hideVideoThumbnailsLabel")}
          description={t("views.settings.hideVideoThumbnailsMsg")}
          checked={settings.hideThumbnail}
          onChange={(v) => set("hideThumbnail", v)}
        />
      </Section>

      <Section title={t("views.settings.videoFeedSettings")}>
        <div className="py-1.5">
          <FeedFilters />
        </div>
      </Section>

      <Section
        title={t("views.channels.tabs.Blocked")}
        description={t("views.settings.blockedDescription")}
      >
        {settings.blockedChannels.length === 0 ? (
          <p className="py-3 text-sm text-muted-foreground">
            {t("views.channels.blockedAreEmpty")}
          </p>
        ) : (
          settings.blockedChannels.map((channel) => (
            <div key={channel.id} className="flex items-center gap-3 py-2">
              <ChannelAvatar channel={channel} size={32} />
              <span className="min-w-0 flex-1 truncate text-sm">
                {channelName(channel, settings.useEnglishName)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => settings.toggleBlocked(channel)}
              >
                {t("views.settings.unblock")}
              </Button>
            </div>
          ))
        )}
      </Section>

      <div className="flex justify-end">
        <ResetDialog />
      </div>
    </div>
  )
}
