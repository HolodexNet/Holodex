import { Link } from "react-router"

import {
  ArrowUUpLeftIcon,
  ArrowUUpRightIcon,
  FloppyDiskIcon,
  KeyboardIcon,
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
import { SHORTCUT_GROUPS, SONG_SHORTCUT_KEYS } from "@/lib/video-edit/shortcuts"
import { useAuth } from "@/stores/auth"
import { useSongEditor } from "@/stores/song-editor"
import { useSongWorkspace } from "./workspace"

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
        <section className="grid gap-1.5 border-t pt-4">
          <h3 className="text-xs font-semibold text-muted-foreground">
            {t("videoEdit.time.help.title")}
          </h3>
          <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
            {[
              ["1:02:03", t("videoEdit.time.help.clock")],
              ["3m20s", t("videoEdit.time.help.words")],
              ["+30  -5", t("videoEdit.time.help.relative")],
              ["↑ ↓", t("videoEdit.time.help.step")],
              ["Shift + ↑ ↓", t("videoEdit.time.help.stepMore")],
              ["Scroll", t("videoEdit.time.help.scroll")],
            ].map(([sample, meaning]) => (
              <div
                key={sample}
                className="flex items-center justify-between gap-3 text-sm"
              >
                <dt className="min-w-0">{meaning}</dt>
                <dd>
                  <Kbd className="whitespace-pre tabular-nums">{sample}</Kbd>
                </dd>
              </div>
            ))}
          </dl>
        </section>
      </DialogContent>
    </Dialog>
  )
}

/** Undoing and saving. */
export function SongToolbar() {
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
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={!canUndo}
          aria-label={t("videoEdit.keys.undo")}
          title={`${t("videoEdit.keys.undo")} (${SONG_SHORTCUT_KEYS.undo})`}
          onClick={() => useSongEditor.getState().undo()}
        >
          <ArrowUUpLeftIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={!canRedo}
          aria-label={t("videoEdit.keys.redo")}
          title={`${t("videoEdit.keys.redo")} (${SONG_SHORTCUT_KEYS.redo})`}
          onClick={() => useSongEditor.getState().redo()}
        >
          <ArrowUUpRightIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="max-md:hidden"
          aria-label={t("videoEdit.keys.title")}
          title={`${t("videoEdit.keys.title")} (${SONG_SHORTCUT_KEYS.help})`}
          onClick={() => workspace.setHelpOpen(true)}
        >
          <KeyboardIcon />
        </Button>
      </div>
      {user ? (
        <Button
          size="sm"
          disabled={saving || !loaded || unsaved === 0}
          title={SONG_SHORTCUT_KEYS.save}
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
