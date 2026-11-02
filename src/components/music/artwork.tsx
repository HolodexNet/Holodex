import { useState, type CSSProperties } from "react"
import { cn } from "cn"
import { MusicNotesFillIcon, RadioIcon } from "@/components/icons"

/** Keep unavailable channel artwork from leaving broken images in the catalog. */
export function MusicArtwork({
  src,
  radio = false,
  title,
  seed = title || "musicdex",
  label,
  className,
  priority = false,
}: {
  src?: string
  radio?: boolean
  title?: string
  seed?: string
  label?: string
  className?: string
  priority?: boolean
}) {
  const [failed, setFailed] = useState<string>()
  const hasImage = !!src && failed !== src
  const mix = !!label && !radio
  const tone = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 5
  return (
    <div
      className={cn(
        "music-artwork",
        radio && "music-artwork-radio",
        mix && "music-artwork-mix",
        className
      )}
      data-tone={tone}
      style={{ "--art-tone": tone } as CSSProperties}
    >
      <div className="music-artwork-fallback" aria-hidden="true">
        <span className="music-artwork-orbit" />
        {radio ? <RadioIcon /> : <MusicNotesFillIcon />}
        {!hasImage && title && !label && <strong>{title}</strong>}
      </div>
      {(!mix || hasImage) && (
        <div className="music-artwork-image">
          {hasImage && (
            <img
              src={src}
              alt=""
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : undefined}
              decoding="async"
              onError={() => setFailed(src)}
              className="size-full object-cover"
            />
          )}
        </div>
      )}
      {radio && !hasImage && (
        <span className="music-record-center" aria-hidden="true" />
      )}
      {label && (
        <span className="music-artwork-label" aria-hidden="true">
          {label}
        </span>
      )}
    </div>
  )
}
