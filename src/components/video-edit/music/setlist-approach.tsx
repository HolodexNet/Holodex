import { useT } from "@/lib/i18n"
import { useSongEditor } from "@/stores/song-editor"
import { SourcePanel } from "./source-panel"
import { Tracklist } from "./tracklist"
import { useSongShortcuts, useSongWorkspace } from "./workspace"

/**
 * Starts from what fans already wrote. The comment with the best setlist is parsed
 * and shown next to the tracklist, one click turns it into songs, and tracks get
 * matched in the background. What's left for a person is a review: go through the
 * list, listen to each song's start and end, fix what's off, confirm, next.
 *
 * Best when a setlist exists, which for popular streams it nearly always does.
 */
export function SetlistApproach() {
  const { t } = useT()
  const workspace = useSongWorkspace()
  const { rows, selected } = workspace
  const unsaved = rows.filter(
    (row) => row.state === "new" || row.state === "edited"
  )
  const checked = unsaved.filter((row) => row.song.checked).length

  const confirmAndNext = () => {
    if (!selected) {
      const first = unsaved.find((row) => !row.song.checked) ?? rows[0]
      if (first) workspace.openSong(first.song.id)
      return
    }
    if (workspace.canEdit(selected))
      useSongEditor
        .getState()
        .update(selected.id, { checked: true }, { silent: true })
    const position = rows.findIndex((row) => row.song.id === selected.id)
    const after = rows.slice(position + 1)
    const next =
      after.find(
        (row) =>
          (row.state === "new" || row.state === "edited") && !row.song.checked
      ) ??
      after.find((row) => row.state !== "removed") ??
      null
    if (next) workspace.openSong(next.song.id)
    else useSongEditor.getState().select(null)
  }

  useSongShortcuts({ confirm: confirmAndNext })

  return (
    <>
      <SourcePanel className="max-h-[50dvh] border-b lg:max-h-none lg:border-r lg:border-b-0 lg:[grid-area:source]" />
      <Tracklist
        className="lg:overflow-hidden lg:[grid-area:list]"
        doneLabel={t("videoEdit.setlist.confirmNext")}
        onDone={confirmAndNext}
        header={
          unsaved.length > 0 && (
            <span className="text-xs text-muted-foreground tabular-nums">
              {t("videoEdit.setlist.checkedProgress", {
                checked,
                total: unsaved.length,
              })}
            </span>
          )
        }
        empty={
          <p className="p-6 text-center text-sm text-muted-foreground">
            {workspace.canAdd
              ? t("videoEdit.setlist.emptyList")
              : t("videoEdit.songs.none")}
          </p>
        }
      />
    </>
  )
}
