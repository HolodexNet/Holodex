import type { SVGProps } from "react"

type IconProps = SVGProps<SVGSVGElement>
const base = {
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": true,
} as const
export function PauseIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 4h4v16H6zm8 0h4v16h-4z" />
    </svg>
  )
}
export function PreviousIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 5h2v14H5zm3 7 11-7v14z" />
    </svg>
  )
}
export function NextIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M17 5h2v14h-2zM5 5l11 7-11 7z" />
    </svg>
  )
}
export function ShuffleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M16 3h5v5l-1.7-1.7-3.4 3.4-1.4-1.4 3.4-3.4L16 3zM3 6h3.2c1.1 0 2.1.5 2.8 1.4l6.6 8.2c.3.3.6.4 1 .4h1.5l-2.1-2H21v5l-1.7-1.7-.1.1h-2.6c-1.1 0-2.1-.5-2.8-1.4L7.2 7.9A1.3 1.3 0 0 0 6.2 7H3V6zm0 10h3.2c.4 0 .7-.2 1-.5l2.3-2.9 1.3 1.6-2.1 2.6A3.4 3.4 0 0 1 6.2 18H3v-2z" />
    </svg>
  )
}
export function FullscreenIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 4h7v2H6v5H4zm9 0h7v7h-2V6h-5zM4 13h2v5h5v2H4zm14 0h2v7h-7v-2h5z" />
    </svg>
  )
}
