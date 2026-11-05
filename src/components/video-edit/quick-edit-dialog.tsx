import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useT } from "@/lib/i18n"
import type { Video } from "@/lib/types"
import { channelName, videoTitle } from "@/lib/video"
import { editableParts, editPath } from "@/lib/video-edit/routes"
import { useSettings } from "@/stores/settings"
import { MentionEditor } from "./mention-editor"
import { TopicEditor } from "./topic-editor"

/** Changes apply as they're made, so there's nothing to confirm on the way out. */
export function QuickEditDialog({
  video,
  onClose,
}: {
  video: Video
  onClose: () => void
}) {
  const { t } = useT()
  const preferEnglish = useSettings((state) => state.useEnglishName)
  const parts = editableParts(video)
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-3 overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="truncate pr-8">
            {videoTitle(video, preferEnglish)}
          </DialogTitle>
          <DialogDescription>
            {channelName(video.channel, preferEnglish)}
          </DialogDescription>
        </DialogHeader>
        {parts.topic && <TopicEditor video={video} />}
        {parts.mentions && <MentionEditor video={video} />}
        <DialogFooter>
          <Button
            nativeButton={false}
            variant="ghost"
            render={<Link to={editPath(video.id)} onClick={onClose} />}
          >
            {t("videoEdit.quick.openEditor")}
          </Button>
          <Button onClick={onClose}>{t("curation.done")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
