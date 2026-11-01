import { useState } from "react"
import curtainTexture from "@/assets/graduation-curtain.webp"
import type { Channel } from "@/lib/types"
import { channelPhoto } from "@/lib/video"

/** Closed fabric, dyed with the artwork's colors without reading remote pixels. */
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
      {/* Luminosity keeps the fabric relief and takes hue from the blurred art.
          A separate isolated layer also keeps the blend off the card's text. */}
      <img
        src={curtainTexture}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full object-cover mix-blend-luminosity"
      />
    </div>
  )
}
