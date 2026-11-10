import { useId, useState, type ReactNode } from "react"
import { cn } from "cn"
import { toast } from "sonner"

import { ChannelAvatar } from "@/components/common/channel-avatar"
import { FeedFilters, SwitchRow } from "@/components/common/feed-filters"
import { MultiCombobox } from "@/components/common/multi-combobox"
import { SimpleSelect } from "@/components/common/simple-select"
import {
  ArrowCounterClockwiseIcon,
  CaretRightIcon,
  CheckIcon,
  ClipboardTextIcon,
  CopyIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
  WarningIcon,
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
import { Textarea } from "@/components/ui/textarea"
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
import {
  contrastRatio,
  hexToOklch,
  hueDistance,
  isHexColor,
  normalizeHex,
  wrapHue,
} from "@/lib/theme/color"
import {
  applyGroups,
  applyOverrides,
  exportTheme,
  importTheme,
  isThemeColor,
  normalizeThemeColor,
  THEME_GROUPS,
  themeColorToHex,
  type GroupDef,
  type ThemeGroup,
} from "@/lib/theme/overrides"
import {
  complementHex,
  DEFAULT_TUNING,
  deriveBaseHue,
  derivePalette,
  normalizeTuning,
  resolveBaseHue,
  triadicHues,
  type ThemeOverrides,
  type ThemePalette,
  type ThemeTuning,
} from "@/lib/theme/palette"
import { useResolvedMode, useThemeConfig } from "@/lib/theme/use-theme"
import { channelName } from "@/lib/video"
import { useAuth } from "@/stores/auth"
import { useMultiview } from "@/stores/multiview"
import { useOrgStore } from "@/stores/org"
import {
  useSettings,
  type DefaultPage,
  type GridSize,
  type MusicSidebarMode,
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
  description?: ReactNode
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
  selected = false,
}: {
  id?: string
  label: string
  value: string
  onChange: (color: string) => void
  onReset: () => void
  resetDisabled: boolean
  allowOpacity?: boolean
  /** Ring the swatch like a chosen preset, for a custom colour. */
  selected?: boolean
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
        className={cn(
          "size-9 cursor-pointer rounded-full border border-input bg-transparent p-1 [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-0 [&::-webkit-color-swatch-wrapper]:p-0",
          selected && "ring-2 ring-foreground ring-offset-2 ring-offset-card"
        )}
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

/** A circular colour choice, as used by the primary and secondary presets. */
function Swatch({
  color,
  label,
  selected,
  onClick,
}: {
  color: string
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={selected}
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full transition-transform outline-none hover:scale-110 focus-ring",
        selected && "ring-2 ring-foreground ring-offset-2 ring-offset-card"
      )}
      style={{ backgroundColor: color }}
      onClick={onClick}
    >
      {selected && (
        <CheckIcon className="size-4 text-white mix-blend-difference" />
      )}
    </button>
  )
}

/**
 * A collapsible block. The theme editor nests these from broad to specific
 * so only the level someone opens is on screen.
 */
function Disclosure({
  title,
  description,
  hint,
  defaultOpen = false,
  nested = false,
  children,
}: {
  title: string
  description?: string
  /** Short status shown at the end of the summary, e.g. "2 custom". */
  hint?: string
  defaultOpen?: boolean
  nested?: boolean
  children: ReactNode
}) {
  return (
    <details open={defaultOpen} className={cn(!nested && "py-1")}>
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg py-2.5 outline-none focus-ring [&::-webkit-details-marker]:hidden">
        <CaretRightIcon className="size-3.5 shrink-0 text-muted-foreground transition-transform [[open]>summary>&]:rotate-90" />
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              "block font-medium",
              nested ? "text-[13px]" : "text-sm"
            )}
          >
            {title}
          </span>
          {description && (
            <span className="block text-[13px] text-muted-foreground">
              {description}
            </span>
          )}
        </span>
        {hint && (
          <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
            {hint}
          </span>
        )}
      </summary>
      <div className={cn(nested ? "ml-1.5 border-l pl-4" : "pb-2")}>
        {children}
      </div>
    </details>
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
        {PRIMARY_PRESETS.map((preset) => (
          <Swatch
            key={preset.name}
            color={preset.color}
            label={preset.name}
            selected={preset.color === primary}
            onClick={() => choose(preset.color)}
          />
        ))}
      </div>
      <ColorPicker
        label={t("views.settings.primaryColor")}
        value={primary}
        onChange={choose}
        onReset={() => choose(DEFAULT_PRIMARY)}
        resetDisabled={primary === DEFAULT_PRIMARY}
        selected={!PRIMARY_PRESETS.some((preset) => preset.color === primary)}
      />
    </div>
  )
}

function useTuning() {
  const tuning = normalizeTuning(useSettings((s) => s.themeTuning))
  const set = useSettings((s) => s.set)
  const update = (patch: Partial<ThemeTuning>) =>
    set("themeTuning", {
      ...normalizeTuning(useSettings.getState().themeTuning),
      ...patch,
    })
  return [tuning, update] as const
}

/** The secondary drives the hue of every neutral and of the complement. */
function SecondaryColorPicker() {
  const { t } = useT()
  const mode = useResolvedMode()
  const primary = hexToOklch(useSettings((s) => s.primaryColor))
  const [tuning, update] = useTuning()
  const current = resolveBaseHue(primary, tuning)
  const [triadA, triadB] = triadicHues(primary.h)
  const presets = [
    { label: t("views.settings.secondaryTriadA"), hue: triadA },
    { label: t("views.settings.secondaryTriadB"), hue: triadB },
    {
      label: t("views.settings.secondaryComplementary"),
      hue: wrapHue(primary.h + 180),
    },
  ]
  const auto = tuning.secondary === undefined
  const autoHex = complementHex(deriveBaseHue(primary), mode)
  const presetSelected = (hue: number) =>
    !auto && hueDistance(current, hue) < 1.5
  const custom = !auto && !presets.some((preset) => presetSelected(preset.hue))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          aria-pressed={auto}
          className={cn(
            "flex h-8 items-center gap-2 rounded-full border py-1 ps-1 pe-3 text-sm outline-none focus-ring",
            auto && "ring-2 ring-foreground ring-offset-2 ring-offset-card"
          )}
          onClick={() => update({ secondary: undefined })}
        >
          <span
            aria-hidden="true"
            className="size-6 rounded-full"
            style={{ backgroundColor: autoHex }}
          />
          {t("views.settings.secondaryAuto")}
        </button>
        {presets.map((preset) => {
          const hex = complementHex(preset.hue, mode)
          return (
            <Swatch
              key={preset.label}
              color={hex}
              label={preset.label}
              selected={presetSelected(preset.hue)}
              onClick={() => update({ secondary: hex })}
            />
          )
        })}
      </div>
      <ColorPicker
        label={t("views.settings.secondaryColor")}
        value={tuning.secondary ?? autoHex}
        onChange={(color) => update({ secondary: normalizeHex(color) })}
        onReset={() => update({ secondary: undefined })}
        resetDisabled={auto}
        selected={custom}
      />
    </div>
  )
}

function TuningSlider({
  id,
  label,
  value,
  min,
  max,
  step,
  defaultValue,
  format,
  onChange,
}: {
  id: string
  label: string
  value: number
  min: number
  max: number
  step: number
  defaultValue: number
  format: (value: number) => string
  onChange: (value: number) => void
}) {
  const { t } = useT()
  return (
    <div className="flex items-center gap-3">
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={format(value)}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-9 w-full min-w-0 cursor-pointer accent-primary sm:w-48"
      />
      <output
        htmlFor={id}
        className="w-12 shrink-0 text-end text-sm text-muted-foreground tabular-nums"
      >
        {format(value)}
      </output>
      <Button
        variant="ghost"
        size="sm"
        disabled={value === defaultValue}
        aria-label={t("views.settings.resetNamedColor", { color: label })}
        onClick={() => onChange(defaultValue)}
      >
        <ArrowCounterClockwiseIcon data-icon="inline-start" />
        {t("views.settings.resetColor")}
      </Button>
    </div>
  )
}

/** Level one: the seed colours and the knobs on how the palette is derived. */
function ThemeColors() {
  const { t } = useT()
  const [tuning, update] = useTuning()
  const ids = { tint: useId(), contrast: useId() }
  const percent = (n: number) => `${Math.round(n * 100)}%`

  return (
    <Disclosure title={t("views.settings.themeColors")} defaultOpen>
      <div className="divide-y">
        <Row label={t("views.settings.primaryColor")} stacked>
          <PrimaryColorPicker />
        </Row>
        <Row
          label={t("views.settings.secondaryColor")}
          description={t("views.settings.secondaryColorMsg")}
          stacked
        >
          <SecondaryColorPicker />
        </Row>
        <Row
          label={t("views.settings.surfaceTint")}
          description={t("views.settings.surfaceTintMsg")}
          htmlFor={ids.tint}
        >
          <TuningSlider
            id={ids.tint}
            label={t("views.settings.surfaceTint")}
            value={tuning.tint}
            min={0}
            max={2}
            step={0.05}
            defaultValue={DEFAULT_TUNING.tint}
            format={percent}
            onChange={(tint) => update({ tint })}
          />
        </Row>
        <Row
          label={t("views.settings.contrast")}
          description={t("views.settings.contrastMsg")}
          htmlFor={ids.contrast}
        >
          <TuningSlider
            id={ids.contrast}
            label={t("views.settings.contrast")}
            value={tuning.contrast}
            min={-1}
            max={1}
            step={0.05}
            defaultValue={DEFAULT_TUNING.contrast}
            format={(n) => (n > 0 ? `+${percent(n)}` : percent(n))}
            onChange={(contrast) => update({ contrast })}
          />
        </Row>
        <ColorGroups />
      </div>
    </Disclosure>
  )
}

/** "Contrast 12.3:1", flagged when it falls below WCAG AA for body text. */
function ContrastHint({ fg, bg }: { fg: string; bg: string }) {
  const { t } = useT()
  const ratio = contrastRatio(
    themeColorToHex(fg).slice(0, 7),
    themeColorToHex(bg).slice(0, 7)
  )
  const low = ratio < 4.5
  const text = t(
    low ? "views.settings.contrastLow" : "views.settings.contrastRatio",
    { ratio: ratio.toFixed(1) }
  )
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        low && "text-destructive"
      )}
    >
      {low && <WarningIcon className="size-3.5" />}
      {text}
    </span>
  )
}

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

/** Level two (a colour per group) with level three (each token) inside. */
function ColorGroups() {
  const { t } = useT()
  const mode = useResolvedMode()
  const theme = useThemeConfig()
  const set = useSettings((s) => s.set)
  const groups = theme.groups?.[mode] ?? {}
  const overrides = theme.overrides?.[mode] ?? {}

  const derived = derivePalette(
    theme.primary,
    mode,
    normalizeTuning(theme.tuning)
  )
  const grouped = applyGroups(derived, groups)
  const final = applyOverrides(grouped, overrides)

  const customCount = Object.keys(groups).length + Object.keys(overrides).length

  const chooseGroup = (group: ThemeGroup, value?: string) => {
    const current = useSettings.getState().themeGroupOverrides
    const next = { ...current[mode] }
    if (value === undefined) delete next[group]
    else next[group] = value
    set("themeGroupOverrides", { ...current, [mode]: next })
  }
  const chooseColor = (color: keyof ThemeOverrides, value?: string) => {
    const current = useSettings.getState().themeColorOverrides
    const next = { ...current[mode] }
    if (value === undefined) delete next[color]
    else next[color] = value
    set("themeColorOverrides", { ...current, [mode]: next })
  }
  const resetMode = () => {
    const state = useSettings.getState()
    const nextGroups = { ...state.themeGroupOverrides }
    const nextColors = { ...state.themeColorOverrides }
    delete nextGroups[mode]
    delete nextColors[mode]
    set("themeGroupOverrides", nextGroups)
    set("themeColorOverrides", nextColors)
  }

  return (
    <Disclosure
      title={t("views.settings.colorGroupsTitle")}
      description={t("views.settings.colorGroupsMsg")}
      hint={
        customCount
          ? t("views.settings.customCount", { count: customCount })
          : undefined
      }
    >
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
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
          disabled={!customCount}
          onClick={resetMode}
        >
          <ArrowCounterClockwiseIcon data-icon="inline-start" />
          {t("views.settings.resetPalette")}
        </Button>
      </div>
      <div className="divide-y">
        {(Object.keys(THEME_GROUPS) as ThemeGroup[]).map((group) => (
          <ColorGroupRow
            key={`${mode}:${group}`}
            group={group}
            groupValue={grouped.vars[THEME_GROUPS[group].seed]}
            groupCustom={groups[group] !== undefined}
            final={final.vars}
            overrides={overrides}
            onGroupChange={(value) => chooseGroup(group, value)}
            onColorChange={chooseColor}
          />
        ))}
      </div>
    </Disclosure>
  )
}

function ColorGroupRow({
  group,
  groupValue,
  groupCustom,
  final,
  overrides,
  onGroupChange,
  onColorChange,
}: {
  group: ThemeGroup
  /** The seed colour with group overrides applied but not individual ones. */
  groupValue: string
  groupCustom: boolean
  final: ThemePalette["vars"]
  overrides: ThemeOverrides
  onGroupChange: (value?: string) => void
  onColorChange: (color: keyof ThemeOverrides, value?: string) => void
}) {
  const { t } = useT()
  const id = useId()
  const def: GroupDef = THEME_GROUPS[group]
  const label = t(`views.settings.colorGroups.${group}`)
  const customMembers = def.members.filter((m) => overrides[m] !== undefined)

  return (
    <div className="py-1">
      <Row
        label={label}
        htmlFor={id}
        description={
          <>
            {t(
              groupCustom
                ? "views.settings.colorCustom"
                : "views.settings.colorAutomatic"
            )}
            {def.contrastWith && (
              <>
                {" · "}
                <ContrastHint
                  fg={final[def.seed]}
                  bg={final[def.contrastWith]}
                />
              </>
            )}
          </>
        }
      >
        <ColorPicker
          id={id}
          label={label}
          value={groupValue}
          onChange={onGroupChange}
          onReset={() => onGroupChange()}
          resetDisabled={!groupCustom}
          allowOpacity
        />
      </Row>
      <Disclosure
        nested
        title={t("views.settings.individualColors", {
          count: def.members.length,
        })}
        hint={
          customMembers.length
            ? t("views.settings.customCount", { count: customMembers.length })
            : undefined
        }
      >
        <div className="divide-y">
          {def.members.map((color) => (
            <ThemeColorRow
              key={color}
              color={color}
              value={final[color]}
              custom={overrides[color] !== undefined}
              onChange={(value) => onColorChange(color, value)}
            />
          ))}
        </div>
      </Disclosure>
    </div>
  )
}

/** Copies the theme as text, or replaces it with pasted theme text. */
function ThemeShare() {
  const { t } = useT()
  const theme = useThemeConfig()
  const set = useSettings((s) => s.set)
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("")
  const [invalid, setInvalid] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(exportTheme(theme))
      toast.success(t("views.settings.themeCopied"))
    } catch {
      toast.error(t("views.settings.themeCopyFailed"))
    }
  }

  const apply = () => {
    const imported = importTheme(text)
    if (!imported) {
      setInvalid(true)
      return
    }
    set("primaryColor", imported.primary)
    set("themeTuning", imported.tuning)
    set("themeGroupOverrides", imported.groups)
    set("themeColorOverrides", imported.overrides)
    toast.success(t("views.settings.themeImported"))
    setOpen(false)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={copy}>
        <CopyIcon data-icon="inline-start" />
        {t("views.settings.copyTheme")}
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (next) {
            setText("")
            setInvalid(false)
          }
        }}
      >
        <DialogTrigger render={<Button variant="outline" size="sm" />}>
          <ClipboardTextIcon data-icon="inline-start" />
          {t("views.settings.importTheme")}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("views.settings.importTheme")}</DialogTitle>
            <DialogDescription>
              {t("views.settings.importThemeMsg")}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            aria-label={t("views.settings.importTheme")}
            value={text}
            spellCheck={false}
            aria-invalid={invalid}
            className="max-h-60 font-mono text-xs md:text-xs"
            onChange={(event) => {
              setText(event.target.value)
              setInvalid(false)
            }}
          />
          {invalid && (
            <p className="text-sm text-destructive">
              {t("views.settings.importThemeInvalid")}
            </p>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              {t("views.app.close_btn")}
            </DialogClose>
            <Button disabled={!text.trim()} onClick={apply}>
              {t("views.settings.importThemeApply")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
    useMultiview.getState().clearAll()
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
        <Row label={t("views.settings.computedPalette")}>
          <PalettePreview />
        </Row>
        <ThemeColors />
        <Row
          label={t("views.settings.shareTheme")}
          description={t("views.settings.shareThemeMsg")}
        >
          <ThemeShare />
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
        <Row
          label={t("views.settings.musicSidebarMode")}
          description={t("views.settings.musicSidebarModeDescription")}
        >
          <ToggleGroup
            variant="outline"
            spacing={0}
            value={[settings.musicSidebarMode]}
            onValueChange={(next) => {
              const mode = next[0] as MusicSidebarMode | undefined
              if (mode) set("musicSidebarMode", mode)
            }}
          >
            <ToggleGroupItem value="menu">
              {t("views.settings.musicSidebarMenu")}
            </ToggleGroupItem>
            <ToggleGroupItem value="list">
              {t("views.settings.musicSidebarList")}
            </ToggleGroupItem>
          </ToggleGroup>
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
