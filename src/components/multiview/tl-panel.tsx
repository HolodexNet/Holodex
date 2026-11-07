import { cn } from "cn"

import {
  ArchiveTranslations,
  LiveTranslations,
  type TlPanelProps,
} from "@/components/tldex/tldex"
import { useCurrentTime } from "@/components/tldex/tldex-parts"
import { useT } from "@/lib/i18n"

/** TLdex for one stream: a live room, or the archive once the stream has ended. */
export default function TlPanel(props: TlPanelProps) {
  const { t } = useT()
  const currentTime = useCurrentTime(props.sourceCellId)
  const { video } = props

  // Members-only translations are for people who can actually play the video.
  if (video.topic_id === "membersonly" && currentTime <= 0) {
    return (
      <div
        className={cn("border-b p-3 text-sm", props.className)}
        style={props.style}
      >
        {t("views.multiview.tlMembersOnly")}
      </div>
    )
  }
  return video.status === "upcoming" || video.status === "live" ? (
    <LiveTranslations {...props} />
  ) : (
    <ArchiveTranslations {...props} />
  )
}
