import { useId, useState, type ReactNode } from "react"
import { cn } from "cn"

import { ChannelAvatar } from "@/components/common/channel-avatar"
import { FeedFilters, SwitchRow } from "@/components/common/feed-filters"
import { MultiCombobox } from "@/components/common/multi-combobox"
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
import {
  DEFAULT_PRIMARY,
  PRIMARY_PRESETS,
  TL_LANGS,
  UI_LANGS,
} from "@/lib/consts"
import { useT } from "@/lib/i18n"
import { queryClient } from "@/lib/queries"
import {
  getLocalTimeZone,
  getSupportedTimeZones,
  LOCAL_TIME_ZONE,
} from "@/lib/time"
import { isHexColor, normalizeHex } from "@/lib/theme/color"
import {
  isThemeColor,
  normalizeThemeColor,
  resolvePalette,
  themeColorToHex,
} from "@/lib/theme/overrides"
import type { ThemeOverrides } from "@/lib/theme/palette"
import { useResolvedMode } from "@/lib/theme/use-theme"
import { channelName } from "@/lib/video"
import { useAuth } from "@/stores/auth"
import { useOrgStore } from "@/stores/org"
import {
  useSettings,
  type DefaultPage,
  type GridSize,
  type ThemeMode,
} from "@/stores/settings"

const TIME_ZONE_OPTIONS = getSupportedTimeZones()

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

function ColorPicker({
  id,
  label,
  value,
  onChange,
  onReset,
  resetDisabled,
  allowOpacity = false,
}: {
  id?: string
  label: string
  value: string
  onChange: (color: string) => void
  onReset: () => void
  resetDisabled: boolean
  allowOpacity?: boolean
}) {
  const { t } = useT()
  const [draft, setDraft] = useState<string | null>(null)
  const hex = themeColorToHex(value)
  const valid = allowOpacity ? isThemeColor : isHexColor
  const choose = (color: string) => {
    setDraft(null)
    onChange(normalizeThemeColor(color))
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="color"
        value={hex.slice(0, 7)}
        aria-label={t("views.settings.colorPicker", { color: label })}
        onChange={(event) => choose(event.target.value + hex.slice(7))}
        className="size-9 cursor-pointer rounded-full border border-input bg-transparent p-1 [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0"
      />
      <Input
        id={id}
        aria-label={t("views.settings.colorHex", { color: label })}
        value={draft ?? hex}
        spellCheck={false}
        autoComplete="off"
        maxLength={allowOpacity ? 9 : 7}
        aria-invalid={draft !== null && !valid(draft)}
        className={cn("font-mono", allowOpacity ? "w-32" : "w-28")}
        onChange={(event) => {
          const next = event.target.value
          if (valid(next) && next.replace("#", "").length >= 6) choose(next)
          else setDraft(next)
        }}
        onBlur={() => {
          if (draft !== null && valid(draft)) choose(draft)
          else setDraft(null)
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur()
          if (event.key === "Escape") setDraft(null)
        }}
      />
      {allowOpacity && (
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min={0}
            max={100}
            step={1}
            aria-label={t("views.settings.colorOpacity", { color: label })}
            value={Math.round((parseInt(hex.slice(7) || "ff", 16) / 255) * 100)}
            className="w-18"
            onChange={(event) => {
              if (event.target.value === "") return
              const opacity = Math.min(
                100,
                Math.max(0, Number(event.target.value))
              )
              if (!Number.isFinite(opacity)) return
              const alpha = Math.round((opacity / 100) * 255)
              choose(
                hex.slice(0, 7) +
                  (alpha === 255 ? "" : alpha.toString(16).padStart(2, "0"))
              )
            }}
          />
          <span aria-hidden="true" className="text-xs text-muted-foreground">
            %
          </span>
        </div>
      )}
      <Button
        variant="ghost"
        size="sm"
        disabled={resetDisabled}
        aria-label={t("views.settings.resetNamedColor", { color: label })}
        onClick={() => {
          setDraft(null)
          onReset()
        }}
      >
        <ArrowCounterClockwiseIcon data-icon="inline-start" />
        {t("views.settings.resetColor")}
      </Button>
    </div>
  )
}

function PrimaryColorPicker() {
  const { t } = useT()
  const primary = useSettings((s) => s.primaryColor)
  const set = useSettings((s) => s.set)
  const choose = (color: string) => {
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
                "flex size-8 items-center justify-center rounded-full transition-transform outline-none hover:scale-110 focus-visible:ring-[3px] focus-visible:ring-ring",
                selected &&
                  "ring-2 ring-foreground ring-offset-2 ring-offset-card"
              )}
              style={{ backgroundColor: preset.color }}
              onClick={() => choose(preset.color)}
            >
              {selected && (
                <CheckIcon className="size-4 text-white mix-blend-difference" />
              )}
            </button>
          )
        })}
      </div>
      <ColorPicker
        label={t("views.settings.primaryColor")}
        value={primary}
        onChange={choose}
        onReset={() => choose(DEFAULT_PRIMARY)}
        resetDisabled={primary === DEFAULT_PRIMARY}
      />
    </div>
  )
}

const COLOR_GROUPS = {
  surfaces: [
    "--background",
    "--card",
    "--popover",
    "--header",
    "--secondary",
    "--muted",
    "--accent",
  ],
  text: [
    "--foreground",
    "--card-foreground",
    "--popover-foreground",
    "--primary-foreground",
    "--secondary-foreground",
    "--muted-foreground",
    "--accent-foreground",
  ],
  accents: [
    "--brand",
    "--complement-soft",
    "--border",
    "--input",
    "--ring",
    "--destructive",
    "--live",
  ],
  sidebar: [
    "--sidebar",
    "--sidebar-foreground",
    "--sidebar-primary",
    "--sidebar-primary-foreground",
    "--sidebar-accent",
    "--sidebar-accent-foreground",
    "--sidebar-border",
    "--sidebar-ring",
  ],
} as const satisfies Record<string, readonly (keyof ThemeOverrides)[]>

function ThemeColorRow({
  color,
  value,
  custom,
  onChange,
}: {
  color: keyof ThemeOverrides
  value: string
  custom: boolean
  onChange: (value?: string) => void
}) {
  const { t } = useT()
  const id = useId()
  const label = t(`views.settings.colors.${color.slice(2)}`)

  return (
    <Row
      label={label}
      htmlFor={id}
      description={t(
        custom ? "views.settings.colorCustom" : "views.settings.colorAutomatic"
      )}
    >
      <ColorPicker
        id={id}
        label={label}
        value={value}
        onChange={onChange}
        onReset={() => onChange()}
        resetDisabled={!custom}
        allowOpacity
      />
    </Row>
  )
}

function PaletteEditor() {
  const { t } = useT()
  const mode = useResolvedMode()
  const primary = useSettings((s) => s.primaryColor)
  const overrides = useSettings((s) => s.themeColorOverrides)
  const set = useSettings((s) => s.set)
  const palette = resolvePalette(primary, mode, overrides)
  const choose = (color: keyof ThemeOverrides, value?: string) => {
    const current = useSettings.getState().themeColorOverrides
    const next = { ...current[mode] }
    if (value === undefined) delete next[color]
    else next[color] = value
    set("themeColorOverrides", { ...current, [mode]: next })
  }
  const renderColor = (color: keyof ThemeOverrides) => (
    <ThemeColorRow
      key={`${mode}:${primary}:${color}`}
      color={color}
      value={palette.vars[color]}
      custom={overrides[mode]?.[color] !== undefined}
      onChange={(value) => choose(color, value)}
    />
  )

  return (
    <div className="py-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] text-muted-foreground">
          {t("views.settings.editingPalette", {
            mode: t(
              mode === "dark"
                ? "views.settings.themeDark"
                : "views.settings.themeLight"
            ),
          })}
        </p>
        <Button
          variant="outline"
          size="sm"
          disabled={!Object.keys(overrides[mode] ?? {}).length}
          onClick={() => {
            const next = { ...useSettings.getState().themeColorOverrides }
            delete next[mode]
            set("themeColorOverrides", next)
          }}
        >
          <ArrowCounterClockwiseIcon data-icon="inline-start" />
          {t("views.settings.resetPalette")}
        </Button>
      </div>
      {renderColor("--complement")}
      <details className="group mt-2">
        <summary className="cursor-pointer rounded-lg py-2 text-sm font-medium outline-none focus-visible:ring-[3px] focus-visible:ring-ring">
          {t("views.settings.allColors")}
        </summary>
        <div className="mt-2 space-y-4">
          {Object.entries(COLOR_GROUPS).map(([group, colors]) => (
            <fieldset key={group} className="min-w-0">
              <legend className="text-sm font-medium">
                {t(`views.settings.colorGroups.${group}`)}
              </legend>
              <div className="divide-y">{colors.map(renderColor)}</div>
            </fieldset>
          ))}
        </div>
      </details>
    </div>
  )
}

/** Shows the active palette, including custom colours. */
function PalettePreview() {
  const { t } = useT()
  const swatches = [
    { className: "bg-primary", label: t("views.settings.palettePrimary") },
    {
      className: "bg-complement",
      label: t("views.settings.paletteComplement"),
    },
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
  const ids = {
    lang: useId(),
    page: useId(),
    grid: useId(),
    timeZones: useId(),
  }

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

  const setTimestampTimeZones = (timeZones: string[]) => {
    set(
      "timestampTimeZones",
      [...new Set(timeZones)].sort((a, b) => {
        if (a === LOCAL_TIME_ZONE) return -1
        if (b === LOCAL_TIME_ZONE) return 1
        return a.localeCompare(b)
      })
    )
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

      <Section
        title={t("views.settings.timestampTooltips")}
        description={t("views.settings.timestampTimeZonesDescription")}
      >
        <Row label={t("views.settings.timestampTimeZonesLabel")} stacked>
          <MultiCombobox
            id={ids.timeZones}
            aria-label={t("views.settings.timestampTimeZonesLabel")}
            items={TIME_ZONE_OPTIONS}
            value={settings.timestampTimeZones}
            onChange={setTimestampTimeZones}
            label={(zone) =>
              zone === LOCAL_TIME_ZONE
                ? t("views.settings.localTimeZone", {
                    zone: getLocalTimeZone(),
                  })
                : zone
            }
            placeholder={t("views.settings.timeZoneSearch")}
          />
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
        <PaletteEditor />
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
