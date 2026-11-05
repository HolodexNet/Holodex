import { Link } from "react-router"
import { cn } from "cn"

import {
  ArrowUUpLeftIcon,
  ArrowUUpRightIcon,
  FilmStripIcon,
  FloppyDiskIcon,
  HandTapIcon,
  KeyboardIcon,
  ListNumbersIcon,
  SignInIcon,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Kbd } from "@/components/ui/kbd"
import { Spinner } from "@/components/ui/spinner"
import { useT } from "@/lib/i18n"
import {
  editPath,
  SONG_APPROACHES,
  type SongApproach,
} from "@/lib/video-edit/routes"
import { SHORTCUT_GROUPS, SONG_SHORTCUT_KEYS } from "@/lib/video-edit/shortcuts"
import { useAuth } from "@/stores/auth"
import { useSongEditor } from "@/stores/song-editor"
import { useSongWorkspace } from "./workspace"

const APPROACH_ICONS = {
  setlist: ListNumbersIcon,
  timeline: FilmStripIcon,
  capture: HandTapIcon,
} as const

function ApproachSwitcher({ current }: { current: SongApproach }) {
  const { t } = useT()
  const { video } = useSongWorkspace()
  return (
    <nav
      aria-label={t("videoEdit.approach.label")}
      className="flex items-center gap-0.5 rounded-4xl bg-muted p-0.5"
    >
      {SONG_APPROACHES.map((approach) => {
        const Icon = APPROACH_ICONS[approach]
        return (
          <Link
            key={approach}
            to={editPath(video.id, "music", approach)}
            replace
            aria-current={approach === current ? "page" : undefined}
            title={t(`videoEdit.approach.${approach}.hint`)}
            className={cn(
              "flex items-center gap-1.5 rounded-4xl px-2.5 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
              approach === current
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            <span className="max-sm:sr-only">
              {t(`videoEdit.approach.${approach}.title`)}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

function ShortcutSheet({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { t } = useT()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t("videoEdit.keys.title")}</DialogTitle>
          <DialogDescription>
            {t("videoEdit.keys.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 sm:grid-cols-3">
          {SHORTCUT_GROUPS.map((group) => (
            <section key={group.id} className="grid content-start gap-1.5">
              <h3 className="text-xs font-semibold text-muted-foreground">
                {t(`videoEdit.keys.groups.${group.id}`)}
              </h3>
              <dl className="grid gap-1">
                {group.items.map((shortcut) => (
                  <div
                    key={shortcut}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <dt className="min-w-0">
                      {t(`videoEdit.keys.${shortcut}`)}
                    </dt>
                    <dd>
                      <Kbd>{SONG_SHORTCUT_KEYS[shortcut]}</Kbd>
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** Choosing an approach, undoing, and saving: the same wherever you are working. */
export function SongToolbar({ approach }: { approach: SongApproach }) {
  const { t, tc } = useT()
  const user = useAuth((state) => state.user)
  const workspace = useSongWorkspace()
  const saving = useSongEditor((state) => state.saving)
  const loaded = useSongEditor((state) => state.load === "ready")
  const canUndo = useSongEditor((state) => state.past.length > 0)
  const canRedo = useSongEditor((state) => state.future.length > 0)
  const unsaved = workspace.rows.filter((row) => row.state !== "saved").length

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <ApproachSwitcher current={approach} />
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={!canUndo}
          aria-label={t("videoEdit.keys.undo")}
          title={t("videoEdit.keys.undo")}
          onClick={() => useSongEditor.getState().undo()}
        >
          <ArrowUUpLeftIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={!canRedo}
          aria-label={t("videoEdit.keys.redo")}
          title={t("videoEdit.keys.redo")}
          onClick={() => useSongEditor.getState().redo()}
        >
          <ArrowUUpRightIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="max-md:hidden"
          aria-label={t("videoEdit.keys.title")}
          title={t("videoEdit.keys.title")}
          onClick={() => workspace.setHelpOpen(true)}
        >
          <KeyboardIcon />
        </Button>
      </div>
      {user ? (
        <Button
          size="sm"
          disabled={saving || !loaded || unsaved === 0}
          onClick={workspace.save}
        >
          {saving ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <FloppyDiskIcon data-icon="inline-start" />
          )}
          {saving
            ? t("videoEdit.songs.save.saving")
            : unsaved
              ? tc("videoEdit.songs.save.action", unsaved)
              : t("videoEdit.songs.save.allSaved")}
        </Button>
      ) : (
        <Button nativeButton={false} size="sm" render={<Link to="/login" />}>
          <SignInIcon data-icon="inline-start" />
          {t("videoEdit.logIn")}
        </Button>
      )}
      <ShortcutSheet
        open={workspace.helpOpen}
        onOpenChange={workspace.setHelpOpen}
      />
    </div>
  )
}
