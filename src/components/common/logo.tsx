import { useId } from "react"
import { cn } from "cn"

/** Rounded play-triangle paths of the mark, in the `-2 -2 28 30` viewBox. */
export const LOGO_BACK_PATH =
  "M4.5 2a2 2 0 0 1 3-1.7L23 9.6a2 2 0 0 1 0 3.5L7.6 22.4a2 2 0 0 1-3-1.7V2Z"
export const LOGO_FRONT_PATH =
  "M0 2A2 2 0 0 1 3 .3l15.5 9.3a2 2 0 0 1 0 3.5L3.1 22.4A2 2 0 0 1 0 20.7V2Z"

/** Outline-only rendition of the mark, for decorative backdrops. */
export function LogoOutline({ className }: { className?: string }) {
  return (
    <svg
      viewBox="-2 -2 28 30"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      fill="none"
      strokeLinejoin="round"
      className={className}
    >
      <path d={LOGO_BACK_PATH} className="stroke-complement" strokeWidth={1.6} />
      <path d={LOGO_FRONT_PATH} className="stroke-primary" strokeWidth={1.6} />
    </svg>
  )
}

/** The Holodex mark: a primary play-triangle in front of its complement. */
export function Logo({ className }: { className?: string }) {
  // Unique gradient ids so multiple logos on a page don't collide.
  const id = "logo" + useId().replace(/[^a-zA-Z0-9_-]/g, "")
  const front = `${id}-front`
  const back = `${id}-back`
  return (
    <svg
      viewBox="-2 -2 28 30"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("size-6", className)}
    >
      <defs>
        <linearGradient
          id={front}
          x1="-4.4"
          y1="2.8"
          x2="19.5"
          y2="11.3"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="color-mix(in oklch, var(--primary), var(--primary-foreground) 30%)" />
          <stop offset="1" stopColor="var(--primary)" stopOpacity=".8" />
        </linearGradient>
        <linearGradient
          id={back}
          x1=".2"
          y1="2.8"
          x2="19.3"
          y2="18.5"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="color-mix(in oklch, var(--complement), var(--complement-soft))" />
          <stop offset="1" stopColor="var(--complement)" />
        </linearGradient>
      </defs>
      <path d={LOGO_BACK_PATH} fill={`url(#${back})`} />
      <path d={LOGO_FRONT_PATH} fill={`url(#${front})`} />
    </svg>
  )
}
