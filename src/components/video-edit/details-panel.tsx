import { Link } from "react-router"
import { cn } from "cn"

import { SignInIcon, WarningIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useT } from "@/lib/i18n"
import type { Video } from "@/lib/types"
import { decodeEntities } from "@/lib/video"
import { editableParts } from "@/lib/video-edit/routes"
import { useAuth } from "@/stores/auth"
import { MentionEditor } from "./mention-editor"
import { TopicEditor } from "./topic-editor"
import { cardVariants } from "@/components/ui/card"

/** Shown wherever editing would need an account, in place of a dead end. */
export function LoginPrompt({ className }: { className?: string }) {
  const { t } = useT()
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-3 text-sm",
        className
      )}
    >
      <p className="min-w-0 flex-1">{t("views.editor.needlogin")}</p>
      <Button nativeButton={false} size="sm" render={<Link to="/login" />}>
        <SignInIcon data-icon="inline-start" />
        {t("videoEdit.logIn")}
      </Button>
    </div>
  )
}

export function DetailsPanel({ video }: { video: Video }) {
  const { t } = useT()
  const user = useAuth((state) => state.user)
  const parts = editableParts(video)
  return (
    <div className="mx-auto grid w-full max-w-2xl content-start gap-3 p-3 lg:p-4">
      {!user && <LoginPrompt />}
      {parts.topic && <TopicEditor key={`topic-${video.id}`} video={video} />}
      {parts.mentions ? (
        <MentionEditor key={`mentions-${video.id}`} video={video} />
      ) : (
        <p
          className={cn(
            cardVariants({ radius: "2xl", padding: "md" }),
            "flex items-center gap-2 text-sm text-muted-foreground"
          )}
        >
          <WarningIcon className="size-4 shrink-0" />
          {t("curation.preview.placeholder")}
        </p>
      )}
    </div>
  )
}

/** What is known about the video, for working out who and what is in it. */
export function VideoDescription({
  video,
  className,
}: {
  video: Video
  className?: string
}) {
  if (!video.description) return null
  return (
    <div
      className={cn(
        "overflow-y-auto p-3 text-xs wrap-anywhere whitespace-pre-wrap text-muted-foreground",
        className
      )}
    >
      {decodeEntities(video.description)}
    </div>
  )
}
