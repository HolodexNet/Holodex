import { useMemo, useState } from "react"
import { cn } from "cn"

import {
  ArrowClockwiseIcon,
  CheckIcon,
  GridFourIcon,
  PencilSimpleIcon,
  TrashIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useIsMobile } from "@/hooks/use-mobile"
import { useT } from "@/lib/i18n"
import { activeVideos, videoSlotCount } from "@/lib/multiview/cells"
import { encodeLayout } from "@/lib/multiview/codec"
import {
  decodeSavedPresets,
  groupPresets,
  MOBILE_PRESETS,
} from "@/lib/multiview/presets"
import type { NamedLayout } from "@/lib/multiview/types"
import { useMultiview } from "@/stores/multiview"
import { useMultiviewPresets } from "@/stores/multiview-presets"
import { useMultiviewUi } from "@/stores/multiview-ui"
import { LayoutPreview } from "./layout-preview"
import { ShortcutBadge, ShortcutKeys } from "./shortcut-hint"
import { ToolbarTip } from "./toolbar-tip"
import {
  applyDirectorLayout,
  cancelLayoutPrompt,
  confirmLayoutPrompt,
} from "./use-commands"

function usePresetGroups() {
  const custom = useMultiviewPresets((s) => s.custom)
  return useMemo(() => {
    const decoded = decodeSavedPresets(custom)
    return { custom: decoded, groups: groupPresets(decoded) }
  }, [custom])
}

/** Presets always merge: a new shape should not stop what is already playing. */
function useApplyPreset() {
  const applyLayout = useMultiview((s) => s.applyLayout)
  return (preset: NamedLayout) => applyLayout(preset, { merge: true })
}

function PresetCard({
  preset,
  active,
  scale,
  onClick,
  children,
}: {
  preset: NamedLayout
  active?: boolean
  scale?: number
  onClick: () => void
  children?: React.ReactNode
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        className="flex flex-col items-center gap-1 rounded-lg p-1.5 outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
      >
        <LayoutPreview
          slots={preset.slots}
          portrait={preset.portrait}
          scale={scale}
        />
        <span className={cn("text-sm", active && "font-medium text-primary")}>
          {preset.name}
        </span>
      </button>
      {children}
    </div>
  )
}

/** Quick choices sized for what is on screen now, with the rest one click away. */
export function PresetMenu({ className }: { className?: string }) {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()
  const cells = useMultiview((s) => s.cells)
  const auto = useMultiviewPresets((s) => s.auto)
  const setUi = useMultiviewUi((s) => s.set)
  const apply = useApplyPreset()
  const { groups } = usePresetGroups()
  const count = activeVideos(cells).length

  const quick = isMobile
    ? MOBILE_PRESETS
    : (groups.find((group) => group.videoCount === count)?.presets ??
      groups.find((group) => group.videoCount === 1)?.presets ??
      [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <ToolbarTip
        label={t("views.multiview.presets")}
        detail={t("views.multiview.tips.presets")}
        shortcut="presets"
        disabled={open}
        render={
          <PopoverTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className={cn("relative", className)}
              />
            }
          />
        }
      >
        <GridFourIcon />
        <ShortcutBadge id="presets" />
      </ToolbarTip>
      <PopoverContent
        align="end"
        className="max-h-[80vh] w-[min(34rem,calc(100vw-1rem))] gap-1 overflow-y-auto p-2"
      >
        <div className="flex items-center justify-between gap-2 px-1">
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {t("views.multiview.changeLayout")}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              applyDirectorLayout()
              setOpen(false)
            }}
          >
            {t("views.multiview.director.layout")}
            <ShortcutKeys id="director-layout" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setOpen(false)
              setUi({ presetDialogOpen: true })
            }}
          >
            {t("views.favorites.showall")}
          </Button>
        </div>
        <div className="flex flex-wrap gap-1">
          {quick.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              scale={0.8}
              active={auto.includes(preset.id)}
              onClick={() => {
                apply(preset)
                setOpen(false)
              }}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** Every layout, plus choosing which one auto-layout uses for each video count. */
export function PresetDialog() {
  const { t, tc } = useT()
  const open = useMultiviewUi((s) => s.presetDialogOpen)
  const setUi = useMultiviewUi((s) => s.set)
  const auto = useMultiviewPresets((s) => s.auto)
  const setAuto = useMultiviewPresets((s) => s.setAuto)
  const resetAuto = useMultiviewPresets((s) => s.resetAuto)
  const removeCustom = useMultiviewPresets((s) => s.removeCustom)
  const { custom, groups } = usePresetGroups()
  const applyPreset = useApplyPreset()
  const [tab, setTab] = useState<"desktop" | "custom" | "mobile">("desktop")
  const [editingAuto, setEditingAuto] = useState(false)

  const apply = (preset: NamedLayout) => {
    applyPreset(preset)
    setUi({ presetDialogOpen: false })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => setUi({ presetDialogOpen: next })}
    >
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>{t("views.multiview.presets")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList>
              <TabsTrigger value="desktop">
                {t("views.multiview.preset.desktop")}
              </TabsTrigger>
              <TabsTrigger value="custom">
                {t("views.multiview.preset.custom")}
              </TabsTrigger>
              <TabsTrigger value="mobile">
                {t("views.multiview.preset.mobile")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          {tab === "desktop" && (
            <div className="ml-auto flex gap-1.5">
              {editingAuto && (
                <Button variant="outline" size="sm" onClick={resetAuto}>
                  <ArrowClockwiseIcon data-icon="inline-start" />
                  {t("views.library.selectionReset")}
                </Button>
              )}
              <Button
                variant={editingAuto ? "default" : "outline"}
                size="sm"
                onClick={() => setEditingAuto((value) => !value)}
              >
                {editingAuto ? (
                  <CheckIcon data-icon="inline-start" />
                ) : (
                  <PencilSimpleIcon data-icon="inline-start" />
                )}
                {editingAuto
                  ? t("views.multiview.done")
                  : t("views.multiview.editAutoLayout")}
              </Button>
            </div>
          )}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {tab === "desktop" &&
            groups.map(({ videoCount, presets }) => (
              <section key={videoCount} className="mb-2">
                {videoCount > 0 && (
                  <h3 className="px-1 pb-1 text-sm text-muted-foreground">
                    {tc("component.channelInfo.videoCount", videoCount, [
                      videoCount,
                    ])}
                  </h3>
                )}
                <div className="flex flex-wrap gap-1">
                  {editingAuto && (
                    <button
                      type="button"
                      onClick={() => setAuto(videoCount, null)}
                      className={cn(
                        "flex h-27 w-24 items-center justify-center self-start rounded-lg border border-dashed text-sm hover:bg-muted",
                        !auto[videoCount] && "border-primary text-primary"
                      )}
                    >
                      {t("views.multiview.preset.none")}
                    </button>
                  )}
                  {presets.map((preset) => (
                    <PresetCard
                      key={preset.id}
                      preset={preset}
                      active={
                        editingAuto
                          ? auto[videoCount] === preset.id
                          : auto.includes(preset.id)
                      }
                      onClick={() =>
                        editingAuto
                          ? setAuto(videoCount, preset.id)
                          : apply(preset)
                      }
                    >
                      {preset.custom && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="absolute top-2 right-2 bg-background/80"
                          aria-label={t("views.multiview.preset.remove")}
                          title={t("views.multiview.preset.remove")}
                          onClick={() => removeCustom(preset.name)}
                        >
                          <TrashIcon />
                        </Button>
                      )}
                    </PresetCard>
                  ))}
                </div>
              </section>
            ))}
          {tab === "custom" && (
            <div className="flex flex-wrap gap-1">
              {custom.length === 0 && (
                <p className="p-4 text-sm text-muted-foreground">
                  {t("views.multiview.preset.noCustom")}
                </p>
              )}
              {custom.map((preset) => (
                <PresetCard
                  key={preset.name}
                  preset={preset}
                  active={auto.includes(preset.id)}
                  onClick={() => apply(preset)}
                >
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="absolute top-2 right-2 bg-background/80"
                    aria-label={t("views.multiview.preset.remove")}
                    title={t("views.multiview.preset.remove")}
                    onClick={() => removeCustom(preset.name)}
                  >
                    <TrashIcon />
                  </Button>
                </PresetCard>
              ))}
            </div>
          )}
          {tab === "mobile" && (
            <div className="flex flex-wrap justify-around gap-1">
              {MOBILE_PRESETS.map((preset) => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  onClick={() => apply(preset)}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function SaveLayoutDialog() {
  const open = useMultiviewUi((s) => s.saveDialogOpen)
  const setUi = useMultiviewUi((s) => s.set)
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => setUi({ saveDialogOpen: next })}
    >
      <DialogContent>
        {/* Remounted each time, so an abandoned name does not linger. */}
        {open && (
          <SaveLayoutForm onDone={() => setUi({ saveDialogOpen: false })} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function SaveLayoutForm({ onDone }: { onDone: () => void }) {
  const { t, tc } = useT()
  const cells = useMultiview((s) => s.cells)
  const custom = useMultiviewPresets((s) => s.custom)
  const addCustom = useMultiviewPresets((s) => s.addCustom)
  const setAuto = useMultiviewPresets((s) => s.setAuto)
  const [name, setName] = useState("")
  const [useInAuto, setUseInAuto] = useState(false)
  const videoCells = videoSlotCount(cells)
  const canSave =
    !!name && !custom.some((preset) => preset.name === name) && cells.length > 0

  const save = () => {
    const layout = encodeLayout(cells)
    addCustom({ name, layout })
    if (useInAuto) setAuto(videoCells, layout)
    onDone()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("views.multiview.presetEditor.title")}</DialogTitle>
      </DialogHeader>
      <p className="text-sm text-muted-foreground">
        {tc("component.channelInfo.videoCount", videoCells, [videoCells])}
      </p>
      <div className="flex flex-wrap gap-4">
        <LayoutPreview slots={cells} />
        <div className="flex min-w-40 flex-1 flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="mv-preset-name">
              {t("views.multiview.presetEditor.name")}
            </Label>
            <Input
              id="mv-preset-name"
              autoFocus
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <Label className="flex items-center gap-2 font-normal">
            <Checkbox
              checked={useInAuto}
              onCheckedChange={(checked) => setUseInAuto(!!checked)}
            />
            {t("views.multiview.presetEditor.autoLayout")}
          </Label>
        </div>
      </div>
      <Button disabled={!canSave} onClick={save}>
        {t("views.multiview.presetEditor.title")}
      </Button>
    </>
  )
}

/** Confirms replacing the current layout, with the option to carry videos over. */
export function LayoutPromptDialog() {
  const prompt = useMultiviewUi((s) => s.prompt)
  return (
    <Dialog
      open={prompt !== null}
      onOpenChange={(open) => !open && cancelLayoutPrompt()}
    >
      <DialogContent>
        {prompt && <LayoutPromptForm key={prompt.layout.id} />}
      </DialogContent>
    </Dialog>
  )
}

function LayoutPromptForm() {
  const { t } = useT()
  const prompt = useMultiviewUi((s) => s.prompt)
  const [merge, setMerge] = useState(prompt?.defaultMerge ?? false)
  if (!prompt) return null
  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("views.multiview.confirmOverwrite")}</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col items-center gap-3">
        <LayoutPreview slots={prompt.layout.slots} />
        <Label className="flex items-center gap-2 font-normal">
          <Checkbox
            checked={merge}
            onCheckedChange={(checked) => setMerge(!!checked)}
          />
          {t("views.multiview.fillEmptyCells")}
        </Label>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={cancelLayoutPrompt}>
          {t("views.library.deleteConfirmationCancel")}
        </Button>
        <Button onClick={() => confirmLayoutPrompt(merge)}>
          {t("views.multiview.confirmOverwriteYes")}
        </Button>
      </div>
    </>
  )
}
