import { useState, type ReactNode } from "react"
import { useNavigate } from "react-router"
import { cn } from "cn"
import { toast } from "sonner"
import { AnimatePresence } from "motion/react"
import * as m from "motion/react-m"

import { Logo } from "@/components/common/logo"
import {
  ArrowUUpLeftIcon,
  ArrowUUpRightIcon,
  ArrowsClockwiseIcon,
  CaretDownIcon,
  CaretUpIcon,
  CheckIcon,
  CopyIcon,
  CornersInIcon,
  CornersOutIcon,
  DotsThreeVerticalIcon,
  EraserIcon,
  FloppyDiskIcon,
  GearSixIcon,
  HeadphonesIcon,
  HeartIcon,
  HouseLineIcon,
  KeyboardIcon,
  LinkSimpleIcon,
  MagnifyingGlassPlusIcon,
  MonitorPlayIcon,
  PencilSimpleIcon,
  PlusIcon,
  SlidersHorizontalIcon,
  TrashIcon,
  UsersThreeIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useT } from "@/lib/i18n"
import { permalinkPath } from "@/lib/multiview/codec"
import type { ShortcutId } from "@/lib/multiview/shortcuts"
import { useMultiview } from "@/stores/multiview"
import { useMultiviewUi } from "@/stores/multiview-ui"
import { toggleDirector } from "./media-actions"
import { PresetMenu } from "./preset-menu"
import { ShortcutBadge, ShortcutKeys } from "./shortcut-hint"
import { ToolbarTip, ToolbarTips } from "./toolbar-tip"
import { useMultiviewCommands } from "./use-commands"
import { useFullscreen } from "./use-fullscreen"
import { VideoTray } from "./video-tray"

/** Width at which an action moves from the bar into the overflow menu. */
type Collapse = "sm" | "md" | "lg" | "xl"

const IN_BAR: Record<Collapse, string> = {
  sm: "hidden sm:inline-flex",
  md: "hidden md:inline-flex",
  lg: "hidden lg:inline-flex",
  xl: "hidden xl:inline-flex",
}
const IN_MENU: Record<Collapse, string> = {
  sm: "sm:hidden",
  md: "md:hidden",
  lg: "lg:hidden",
  xl: "xl:hidden",
}

/**
 * For `focusableWhenDisabled`, which keeps a button pointable and focusable so that
 * its tip can still say what it is for. That leaves the button's `disabled:` styles
 * unused, so the look is repeated here.
 */
const DISABLED_WITH_TIP =
  "aria-disabled:cursor-default aria-disabled:opacity-50 aria-disabled:hover:bg-transparent dark:aria-disabled:hover:bg-transparent"

interface ToolAction {
  id: string
  label: string
  /** What clicking it does, for someone deciding whether they want that. */
  detail: string
  icon: ReactNode
  onClick: () => void
  collapse?: Collapse
  active?: boolean
  shortcut?: ShortcutId
}

function ToolButton({ action }: { action: ToolAction }) {
  return (
    <ToolbarTip
      label={action.label}
      detail={action.detail}
      shortcut={action.shortcut}
      render={
        <Button
          variant="ghost"
          size="icon-sm"
          aria-pressed={action.active}
          className={cn(
            "relative",
            action.collapse && IN_BAR[action.collapse],
            action.active && "bg-muted text-primary"
          )}
          onClick={action.onClick}
        />
      }
    >
      {action.icon}
      {action.shortcut && <ShortcutBadge id={action.shortcut} />}
    </ToolbarTip>
  )
}

function OverflowMenu({ actions }: { actions: ToolAction[] }) {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  if (!actions.length) return null
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <ToolbarTip
        label={t("component.videoCard.moreActions")}
        detail={t("views.multiview.tips.moreActions")}
        disabled={open}
        render={
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" className="xl:hidden" />
            }
          />
        }
      >
        <DotsThreeVerticalIcon />
      </ToolbarTip>
      <DropdownMenuContent align="end">
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.id}
            className={IN_MENU[action.collapse!]}
            title={action.detail}
            onClick={action.onClick}
          >
            {action.icon}
            {action.label}
            {action.shortcut && (
              <ShortcutKeys id={action.shortcut} className="ml-auto" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** The way back into the rest of the site, now the app shell is out of the way. */
function SiteMenu() {
  const { t } = useT()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const items = [
    { to: "/", label: t("component.mainNav.home"), icon: <HouseLineIcon /> },
    {
      to: "/favorites",
      label: t("component.mainNav.favorites"),
      icon: <HeartIcon />,
    },
    {
      to: "/channel",
      label: t("component.mainNav.channels"),
      icon: <UsersThreeIcon />,
    },
    {
      to: "/settings",
      label: t("component.mainNav.settings"),
      icon: <GearSixIcon />,
    },
  ]
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <ToolbarTip
        label={t("views.multiview.tips.siteMenu")}
        detail={t("views.multiview.tips.siteMenuDetail")}
        disabled={open}
        render={
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm" className="shrink-0" />
            }
          />
        }
      >
        <Logo className="size-5" />
      </ToolbarTip>
      <DropdownMenuContent align="start">
        {items.map((item) => (
          <DropdownMenuItem key={item.to} onClick={() => navigate(item.to)}>
            {item.icon}
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ShareButton({ className }: { className?: string }) {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  const cells = useMultiview((s) => s.cells)
  const url = open ? `${window.location.origin}${permalinkPath(cells)}` : ""

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success(t("component.videoCard.copiedToClipboard"))
      setOpen(false)
    } catch {
      toast.error(t("component.videoCard.copyFailed"))
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <ToolbarTip
        label={t("views.multiview.permalink")}
        detail={t("views.multiview.tips.permalink")}
        disabled={open}
        render={
          <PopoverTrigger
            render={
              <Button variant="ghost" size="icon-sm" className={className} />
            }
          />
        }
      >
        <LinkSimpleIcon />
      </ToolbarTip>
      <PopoverContent
        align="end"
        className="w-[min(26rem,calc(100vw-1rem))] p-2"
      >
        <div className="flex items-center gap-1.5">
          <Input
            readOnly
            value={url}
            aria-label={t("views.multiview.permalink")}
            className="h-8 min-w-0 flex-1"
            onFocus={(event) => event.currentTarget.select()}
          />
          <Button
            size="icon-sm"
            aria-label={t("component.videoCard.copyLink")}
            onClick={() => void copy()}
          >
            <CopyIcon />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** Opens the full picker, and on a phone is the only way in: the tray has no room. */
function AddVideoButton() {
  const { t } = useT()
  const setUi = useMultiviewUi((s) => s.set)
  return (
    <ToolbarTip
      label={t("views.multiview.addVideo")}
      detail={t("views.multiview.tips.addVideo")}
      shortcut="add-video"
      render={
        <Button
          variant="ghost"
          size="icon-sm"
          className="relative shrink-0"
          onClick={() => setUi({ picker: { kind: "auto" } })}
        />
      }
    >
      <MagnifyingGlassPlusIcon />
      <ShortcutBadge id="add-video" />
    </ToolbarTip>
  )
}

/** Puts the whole view into editing mode; the one button that matters most. */
function EditToggle() {
  const { t } = useT()
  const enterEditing = useMultiview((s) => s.enterEditing)
  return (
    <ToolbarTip
      label={t("views.multiview.edit.enter")}
      detail={t("views.multiview.tips.edit")}
      shortcut="edit"
      render={
        <Button
          variant="secondary"
          size="sm"
          className="shrink-0"
          onClick={enterEditing}
        />
      }
    >
      <PencilSimpleIcon data-icon="inline-start" />
      <span className="hidden sm:inline">
        {t("views.multiview.edit.enter")}
      </span>
      <ShortcutKeys id="edit" className="hidden lg:inline-flex" />
    </ToolbarTip>
  )
}

function ViewActions() {
  const { t } = useT()
  const setUi = useMultiviewUi((s) => s.set)
  const syncBarOpen = useMultiviewUi((s) => s.syncBarOpen)
  const controlsOpen = useMultiviewUi((s) => s.mediaControlsOpen)
  const clearAll = useMultiview((s) => s.clearAll)
  const audioFocus = useMultiview((s) => s.muteOthers)
  const setAudioFocus = useMultiview((s) => s.setMuteOthers)
  const director = useMultiview((s) => s.directorMode)
  const { addCell } = useMultiviewCommands()
  const { isFullscreen, toggleFullscreen } = useFullscreen()

  const actions: ToolAction[] = [
    {
      id: "add",
      label: t("views.multiview.addframe"),
      detail: t("views.multiview.tips.addCell"),
      icon: <PlusIcon />,
      onClick: addCell,
      collapse: "sm",
      shortcut: "add-cell",
    },
    {
      id: "audio-focus",
      label: t("views.multiview.muteOthers"),
      detail: t("views.multiview.muteOthersDetail"),
      icon: <HeadphonesIcon />,
      onClick: () => setAudioFocus(!audioFocus),
      active: audioFocus,
      shortcut: "audio-focus",
    },
    {
      id: "director",
      label: t("views.multiview.director.mode"),
      detail: t("views.multiview.tips.director"),
      icon: <MonitorPlayIcon />,
      onClick: toggleDirector,
      active: director,
      collapse: "md",
      shortcut: "director",
    },
    {
      id: "media",
      label: t("views.multiview.mediaControls"),
      detail: t("views.multiview.tips.mediaControls"),
      icon: <SlidersHorizontalIcon />,
      onClick: () => setUi({ mediaControlsOpen: !controlsOpen }),
      active: controlsOpen,
      shortcut: "media-controls",
    },
    {
      id: "sync",
      label: t("views.multiview.archiveSync"),
      detail: t("views.multiview.tips.archiveSync"),
      icon: <ArrowsClockwiseIcon />,
      onClick: () => setUi({ syncBarOpen: !syncBarOpen }),
      active: syncBarOpen,
      collapse: "sm",
      shortcut: "sync-bar",
    },
    {
      id: "save",
      label: t("views.multiview.presetEditor.title"),
      detail: t("views.multiview.tips.save"),
      icon: <FloppyDiskIcon />,
      onClick: () => setUi({ saveDialogOpen: true }),
      collapse: "lg",
    },
    {
      id: "clear",
      label: t("views.multiview.clearAll"),
      detail: t("views.multiview.tips.clear"),
      icon: <TrashIcon />,
      onClick: clearAll,
      collapse: "md",
    },
    {
      id: "fullscreen",
      label: isFullscreen
        ? t("views.multiview.exitFullScreen")
        : t("views.multiview.fullScreen"),
      detail: isFullscreen
        ? t("views.multiview.tips.exitFullScreen")
        : t("views.multiview.tips.fullScreen"),
      icon: isFullscreen ? <CornersInIcon /> : <CornersOutIcon />,
      onClick: toggleFullscreen,
      collapse: "lg",
      shortcut: "fullscreen",
    },
    {
      id: "shortcuts",
      label: t("views.multiview.shortcuts.title"),
      detail: t("views.multiview.tips.shortcuts"),
      icon: <KeyboardIcon />,
      onClick: () => setUi({ helpOpen: true }),
      collapse: "lg",
      shortcut: "help",
    },
  ]

  return (
    <>
      <EditToggle />
      <PresetMenu />
      {actions.map((action) => (
        <ToolButton key={action.id} action={action} />
      ))}
      <ShareButton />
      <OverflowMenu actions={actions.filter((a) => a.collapse)} />
      <ToolbarTip
        label={t("views.multiview.collapseToolbar")}
        detail={t("views.multiview.tips.collapseToolbar")}
        shortcut="toolbar"
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative"
            onClick={() => setUi({ toolbarCollapsed: true })}
          />
        }
      >
        <CaretUpIcon />
        <ShortcutBadge id="toolbar" />
      </ToolbarTip>
    </>
  )
}

/** While editing, the bar is about the edit: history, adding, and finishing. */
function EditActions() {
  const { t } = useT()
  const canUndo = useMultiview((s) => s.past.length > 0)
  const canRedo = useMultiview((s) => s.future.length > 0)
  const undo = useMultiview((s) => s.undo)
  const redo = useMultiview((s) => s.redo)
  const discardEdits = useMultiview((s) => s.discardEdits)
  const exitEditing = useMultiview((s) => s.exitEditing)
  const clearAll = useMultiview((s) => s.clearAll)
  const { addCell } = useMultiviewCommands()

  return (
    <>
      <ToolbarTip
        label={t("views.multiview.edit.undo")}
        detail={t("views.multiview.tips.undo")}
        shortcut="undo"
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={!canUndo}
            focusableWhenDisabled
            className={cn("relative", DISABLED_WITH_TIP)}
            onClick={undo}
          />
        }
      >
        <ArrowUUpLeftIcon />
        <ShortcutBadge id="undo" />
      </ToolbarTip>
      <ToolbarTip
        label={t("views.multiview.edit.redo")}
        detail={t("views.multiview.tips.redo")}
        shortcut="redo"
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={!canRedo}
            focusableWhenDisabled
            className={cn("relative", DISABLED_WITH_TIP)}
            onClick={redo}
          />
        }
      >
        <ArrowUUpRightIcon />
        <ShortcutBadge id="redo" />
      </ToolbarTip>
      <PresetMenu />
      <ToolbarTip
        label={t("views.multiview.addframe")}
        detail={t("views.multiview.tips.addCell")}
        shortcut="add-cell"
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative"
            onClick={addCell}
          />
        }
      >
        <PlusIcon />
        <ShortcutBadge id="add-cell" />
      </ToolbarTip>
      <ToolbarTip
        label={t("views.multiview.clearAll")}
        detail={t("views.multiview.tips.clearEditing")}
        render={<Button variant="ghost" size="icon-sm" onClick={clearAll} />}
      >
        <TrashIcon />
      </ToolbarTip>
      <ToolbarTip
        label={t("views.multiview.edit.discard")}
        detail={t("views.multiview.tips.discard")}
        render={
          <Button
            variant="ghost"
            size="sm"
            disabled={!canUndo}
            focusableWhenDisabled
            className={cn("hidden shrink-0 sm:inline-flex", DISABLED_WITH_TIP)}
            onClick={discardEdits}
          />
        }
      >
        <EraserIcon data-icon="inline-start" />
        {t("views.multiview.edit.discard")}
      </ToolbarTip>
      <ToolbarTip
        label={t("views.multiview.done")}
        detail={t("views.multiview.tips.done")}
        fixedKey="Escape"
        render={<Button size="sm" className="shrink-0" onClick={exitEditing} />}
      >
        <CheckIcon data-icon="inline-start" />
        {t("views.multiview.done")}
      </ToolbarTip>
    </>
  )
}

export function Toolbar() {
  const { t } = useT()
  const editing = useMultiview((s) => s.editing)
  const collapsed = useMultiviewUi((s) => s.toolbarCollapsed)
  const setUi = useMultiviewUi((s) => s.set)

  return (
    <>
      <ToolbarTips />
      {collapsed ? (
        <ToolbarTip
          label={t("views.multiview.expandToolbar")}
          detail={t("views.multiview.tips.expandToolbar")}
          shortcut="toolbar"
          render={
            <Button
              variant="secondary"
              size="icon-xs"
              className="absolute top-0 right-0 z-40 rounded-none rounded-bl-md opacity-50 hover:opacity-100"
              onClick={() => setUi({ toolbarCollapsed: false })}
            />
          }
        >
          <CaretDownIcon />
        </ToolbarTip>
      ) : (
        <header className="box-content flex h-12 shrink-0 items-center gap-1.5 border-b bg-card px-1.5 pt-[env(safe-area-inset-top,0px)]">
          <SiteMenu />
          <AddVideoButton />
          <VideoTray className="hidden sm:flex" />
          <div className="flex-1 sm:hidden" />
          <div className="flex shrink-0 items-center gap-0.5">
            <AnimatePresence mode="popLayout" initial={false}>
              <m.div
                key={editing ? "edit" : "view"}
                className="flex items-center gap-0.5"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                transition={{ duration: 0.12 }}
              >
                {editing ? <EditActions /> : <ViewActions />}
              </m.div>
            </AnimatePresence>
          </div>
        </header>
      )}
    </>
  )
}
