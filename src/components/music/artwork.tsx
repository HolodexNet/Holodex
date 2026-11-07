import { useState, type CSSProperties, type ReactNode } from "react"
import { cn } from "cn"
import {
  LogoTwitchIcon,
  MusicNotesFillIcon,
  RadioIcon,
} from "@/components/icons"
import { OrgIcon, orgIconSrc } from "@/components/layout/org-selector"
import { useOrgs } from "@/lib/queries"
import type { Org } from "@/lib/types"

/** The feed's icon for these orgs is one member's avatar, not a shared logo. */
const JACKET_EDITIONS: Partial<Record<string, "indie" | "twitch">> = {
  Independents: "indie",
  "Twitch Independents": "twitch",
}

/** The pressed-CD jacket for an org's "Best of" mix; music.css draws the print. */
function BestOfJacket({
  org,
  tone,
  className,
  children,
}: {
  org: string
  tone: number
  className?: string
  children: ReactNode
}) {
  const orgs = useOrgs()
  const edition = JACKET_EDITIONS[org]
  const resolved: Org = orgs.data?.find((item) => item.name === org) ?? {
    name: org,
  }
  return (
    <div
      className={cn("music-artwork music-jacket", className)}
      data-tone={tone}
      data-edition={edition}
      style={
        !edition && resolved.icon
          ? ({
              "--org-icon": `url("${orgIconSrc(resolved.icon, 200)}")`,
            } as CSSProperties)
          : undefined
      }
    >
      <div className="music-jacket-art">
        {children || <span className="music-artwork-orbit" />}
      </div>
      <div className="music-jacket-obi" aria-hidden="true">
        <span className="music-jacket-mark">
          {edition === "indie" ? (
            <span className="music-jacket-stamp">INDIE</span>
          ) : edition === "twitch" ? (
            <LogoTwitchIcon />
          ) : (
            <OrgIcon org={resolved} size={200} />
          )}
        </span>
        <span className="music-jacket-type">
          <strong>Best of</strong>
          <small>{org}</small>
        </span>
      </div>
    </div>
  )
}

/** Keep unavailable channel artwork from leaving broken images in the catalog. */
export function MusicArtwork({
  src,
  radio = false,
  title,
  seed = title || "musicdex",
  label,
  bestOf,
  className,
  priority = false,
}: {
  src?: string
  radio?: boolean
  title?: string
  seed?: string
  label?: string
  /** Organization whose "Best of" mix this is; draws the jacket instead. */
  bestOf?: string
  className?: string
  priority?: boolean
}) {
  const [failed, setFailed] = useState<string>()
  const hasImage = !!src && failed !== src
  const mix = !!label && !radio
  const tone = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 5
  const image = hasImage && (
    <img
      src={src}
      alt=""
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      onError={() => setFailed(src)}
      className="size-full object-cover"
    />
  )
  if (bestOf)
    return (
      <BestOfJacket org={bestOf} tone={tone} className={className}>
        {image}
      </BestOfJacket>
    )
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
      {(!mix || hasImage) && <div className="music-artwork-image">{image}</div>}
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
