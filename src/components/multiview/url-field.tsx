import { useId, useState, type FormEvent } from "react"

import { CheckIcon } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useT } from "@/lib/i18n"
import { parseVideoUrl } from "@/lib/multiview/stream"
import type { MultiviewVideo } from "@/lib/multiview/types"
import { useMultiview } from "@/stores/multiview"

const PLACEHOLDERS = {
  youtube: "https://www.youtube.com/watch?v=...",
  twitch: "https://www.twitch.tv/...",
}

/** A pasted link, with the last few offered again. */
export function UrlField({
  provider,
  onVideo,
  compact,
}: {
  provider: "youtube" | "twitch"
  onVideo: (video: MultiviewVideo) => void
  compact?: boolean
}) {
  const { t } = useT()
  const listId = useId()
  const [url, setUrl] = useState("")
  const [error, setError] = useState(false)
  const history = useMultiview((s) => s.urlHistory[provider])
  const addUrlHistory = useMultiview((s) => s.addUrlHistory)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const video = parseVideoUrl(url)
    if (!video) {
      setError(true)
      return
    }
    setError(false)
    addUrlHistory(provider, url.trim())
    setUrl("")
    onVideo(video)
  }

  return (
    <form
      onSubmit={submit}
      className="flex min-w-0 flex-1 items-center gap-1.5"
    >
      <Input
        value={url}
        onChange={(event) => {
          setUrl(event.target.value)
          setError(false)
        }}
        list={listId}
        placeholder={PLACEHOLDERS[provider]}
        aria-label={t("views.multiview.video.addCustomVideo")}
        aria-invalid={error}
        className={compact ? "h-8 min-w-0 flex-1" : "min-w-0 flex-1"}
      />
      <datalist id={listId}>
        {[...history].reverse().map((entry) => (
          <option key={entry} value={entry} />
        ))}
      </datalist>
      <Button
        type="submit"
        size={compact ? "icon-sm" : "icon"}
        aria-label={t("views.multiview.video.addCustomVideo")}
      >
        <CheckIcon />
      </Button>
    </form>
  )
}
