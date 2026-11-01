import { useState } from "react"
import curtainArtwork from "@/assets/graduation-curtain.svg"
import type { Channel } from "@/lib/types"
import { channelPhoto } from "@/lib/video"

/** Keep the fabric's lighting while taking color from the channel's artwork. */
export function ChannelCurtain({
  channel,
  banner,
}: {
  channel: Channel
  banner: string | null
}) {
  const [failed, setFailed] = useState<Set<string>>(() => new Set())
  const artwork = [banner, channelPhoto(channel, 64)].find(
    (src): src is string => !!src && !failed.has(src)
  )

  return (
    <div className="absolute inset-0 isolate overflow-hidden bg-complement-soft">
      {artwork && (
        <img
          src={artwork}
          alt=""
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="absolute inset-0 size-full scale-150 object-cover blur-2xl saturate-150"
          onError={() => setFailed((sources) => new Set(sources).add(artwork))}
        />
      )}
      {/* Isolate the blend from the card's text and preserve the SVG's lighting. */}
      <img
        src={curtainArtwork}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full object-fill mix-blend-luminosity"
      />
    </div>
  )
}
